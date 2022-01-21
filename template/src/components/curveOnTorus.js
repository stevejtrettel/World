import {
    Vector2,
    CatmullRomCurve3,
    Vector3,
} from "../../../3party/three/build/three.module.js";


import { colorConversion } from "../../../common/shaders/colors/colorConversion.js";

import { ParametricMaterial } from "../../../common/materials/ParametricMaterial.js";
import {ParametricTube} from "../../../common/objects/ParametricTube.js";


let surfaceEqn = {
    x:  `(2.+sin(t))*cos(s)`,
    y: ` cos(t)+0.3*cos(s)*sin(2.*t)*sin(time)`,
    z: `(2.+sin(t))*sin(s)`,
};

function surfacePoint(uv,time){
        let s = uv.x;
        let t = uv.y;

        let x = (2.+Math.sin(t))*Math.cos(s);
        let y = Math.cos(t)+0.3*Math.cos(s)*Math.sin(2.*t)*Math.sin(time);
        let z = (2.+Math.sin(t))*Math.sin(s);

        return new Vector3(x,y,z);
}


function curvePoint(t, time){

    let u = Math.sin(6.29*t)*Math.sin(time/2)+(time/5-Math.sin(time/5));
    let v = 6.29*t+4.*Math.sin(time);

    return new Vector2(u,v);
}


function createCurve(time){
    let pts = [];
    let uv,p;
    for(let i=0;i<101;i++){
        uv=curvePoint(i/100.,time);
        p=surfacePoint(uv,time);
        pts.push(p);
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









class CurveOnTorus {

    constructor(){

        this.torus = new ParametricMaterial([100,100], vert, frag, {}, options);
        this.torus.material.transmission=0.25;
        this.torus.material.opacity=1.;


        let curve =createCurve(0);
        this.curve = new ParametricTube(curve, curveOptions, frag_Curve, {}, options);
    }


    addToScene( scene ){
        this.torus.addToScene(scene);
        this.curve.addToScene(scene);
    }

    addToUI(ui){

    }

    tick(time, dTime){
        this.torus.tick(time,dTime);
        this.curve.tick(time,dTime);

        this.curve.resetCurve(createCurve(time));
    }

}


const curveOnTorus = new CurveOnTorus();

export{ curveOnTorus };
