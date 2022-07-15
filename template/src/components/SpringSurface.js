import {ComputeMaterial} from "../../../common/materials/ComputeMaterial.js";
import {SpringGrid} from "./SpringDissipative.js";
import {globals} from "../globals.js";





let options = {
    mass:0.1,
    springConst: 20,
    gridSpacing : 0.5,
    linearDrag : 0.25,
};

let springSystem = new SpringGrid([128,64], options, globals.renderer);
springSystem.setIterations(20);
springSystem.integrator.initialize();

//the compute system is springSystem.computer















const vertAux = ``;

//can use any of the variables in the compute system
//need  a function vec3 displace(vec2 uv)
//uv takes values in (0,1)^2
const displace = `
vec3 displace( vec2 uv ){
    return texture(positionX, uv).xyz;
}
`;


let fragAux=``;

let fragColor=`   vec3 fragColor(){

    return vec3(0.8,0.6,0.6);

    }`;

let matOptions = {
    clearcoat:1.,
    metalness:0.0,
    roughness:0.1,
};


let vert = {
    aux: vertAux,
    displace: displace,
};

let frag = {
    aux: fragAux,
    fragColor: fragColor,
};

let matUniforms = {
};

let surface = new ComputeMaterial(springSystem.integrator.computer, matUniforms, vert, frag, matOptions);

export default {
    spring: springSystem,
   surf: surface,
} ;
