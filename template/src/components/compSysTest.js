import { ComputeSystem } from "../../../common/gpgpu/ComputeSystem.js";
import { CSQuad } from "../../../common/gpgpu/displays/CSQuad.js";
import{ globals } from "../globals.js";
import {CSParticle} from "../../../common/gpgpu/displays/CSParticle.js";


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
            vec3 col = vec3 (uv,0.02*sin(frameNumber/20.)+0.011*h);
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
            vec3 col = vec3 (uv,0.);
            gl_FragColor = vec4(0,0,0,1.);
        }`;


let posShaders = {initialization: shaderUniforms+posIniShader,simulation: shaderUniforms+posSimShader};
let velShaders = {initialization: shaderUniforms+velIniShader,simulation: shaderUniforms+velSimShader};

let shaders = {pos:posShaders, vel: velShaders};
let uniforms = {};

let res = [512,512];

//build the compute system
let CSys = new ComputeSystem(shaders, uniforms, res, globals.renderer);

//set up its display:
let ComputeSysDisplay = new CSQuad(CSys);

//set up a particle system:
const particleSys = new CSParticle( CSys, 'pos' );


export {CSys, ComputeSysDisplay, particleSys };
