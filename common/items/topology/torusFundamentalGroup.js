import {
    Vector2,
    CatmullRomCurve3,
    Vector3,
} from "../../../3party/three/build/three.module.js";


import { colorConversion } from "../../shaders/colors/colorConversion.js";

import { ParametricMaterial } from "../../materials/ParametricMaterial.js";
import {ParametricTube} from "../../materials/ParametricTube.js";


let surfaceEqn = {
    x:  `(2.+sin(t))*cos(s)`,
    y: ` cos(t)`,
    z: `(2.+sin(t))*sin(s)`,
};

function surfacePoint(uv,time){
    let s = uv.x;
    let t = uv.y;

    let x = (2.+Math.sin(t))*Math.cos(s);
    let y = Math.cos(t);
    let z = (2.+Math.sin(t))*Math.sin(s);

    return new Vector3(x,y,z);
}


function curvePoint(s, p, q, time){

    const PI=3.14159;

    let u = p*s;
    let v = q*s;

    //rescale to the domain
    u *= 2*PI;
    v *= 2*PI;

    //deform the point (u,v):
    u += Math.sin(6.29*s)*Math.sin(time/2)+(time/5-Math.sin(time/5));
    v += Math.cos(6.29*s)*Math.sin(time/2)+Math.sin(time)+(time/7-Math.sin(time/7));

    //return the result
    return new Vector2(u,v);
}


function createCurve(p,q,time){
    let pts = [];
    let uv,pos;
    for(let i=0;i<101;i++){
        uv=curvePoint(i/100.,p,q,time);
        pos=surfacePoint(uv,time);
        pts.push(pos);
    }
    return new CatmullRomCurve3(pts);
}









const curveOptions = {
    segments: 512,
    radius: 0.1,
    tubeRes: 16,
};


let fragAux_Curve = colorConversion;

//need to make a function vec3 fragColor();
//have available as varyings vPosition, vUv and vNormal
let fragColor_Curve = `
vec3 fragColor(){

    float hue = 0.15*sin(6.29*vUv.x)+0.8;

   vec3 baseColor = hsb2rgb(vec3(hue, 0.65, 0.75));
   return baseColor;

}
`;


let frag_Curve = {
    aux: fragAux_Curve,
    fragColor: fragColor_Curve,
};











//origV has its two xy components in (0,1)
let displace = `
vec3 displace( vec2 uv ){

    float s =2.*PI*uv.x;
    float t = 2.*PI*uv.y;
    
    vec3 q = vec3(
        ${surfaceEqn.x},
        ${surfaceEqn.y},
        ${surfaceEqn.z}
        );
    
    return q;
}
`;



//draw a coordinate grid on top of the final torus

let coordLines = `
float coordLines(vec2 freq, vec2 uv){

    float s = uv.x;
    float t = uv.y;

    float coordS = abs( sin(2.*PI * freq.x * s) );
    float coordT = abs( sin(2.*PI * freq.y * t) );
    
    float bright = abs( log( coordS ) + log( coordT ) );
    bright = clamp( 0.5  * bright, 0., 1. );

    return bright;
}
`;




let fragAux = colorConversion+coordLines;

//need to make a function vec3 fragColor();
//have available as varyings vPosition, vUv and vNormal
let fragColor = `
vec3 fragColor(){


    float hue = 0.1*sin(6.29*(vUv.x+vUv.y))+0.5;
    float cLines = coordLines(vec2(5),vUv);
    float sat = 0.65;
    float light = 0.75+0.25*cLines;
   
    vec3 baseColor = hsb2rgb(vec3(hue,sat, light));
   
    return baseColor;
}
`;



let vert = {
    aux: ``,
    displace: displace,
}

let frag = {
    aux: fragAux,
    fragColor: fragColor,
}


let options = {
    clearcoat:1,
    metalness:0.2,
    roughness:0.1,
}









class TorusFundamentalGroup {

    constructor(){

        this.torus = new ParametricMaterial([100,100], vert, frag, {}, options);
        this.torus.material.transmission=0.25;
        this.torus.material.opacity=1.;

        let curve =createCurve(0,0,0);
        this.curve = new ParametricTube(curve, curveOptions, frag_Curve, {}, options);
        this.params ={p:1,q:1};
    }


    addToScene( scene ){
        this.torus.addToScene(scene);
        this.curve.addToScene(scene);
    }

    addToUI(ui){
        ui.add(this.params, 'p',0,5,1);
        ui.add(this.params, 'q',0,5,1);
    }

    tick(time, dTime){
        this.torus.tick(time,dTime);
        this.curve.tick(time,dTime);

        this.curve.resetCurve(createCurve(this.params.p, this.params.q,time));
    }

}


const item = new TorusFundamentalGroup();

export default { item } ;
