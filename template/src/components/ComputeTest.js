import { ComputeShader } from "../../../common/gpgpu/ComputeShader.js";
import { ComputeSystem } from "../../../common/gpgpu/ComputeSystem.js";
import { CsQuad, CsysQuad } from "../../../common/gpgpu/displays/CsQuad.js";
import { CsParticles } from "../../../common/gpgpu/displays/CsParticles.js";

import { randomFns } from "../../../common/shaders/math/random.js";
import {rk4_vec3 as rk4 } from "../../../common/shaders/odes/rk4.js";

import { globals } from "../globals.js";


const width =1024;
const height = 1024;
const res = [width,height];




const iniCodeUniforms = `
    uniform vec2 res;
`;


const iniCodeMain = `
        void main() {
                //normalized coords in (0,1)
                vec2 uv = gl_FragCoord.xy/res;
                
                //get a random seed for the pixel
                seed = randomSeed(gl_FragCoord.xy,1.);
                
                //grab a random unit vector for each pixel:
                vec3 sph = randomUnitVec3();
                
                //make a random point in the ball instead:
                float x = randomFloat();
                float rad = pow(x,1.333);
                vec3 ball = sph*rad;
                
                //make the initial position
                vec3 iniPos = 1.*sph + vec3(0.,0.,2.);
           
                //send result to data texture
                gl_FragColor = vec4(iniPos,1.0);
        }
`;







const simCodeUniforms = `
          uniform float frameNumber;
          uniform vec2 res;
          uniform sampler2D data;
          uniform int choice;
          uniform float a;
          uniform float b;
          uniform float c;
          uniform float d;
          uniform float e;
          uniform float f;
          
          //set the temporal resolution of the simulation
          float dt=0.01;
`;




const vecField = `
    //choose the vector field based on a uniform: choice
    
    vec3 vecField( vec3 p ) {
        float A = 0.95;
        float B = 0.7;
        float C = 0.6;
        float D = 3.5;
        float E = 0.25;
        float F = 0.1;
                
        float x = p.x;
        float y = p.y;
        float z = p.z;
                    
        float vx = (z-B) * x - D*y;
        float vy = D*x + (z-B)*y;
        float vz = C + A*z - z*z*z/3. - (x*x+y*y)*(1.+E*z) + F*z*x*x*x;
                
        return vec3(vx,vy,vz);
    }
`;


const simCodeMain = `
void main()
        //takes in gl_FragCoord, outputs gl_FragColor
        {   
            // Normalized pixel coordinates (from 0 to 1)
            vec2 uv = gl_FragCoord.xy/res;
            
            //random seed if needed:
            seed = randomSeed(gl_FragCoord.xy, frameNumber);
            
            //get data from the last frame
            vec3 p = texture2D( data, uv ).xyz;
         
            //update via RK, using the provided vecField
            vec3 q = rk4(p, dt);

            // Output to data texture
            gl_FragColor = vec4(q, 1.0);
        }
`;






const iniCode = iniCodeUniforms+randomFns+iniCodeMain;


const simCode = simCodeUniforms+randomFns+vecField+rk4+simCodeMain;



const uniforms = {
    initialization : iniCodeUniforms,
    simulation : simCodeUniforms,
};


const shaders = {
    initialization: iniCode,
    simulation : simCode,
};

//
// const initialCondition = {
//     shader: iniCode,
//     uniforms: {},
// };
//
//

// const simulation = {
//     shader: simCode,
//     uniforms: {},
// };
//

//make the compute shader
const CS = new ComputeShader( shaders, uniforms, res, globals.renderer);


const particleSys = new CsParticles( CS );
const displayQuad = new CsQuad( CS );

export {displayQuad, particleSys};
