import { ComputeSystem } from "../../../common/gpgpu/ComputeSystem.js";
import { CSQuad } from "../../../common/gpgpu/displays/CSQuad.js";
import{ globals } from "../globals.js";
import {CSParticle} from "../../../common/gpgpu/displays/CSParticle.js";




//
//
// let shaderUniforms = `
//     uniform vec2 res;
//     uniform float frameNumber;
//     uniform sampler2D real;
//     uniform sampler2D imaginary;
//     uniform sampler2D probability;
// `;
//
//
//
//
//
//
//
// let realIni = shaderUniforms+`
//          void main() {
//             vec2 uv = gl_FragCoord.xy / res;
//             float h = sin(10.*uv.x);
//             gl_FragColor=vec4(uv,h,1);
//             }
// `;
//
// let realSim = shaderUniforms+`
//         void main(){
//             vec2 uv = gl_FragCoord.xy/res;
//             vec3 p = texture2D(real,uv).xyz;
//             float h = p.z;
//             vec3 col = vec3 (uv,0.02*sin(frameNumber/20.)+0.011*h);
//             gl_FragColor = vec4(col,1.);
//         }
// `;
//
// let imaginaryIni = shaderUniforms+`
//          void main() {
//             gl_FragColor=vec4(0,0,0,1);
//             }
// `;
//
//
// let imaginarySim = shaderUniforms+`
//         void main(){
//             vec2 uv = gl_FragCoord.xy/res;
//             vec3 col = vec3 (uv,0.);
//             gl_FragColor = vec4(0,0,0,1.);
//         }`;
//
//
//
// let magnitudeShader = shaderUniforms+`
//     void main(){}
// `;
//
//
// let realShaders = {initialization: imaginaryIni, simulation: imaginarySim};
// let imaginaryShaders = {initialization: realIni, simulation: realSim};
// let magnitudeShaders = {initialization: magnitudeShader, simulation: magnitudeShader}
//
//
//
// let shaders = {real: realShaders, imaginary: imaginaryShaders, magnitude: magnitudeShaders};
// let uniforms = {};
//
//
//



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
let QMSolver = new ComputeSystem( shaders, uniforms, res, globals.renderer );

//set up its display:
let QMDisplay = new CSQuad( QMSolver );

//set up a particle system:
const QMParticlesMag = new CSParticle( QMSolver, 'vel' );













const qm = {
    solver: QMSolver,
    display: QMDisplay,
    particles: QMParticlesMag,
};

export { qm };
