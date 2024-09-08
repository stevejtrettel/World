import {
    SphereGeometry,
    MeshPhysicalMaterial,
    Vector2,
    CatmullRomCurve3,
    Vector3,
    Mesh,
} from "../../../3party/three/build/three.module.js";


import { colorConversion } from "../../../code/shaders/colors/colorConversion.js";

import ParametricMaterial from "../../../code/compute/materials/ParametricMaterial.js";
import ParametricTube from "../../../code/compute/materials/ParametricTube.js";


let surfaceEqn = {
    x:  `R*sin(u)`,
    y: ` v`,
    z: `R*(1.-cos(u))`,
};

function surfacePoint(uv,roll){

    let R = 1./roll;

    let u = uv.x;
    let v = uv.y;

    let x =R*Math.sin(u);
    let y =v;
    let z = R*(1-Math.cos(u));

    return new Vector3(x,y,z);
}


function curvePoint(t, roll){

    let u = 6.29*(t-0.5)*roll;
    let v = 0.;

    return new Vector2(u,v);
}


function createCurve(roll){
    let pts = [];
    let uv,p;
    for(let i=0;i<101;i++){
        uv=curvePoint(i/100.,roll);
        p=surfacePoint(uv,roll);
        pts.push(p);
    }
    return new CatmullRomCurve3(pts);

}









const curveOptions = {
    segments: 64,
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

    float R = 1./roll;

    float u =2.*PI*(uv.x-0.5)*roll;
    float v = 2.*PI*uv.y-PI;
    

    
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









class CuttingCylinder {

    constructor(){

        this.params = {
            roll:1,
        }

        let cylUniforms ={
            roll:{
                value:1,
                type:'float',
                range:[0,1,0.01]
            }
        };

        this.cylinder = new ParametricMaterial([64,64], vert, frag, cylUniforms , options);
        this.cylinder.material.transmission=0.25;
        this.cylinder.material.opacity=1.;


        this.path = createCurve(1);
        this.curve = new ParametricTube(this.path, curveOptions, frag_Curve, {}, options);







        let ballGeom = new SphereGeometry(0.2,16,16);
        let ballMat = new MeshPhysicalMaterial(options);


        this.ball1 = new Mesh(ballGeom, ballMat);
        this.ball2 = new Mesh(ballGeom, ballMat);

        const startPt = this.path.getPoint(0);
        const endPt = this.path.getPoint(1);
        this.ball1.position.set(startPt.x,startPt.y,startPt.z);
        this.ball2.position.set(endPt.x,endPt.y,endPt.z);

    }


    addToScene( scene ){
        this.cylinder.addToScene(scene);
        this.curve.addToScene(scene);
        scene.add(this.ball1);
        scene.add(this.ball2);
    }

    addToUI(ui){
        ui.add(this.params, 'roll', 0.01,1,0.01);
    }

    tick(time, dTime){
        this.cylinder.tick(time,dTime);
        this.cylinder.uniforms.roll.value=this.params.roll;

        this.curve.tick(time,dTime);
        this.path = createCurve(this.params.roll);
        this.curve.resetCurve(this.path);

        const startPt = this.path.getPoint(0);
        const endPt = this.path.getPoint(1);
        this.ball1.position.set(startPt.x,startPt.y,startPt.z);
        this.ball2.position.set(endPt.x,endPt.y,endPt.z);
    }

}

export default CuttingCylinder;
