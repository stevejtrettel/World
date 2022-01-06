// import { ComputeSystem } from "../../../common/gpgpu/ComputeSystem.js";
// import { ParticleSystem} from "../../../common/materials/ParticleSystem.js";
//
// import { globals } from "../globals.js";
// import {randomFns} from "../../../common/shaders/math/random.js";
// import {rk4_vec3 as rk4} from "../../../common/shaders/odes/rk4.js";
// import {CSParticle} from "../../../common/gpgpu/displays/CSParticle.js";
//
//
//
//
// //Build the compute system
//
// const res = [512,512];
//
//
// const computeVariables = ['pos'];
//
//
// //can use these in either shader
// let computeUniforms = {
//     dt:
//         {
//             type:'float',
//             value: 0.01,
//             range:[0,0.2,0.005]
//         },
// };
//
// const ini = `
//         void main() {
//                 //normalized coords in (0,1)
//                 vec2 uv = gl_FragCoord.xy/res;
//
//                 //get a random seed for the pixel
//                 seed = randomSeed(gl_FragCoord.xy,1.);
//
//                 //grab a random unit vector for each pixel:
//                 vec3 sph = randomUnitVec3();
//
//                 //make a random point in the ball instead:
//                 float x = randomFloat();
//                 float rad = pow(x,1.333);
//                 vec3 ball = sph*rad;
//
//                 //make the initial position
//                 vec3 iniPos = 1.*sph + vec3(0.,0.,2.);
//
//                 //send result to data texture
//                 gl_FragColor = vec4(iniPos,1.0);
//         }
// `;
//
// const vecField = `
//     //choose the vector field based on a uniform: choice
//
//     vec3 vecField( vec3 p ) {
//         float A = 0.95;
//         float B = 0.7;
//         float C = 0.6;
//         float D = 3.5;
//         float E = 0.25;
//         float F = 0.1;
//
//         float x = p.x;
//         float y = p.y;
//         float z = p.z;
//
//         float vx = (z-B) * x - D*y;
//         float vy = D*x + (z-B)*y;
//         float vz = C + A*z - z*z*z/3. - (x*x+y*y)*(1.+E*z) + F*z*x*x*x;
//
//         return vec3(vx,vy,vz);
//     }
// `;
//
//
// const sim = `
// void main()
//         //takes in gl_FragCoord, outputs gl_FragColor
//         {
//             // Normalized pixel coordinates (from 0 to 1)
//             vec2 uv = gl_FragCoord.xy/res;
//
//             //random seed if needed:
//             seed = randomSeed(gl_FragCoord.xy, frameNumber);
//
//             //get data from the last frame
//             vec3 p = texture2D( pos, uv ).xyz;
//
//             //update via RK, using the provided vecField
//             vec3 q = rk4(p, dt);
//
//             // Output to data texture
//             gl_FragColor = vec4(q, 1.0);
//         }
// `;
//
//
//
// const posIni = randomFns+ini;
//
// const posSim = randomFns+vecField+rk4+sim;
//
//
// const computeShaders= {
//     pos: {
//         initialization: posIni,
//         simulation: posSim,
//     }
// };
//
//
//
// const computePos = new ComputeSystem(
//     computeVariables,
//     computeShaders,
//     computeUniforms,
//     res,
//     globals.renderer
// );
// computePos.setName( 'Integrator' );
//
//
//
// const testParticles = new CSParticle( computePos );
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
// //Build the particle simulation
//
//
// //the usable uniforms are those of the compute system:
// //pos - the position shader
// //frameNumber - time parameter
//
// //also a new one, measuring dot size:
// //size
//
// const particleUniforms = {
//     size:
//         {
//             type:'float',
//             value: 1.,
//             range:[1.,2.,0.01]
//         },
// };
//
// const particleVertex = `
// void main() {
//     //the mesh is a square so the uvs = the xy positions of the vertices
//     vec3 particlePosition = texture2D( pos, position.xy ).xyz;
//     //pos now contains a 3D position in space, we can use it as a regular vertex
//     //we also export it to the fragment shader
//
//     //regular projection of our position
//     gl_Position = projectionMatrix * modelViewMatrix * vec4( particlePosition, 1.0 );
//
//     //sets the point size
//     gl_PointSize = size;
// }`;
//
//
// const particleFragment = `
// uniform sampler2D data;//RenderTarget containing the transformed positions
//
// void main()
// {
//     gl_FragColor = vec4( vec3(1.), .15 );
// }`;
//
// const options = {};
//
//
// const particleDisplay = new ParticleSystem(
//     computePos,
//     particleUniforms,
//     particleVertex,
//     particleFragment,
//     options
// );
// particleDisplay.setName('Particles');
//
//
//
//
//
// const pentagramMap = {
//     compute: computePos,
//     display: particleDisplay,
// }
//
//
// // export{ pentagramMap };
