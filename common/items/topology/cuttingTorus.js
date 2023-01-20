import {
    SphereGeometry,
    MeshPhysicalMaterial,
    Vector2,
    CatmullRomCurve3,
    Vector3,
    Mesh,
} from "../../../3party/three/build/three.module.js";


import { colorConversion } from "../../shaders/colors/colorConversion.js";

import { ParametricMaterial } from "../../materials/ParametricMaterial.js";
import {ParametricTube} from "../../materials/ParametricTube.js";


let surfaceEqn = {
    x:  `(1.+RU)-(1.+RU+RV*sin(v))*cos(u)`,
    y: ` RV*(1.-cos(v))`,
    z: `(1.+RU+RV*sin(v))*sin(u)`,
};

function surfacePoint(uv,rollU, rollV){

    let RU = 1./rollU;
    let RV = 1./rollV;

    let u = uv.x;
    let v = uv.y;

    let x =(1.+RU)-(1.+RU+RV*Math.sin(v))*Math.cos(u);
    let y = RV*(1.-Math.cos(v));
    let z = (1.+RU+RV*Math.sin(v))*Math.sin(u);

    return new Vector3(x,y,z);
}


function curve1Point(t, rollU,rollV){

    let u = 6.29*(t-0.5)*rollU;
    let v = 0.;

    return new Vector2(u,v);
}


function createCurve1(rollU, rollV){
    let pts = [];
    let uv,p;
    for(let i=0;i<101;i++){
        uv=curve1Point(i/100.,rollU,rollV);
        p=surfacePoint(uv,rollU,rollV);
        pts.push(p);
    }
    return new CatmullRomCurve3(pts);

}

function curve2Point(t, rollU,rollV){

    let u = 0.;
    let v = 6.29*(t-0.5)*rollV;
    return new Vector2(u,v);
}


function createCurve2(rollU, rollV){
    let pts = [];
    let uv,p;
    for(let i=0;i<101;i++){
        uv=curve2Point(i/100.,rollU,rollV);
        p=surfacePoint(uv,rollU,rollV);
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

    float RU = 1./rollU;
    float RV = 1./rollV;

    float u =2.*PI*(uv.x-0.5)*rollU;
    float v = 2.*PI*(uv.y-0.5)*rollV;
    

    
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









class CuttingTorus {

    constructor(){

        this.params = {
            rollU:1,
            rollV:1,
        }

        let cylUniforms ={
            rollU:{
                value:1,
                type:'float',
                range:[0,1,0.01]
            },
            rollV:{
                value:1,
                type:'float',
                range:[0,1,0.01]
            }
        };

        this.cylinder = new ParametricMaterial([64,64], vert, frag, cylUniforms , options);
        this.cylinder.material.transmission=0.25;
        this.cylinder.material.opacity=1.;


        this.path1 = createCurve1(1,1);
        this.curve1 = new ParametricTube(this.path1, curveOptions, frag_Curve, {}, options);

        this.path2 = createCurve2(1,1);
        this.curve2 = new ParametricTube(this.path2, curveOptions, frag_Curve, {}, options);


        let ballGeom = new SphereGeometry(0.2,16,16);
        let ballMat = new MeshPhysicalMaterial(options);


        this.ball1S = new Mesh(ballGeom, ballMat);
        this.ball1E = new Mesh(ballGeom, ballMat);

        this.ball2S = new Mesh(ballGeom, ballMat);
        this.ball2E = new Mesh(ballGeom, ballMat);

        const start1 = this.path1.getPoint(0);
        const end1 = this.path1.getPoint(1);
        const start2 = this.path2.getPoint(0);
        const end2 = this.path2.getPoint(1);

        this.ball1S.position.set(start1.x,start1.y,start1.z);
        this.ball1E.position.set(end1.x,end1.y,end1.z);
        this.ball2S.position.set(start2.x,start2.y,start2.z);
        this.ball2E.position.set(end2.x,end2.y,end2.z);

    }


    addToScene( scene ){
        this.cylinder.addToScene(scene);
        this.curve1.addToScene(scene);
        this.curve2.addToScene(scene);

         scene.add(this.ball1S);
         scene.add(this.ball2S);
         scene.add(this.ball1E);
         scene.add(this.ball2E);
    }

    addToUI(ui){
        ui.add(this.params, 'rollU', 0.01,1,0.01);
        ui.add(this.params, 'rollV', 0.01,1,0.01);
    }

    tick(time, dTime){
        this.cylinder.tick(time,dTime);
        this.cylinder.uniforms.rollU.value=this.params.rollU;
        this.cylinder.uniforms.rollV.value=this.params.rollV;

        this.curve1.tick(time,dTime);
        this.path1 = createCurve1(this.params.rollU,this.params.rollV);
        this.curve1.resetCurve(this.path1);

        this.curve2.tick(time,dTime);
        this.path2 = createCurve2(this.params.rollU,this.params.rollV);
        this.curve2.resetCurve(this.path2);

        const start1 = this.path1.getPoint(0);
        const end1 = this.path1.getPoint(1);
        this.ball1S.position.set(start1.x,start1.y,start1.z);
        this.ball1E.position.set(end1.x,end1.y,end1.z);

        const start2 = this.path2.getPoint(0);
        const end2 = this.path2.getPoint(1);
        this.ball2S.position.set(start2.x,start2.y,start2.z);
        this.ball2E.position.set(end2.x,end2.y,end2.z);
    }

}


const cuttingTorus = new CuttingTorus();

export default { cuttingTorus };
