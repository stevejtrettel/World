import {ParametricTube} from "../../../common/objects/ParametricTube.js";
import {CatmullRomCurve3, Vector3} from "../../../3party/three/build/three.module.js";
import {colorConversion} from "../../../common/shaders/colors/colorConversion.js";
import {ParametricMaterial} from "../../../common/materials/ParametricMaterial.js";





function createCurve(time){
    let pts = [];
    for(let i=0; i<500; i++){
        let t = 2*6.3*i/100;
        let v = new Vector3( Math.cos(t), Math.sin(t), 0.1*t);
        pts.push(v.clone());
    }
    return new CatmullRomCurve3(pts);
}


const curveOptions = {
    segments: 1024,
    radius: 0.1,
    tubeRes: 32,
};


let uniforms = {};

let fragAux = colorConversion;

//need to make a function vec3 fragColor();
//have available as varyings vPosition, vUv and vNormal
let fragColor = `
vec3 fragColor(){
    
   vec3 baseColor = hsb2rgb(vec3(vUv.x, 0.65, 0.4));
   return baseColor;
    
}
`;


let frag = {
    aux: fragAux,
    fragColor: fragColor,
}


let options = {
    clearcoat:1,
    metalness:0.,
    roughness:0.1,
}




let tube = new ParametricTube(createCurve(0),curveOptions,frag,uniforms, options);
// tube.tick = (time, dTime) => {
//     let newCurve = createCurve(time);
//     tube.resetCurve(newCurve);
// };







const tubeTest = {
    tube: tube,
}

export { tubeTest };
