import { ComputeSystem } from "../../../common/gpgpu/ComputeSystem.js";
import { CsysQuad } from "../../../common/gpgpu/displays/CsQuad.js";
import{ globals } from "../globals.js";




let shaderUniforms = `
    uniform vec2 res;
    uniform float numFrame;
    uniform sampler2D pos;
    uniform sampler2D vel;
`;

let posIniShader =`
         void main() {
            gl_FragColor=vec4(0,1,0,1);
            }
`;

let posSimShader = `
        void main(){
            vec2 uv = gl_FragCoord.xy/res;
            vec3 col = vec3 (uv,uv.x*uv.y);
            gl_FragColor = vec4(1,1,1,1.);
        }
`;

let velIniShader = `
         void main() {
            gl_FragColor=vec4(1,0,0,1);
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
let ComputeSysDisplay = new CsysQuad(CSys);



export {CSys, ComputeSysDisplay };
