import{ globals } from "../globals.js";

import { ComputeSystem } from "../../../common/gpgpu/ComputeSystem.js";
import { CSQuad } from "../../../common/gpgpu/displays/CSQuad.js";
import { CSParticle } from "../../../common/gpgpu/displays/CSParticle.js";
import { ComputeMaterial } from "../../../common/materials/ComputeMaterial.js";


let shaderUniforms = `
    uniform vec2 res;
    uniform float frameNumber;
    uniform sampler2D pos;
    uniform sampler2D vel;
`;

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


















let matUniforms = `
    uniform sampler2D pos;
    uniform sampler2D vel;
    uniform vec2 res;
`;




let vertDefines = matUniforms+`
    float PI = 3.14159;
    varying vec3 vPosition;
    varying vec2 vUv;
    `;


let vertHead = `

vec2 setUV(vec3 params) {

//params arrive in (0,1)^2: so we are good
    return params.xy;
}

vec3 displace(vec3 params){

    vec2 uv = setUV(params);
    float s =2.*PI*uv.x;
    float t = PI*uv.y;
    
    vec3 q = vec3( cos(s)*sin(t), sin(s)*sin(t),cos(t));

    return q;
}



`;


let vertMain = `
//requires a function vec3 displace(vec3) from vertHead
//the required vectors to be defined here are newPos and newNormal

vec3 newPos = displace(position);
vUv = setUV(position);
vPosition = newPos;

float offset = 0.001;
vec3 tangent = vec3(1,0,0);
vec3 bitangent = vec3(0,1,0);
vec3 neighbour1 = position + tangent * offset;
vec3 neighbour2 = position + bitangent * offset;

vec3 displacedNeighbour1 = displace(neighbour1);
vec3 displacedNeighbour2 = displace(neighbour2);

vec3 displacedTangent = displacedNeighbour1 - newPos;
vec3 displacedBitangent = displacedNeighbour2 - newPos;

vec3 newNormal = normalize(cross(displacedTangent, displacedBitangent));
`;








let fragDefines = matUniforms;


let fragHead = `
    varying vec3 vPosition;
    varying vec2 vUv;
    `;


let fragMain = `
vec3 col = texture2D(pos, vUv).xyz;
vec4 newColor = vec4(col, 1.0);
`;



let vert = {
    defines: vertDefines,
    header: vertHead,
    main: vertMain
}


let frag = {
    defines: fragDefines,
    header: fragHead,
    main: fragMain,
}


let options = {
    clearcoat:1,
    metalness:0.2,
    roughness:0.1,
}

let QMSurface = new ComputeMaterial(QMSolver, vert, frag, options);









const qm = {
    qm_solver: QMSolver,
    // qm_display: QMDisplay,
    // qm_particles: QMParticlesMag,
    qm_surf: QMSurface,
};

export { qm };
