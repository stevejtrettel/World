import { ComputeSystem } from "../../../common/gpu/ComputeSystem.js";
import { ComputeParticles} from "../../../common/materials/ComputeParticles.js";

import { globals } from "../globals.js";
import { randomFns } from "../../../common/shaders/math/random.js";
import { allAttractors } from "../../../common/shaders/odes/attractors.js";
import {rk4_vec3 as rk4} from "../../../common/shaders/odes/rk4.js";
import {CSParticle} from "../../../common/gpu/displays/CSParticle.js";




//Build the compute system

const res = [1024, 1024];

const computeVariables = ['pos'];

const computeOptions = {
    res: res,
    resetSwitch: true,
}

//can use these in either shader
let computeUniforms = {
    Attractor: {
        type: 'int',
        value: 0,
        range: [{
            'Aizawa':0,
            'Chen':1,
            'Dadras':2,
            'Rossler':3,
            'Sprott':4,
            'Thomas':5,
        }],
        },

    a:{
        type: 'float',
        value: 0,
        range: [-1,1,0.01],
    },
    b:{
        type: 'float',
        value: 0,
        range: [-1,1,0.01],
    },
    c:{
        type: 'float',
        value: 0,
        range: [-1,1,0.01],
    },
    d:{
        type: 'float',
        value: 0,
        range: [-1,1,0.01],
    },
    e:{
        type: 'float',
        value: 0,
        range: [-1,1,0.01],
    },
    f:{
        type: 'float',
        value: 0,
        range: [-1,1,0.01],
    },
    dt: {
        type:'float',
        value: 0.01,
        range:[0,0.2,0.005]
    },
};

const ini = `
        void main() {
                //normalized coords in (0,1)
                vec2 uv = gl_FragCoord.xy/res;
                
                //get a random seed for the pixel
                seed = randomSeed(gl_FragCoord.xy,1.);
                
                //grab a random unit vector for each pixel:
                vec3 sph = randomUnitVec3();
                
                //make a random point in the ball instead:
                float x = randomFloat();
               // float rad = pow(x,1.333);
                float rad = gaussian();
                vec3 ball = sph*rad;
                
                //make the initial position
                vec3 iniPos = 1.*ball + vec3(0.,0.,2.);
           
                //send result to data texture
                gl_FragColor = vec4(iniPos,1.0);
        }
`;


const vecField = `
    //choose the vector field based on a uniform: chooseAttractor
    
    vec3 vecField( vec3 pos ) {
        switch (Attractor) {
            case 0:
                return aizawa(pos);
            case 1:
                return chen(pos);
            case 2:
                return dadras(pos);
            case 3:
                return rossler(pos);
            case 4:
                return sprott(pos);
            case 5:
                return thomas(pos);
        }
    }
    `;

const sim = `
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
            
            //get the speed at this point:
            float speed = length(vecField(q));

            // Output to data texture
            gl_FragColor = vec4(q, speed);
        }
`;



const posIni = randomFns+ini;

const posSim = randomFns+allAttractors+vecField+rk4+sim;


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

//also a new one, measuring dot size:
//size

const particleUniforms = {
    size:
        {
            type:'float',
            value: 1.,
            range:[1.,2.,0.01]
        },
};

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
    gl_PointSize = size;
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
      
    gl_FragColor = vec4( particleSpeed*particlePosition, opacity );
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


export{ strangeAttractors };
