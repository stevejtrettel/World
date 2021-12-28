
import { ComputeSystem } from "../../../common/gpgpu/ComputeSystem.js";
import { CSParticle } from "../../../common/gpgpu/displays/CSParticle.js";

import { randomFns } from "../../../common/shaders/math/random.js";
import {rk4_vec3 as rk4 } from "../../../common/shaders/odes/rk4.js";

import { globals } from "../globals.js";


const width =1024;
const height = 1024;
const res = [width,height];


const codeUniforms = `
          uniform float frameNumber;
          uniform vec2 res;
          uniform sampler2D pos;
          
          //set the temporal resolution of the simulation
          float dt=0.02;
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
            vec3 p = texture2D( pos, uv ).xyz;
         
            //update via RK, using the provided vecField
            vec3 q = rk4(p, dt);

            // Output to data texture
            gl_FragColor = vec4(q, 1.0);
        }
`;






const iniCode = codeUniforms+randomFns+iniCodeMain;

const simCode = codeUniforms+randomFns+vecField+rk4+simCodeMain;





const uniforms = {};

const shaders={
        initialization: iniCode,
        simulation: simCode,
    };


//make the compute shader
const attractorIntegrator = new ComputeSystem({pos: shaders}, uniforms, res, globals.renderer);

const attractorParticles = new CSParticle( attractorIntegrator, 'position' );


const attractor = {
    integrator: attractorIntegrator,
    particles: attractorParticles,
}



export { attractor };
