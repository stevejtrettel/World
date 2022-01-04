import{ globals } from "../globals.js";

import { ComputeSystem } from "../../../common/gpgpu/ComputeSystem.js";
import { CSQuad } from "../../../common/gpgpu/displays/CSQuad.js";
import { CSParticle } from "../../../common/gpgpu/displays/CSParticle.js";
import { ComputeMaterial } from "../../../common/materials/ComputeMaterial.js";


let shaderUniforms = ``;


let posIniShader =`
         void main() {
            vec2 uv = gl_FragCoord.xy / res;
            float h = sin(10.*uv.x);
            gl_FragColor=vec4(uv,h,1);
            }
`;

let posSimShader = `
        void main(){
            vec2 uv = gl_FragCoord.xy/res;
            vec3 p = texture2D(pos,uv).xyz;
            float h = p.z;
            vec3 col = vec3 (uv,0.001+h);
            gl_FragColor = vec4(col,1.);
        }
`;

let velIniShader = `
         void main() {
            gl_FragColor=vec4(0,0,0,1);
            }
`;


let velSimShader = `        
        void main(){
            vec2 uv = gl_FragCoord.xy/res;
            vec3 p = texture2D(pos,uv).xyz;
            vec3 col = vec3(p.z,p.y,p.x);;
            gl_FragColor = vec4(col,1.);
        }`;


let posShaders = {initialization: shaderUniforms+posIniShader,simulation: shaderUniforms+posSimShader};
let velShaders = {initialization: shaderUniforms+velIniShader,simulation: shaderUniforms+velSimShader};

let shaders = {pos:posShaders, vel: velShaders};
let uniforms = {};



let res = [512,512];

//build the compute system
let QMSolver = new ComputeSystem(
    ['pos','vel'],
    shaders,
    uniforms,
    res,
    globals.renderer
);


//set up its display:
let QMDisplay = new CSQuad( QMSolver );

//set up a particle system:
const QMParticlesMag = new CSParticle( QMSolver );
















let vertAux = ``;

//need  a function vec3 displace(vec3 origV)
let displace = `
vec3 displace(vec3 origV){

    vec2 uv = origV.xy;
    float s =2.*PI*uv.x;
    float t = PI*uv.y;
    
    vec3 q = vec3( cos(s)*sin(t), sin(s)*sin(t),cos(t));

    return q;
}
`;



let fragAux = ``;

//need to make a function vec3 fragColor();
let fragColor = `
vec3 fragColor(){
    return texture2D(pos, vUv).xyz;
}
`;



let options = {
    clearcoat:1,
    metalness:0.2,
    roughness:0.1,
}


let vert = {
    aux: vertAux,
    displace: displace,
}

let frag = {
    aux: fragAux,
    fragColor: fragColor,
}


let QMSurface = new ComputeMaterial(QMSolver, vert, frag, options);









const qm = {
    qm_solver: QMSolver,
     qm_display: QMDisplay,
    // qm_particles: QMParticlesMag,
    qm_surf: QMSurface,
};

export { qm };