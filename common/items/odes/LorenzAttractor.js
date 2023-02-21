import { ComputeSystem } from "../../gpu/ComputeSystem.js";
import { ComputeParticles} from "../../materials/ComputeParticles.js";

import { globals } from "../../World/globals.js";
import { randomFns } from "../../shaders/math/random.js";
import {rk4_vec3 as rk4} from "../../shaders/odes/rk4.js";
import {CSParticle} from "../../gpu/displays/CSParticle.js";
import {NearestFilter} from "../../../3party/three/build/three.module.js";




//Build the compute system

const res = [1024, 1024];

const computeVariables = ['pos'];

const computeOptions = {
    res: res,
    filter: NearestFilter,
    resetSwitch: true,
}

//can use these in either shader
let computeUniforms = {
    // InitialCond: {
    //     type: 'int',
    //     value: 0,
    //     range: [{
    //         'Gaussian':0,
    //         'Uniform':1,
    //         'Sphere':2,
    //     }],
    // },
    sigma:{
        type: 'float',
        value: 10.,
        range: [9,11,0.001],
    },
    beta:{
        type: 'float',
        value: 2.6666,
        range: [1,5,0.001],
    },
    rho:{
        type: 'float',
        value: 28.,
        range: [23,32,0.001],
    },
};

const ini = `
        void main() {
                //normalized coords in (0,1)
                vec2 uv = gl_FragCoord.xy/res;
                ivec2 ij = ivec2(gl_FragCoord.xy);
                
                //get a random seed for the pixel
                seed = randomSeed(gl_FragCoord.xy,1.);
                
                //grab a random unit vector for each pixel:
                vec3 sph = randomUnitVec3();
                
                //make a random point in the ball instead:
                float x = randomFloat();
                float rad=1.;
                // if(InitialCond==0){
                //    rad = gaussian();
                // }
                // else if(InitialCond==1){
                //     rad = pow(x,1.333);
                // }
                // else{
                //     rad = 1.;
                // }
                vec3 ball = sph*rad;
                
                //make the initial position
                vec3 iniPos = 1.*sph + vec3(0.,0.,2.);
           
                //send result to data texture
                gl_FragColor = vec4(iniPos,1.0);
        }
`;


const vecField = `
    //choose the vector field based on a uniform: chooseAttractor
    
    vec3 vecField( vec3 pos ) {
   
                float x = pos.x;
                float y = pos.y;
                float z = pos.z;
                    
                float vx = sigma*(y-x);
                float vy = x*(rho-z)-y;
                float vz = x*y-beta*z;
                
                return vec3(vx,vy,vz);
    }
    `;

const sim = `

float dt = 0.01;
void main()
        //takes in gl_FragCoord, outputs gl_FragColor
        {   
            // Normalized pixel coordinates (from 0 to 1)
            vec2 uv = gl_FragCoord.xy/res;
            ivec2 ij = ivec2(gl_FragCoord.xy);
            
            //random seed if needed:
            seed = randomSeed(gl_FragCoord.xy, frameNumber);
            
            //get data from the last frame
            vec3 p = texelFetch( pos, ij, 0 ).xyz;
         
            //update via RK, using the provided vecField
            vec3 q = rk4(p, dt);
            
            //get the speed at this point:
            float speed = length(vecField(q));

            // Output to data texture
            gl_FragColor = vec4(q, 1.);
        }
`;



const posIni = randomFns+ini;

const posSim = randomFns+vecField+rk4+sim;


const computeShaders= {
    pos: {
        initialization: posIni,
        simulation: posSim,
    }
};



const computePos = new ComputeSystem(
    computeVariables,
    computeShaders,
    computeUniforms,
    computeOptions,
    globals.renderer,
);
computePos.setName( 'Integrator' );



const testParticles = new CSParticle( computePos );


















//Build the particle simulation


//the usable uniforms are those of the compute system:
//pos - the position shader
//frameNumber - time parameter


const particleUniforms = {};

const particleVertex = `

varying vec3 particlePosition;
varying float particleSpeed;

void main() {

    //the mesh is a square so the uvs = the xy positions of the vertices
    //get the output of the compute shader
    vec4 computePos = texture2D(pos, position.xy);
    
    //set the particlePosition and speed from this:
    particlePosition = computePos.xyz;
    particleSpeed = computePos.w;
 
    //regular projection of our position
    gl_Position = projectionMatrix * modelViewMatrix * vec4( particlePosition, 1.0 );
 
    //sets the point size
    gl_PointSize = 1.;
}`;



const particleFragment = `
varying vec3 particlePosition;
varying float particleSpeed;

void main() {

    //need to learn how the key word "discard" works!
    vec2 circCoord = 2.0 * gl_PointCoord - 1.0;
      float d = dot(circCoord, circCoord);
      if (d > 1.0) {
          discard;
      }
    
    //set the opacity of the point:
    float opacity =0.15;
    
    //figure out the color of the point:
    vec3 col = particlePosition;
      
    gl_FragColor = vec4( vec3(1), opacity );
}`;



const options = {};


const particleDisplay = new ComputeParticles(
    computePos,
    particleUniforms,
    particleVertex,
    particleFragment,
    options
);
particleDisplay.setName('Particles');





const strangeAttractors = {
    compute: computePos,
    display: particleDisplay,
}


export default strangeAttractors;
