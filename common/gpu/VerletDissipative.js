import {ComputeSystem} from "./ComputeSystem.js";
import {LinearFilter} from "../../3party/three/build/three.module.js";




//implements the augmentation of standard velocity verlet integration
//with dissapative forces (velocity dependent)
//https://www.sciencedirect.com/science/article/pii/S0010465503002029


//the input is a pair of initial condition shaders, and then two force functions
//forceConservative(ij, posTex, velTex)
//forceDissipative(ij, posTex, velTex)


//components of shaders

const step = `
    const float dt = 0.002;
`;

const fetch = `
    vec4 fetch(sampler2D tex, ivec2 pixel) {
        return texelFetch(tex, pixel, 0);
    }
    `;

const setPixel = `
    ivec2 setPixel(){
        return ivec2(int(gl_FragCoord.x),int(gl_FragCoord.y));
    }
`;







//the shaders used in the integrator

const velocityShader = setPixel + fetch + step + `
    void main(){
        ivec2 pixel = setPixel();
        
        vec4 vel = fetch( velocity2, pixel );
        vec4 fC = fetch( forceConservative, pixel );
        vec4 fD = fetch( forceDissipative2, pixel );
        
        vec4 newVel = vel + 1./(2.*mass)*(fC + fD)*dt;
        
        gl_FragColor = newVel;
    }
`;

const positionShader = setPixel + fetch + step + `
    void main(){
        ivec2 pixel = setPixel();
        
        vec4 vel = fetch( velocity, pixel );
        vec4 pos = fetch( positionX, pixel );
        
        vec4 newPos = pos + vel*dt;
            
        gl_FragColor = newPos;
    }
`;


const velocity2Shader = setPixel + fetch + step + `
    void main(){
        ivec2 pixel = setPixel();
        
        vec4 vel = fetch( velocity, pixel );
        vec4 fC = fetch( forceConservative, pixel );
        vec4 fD = fetch( forceDissipative, pixel );
        
        vec4 newVel = vel + 1./(2.*mass)*(fC + fD)*dt;
        
        gl_FragColor = newVel;
    }
`;



class VerletDissipative {

    constructor(forces, initialCond, uniforms, res, renderer){



        const variables = ['velocity', 'positionX', 'forceConservative', 'forceDissipative', 'velocity2', 'forceDissipative2'];



        const forceConservativeShader = setPixel + fetch + forces.conservative + `
            void main(){
            
                ivec2 pixel = setPixel();
                
                vec4 force = getForceConservative( positionX, velocity, pixel );
                
                gl_FragColor = force;
            }
`;

        const forceDissipativeShader = setPixel + fetch + forces.dissipative + `
            void main(){
            
                ivec2 pixel = setPixel();
                
                vec4 force = getForceDissipative( positionX, velocity, pixel );
                
                gl_FragColor = force;
            }
        `;

        const forceDissipative2Shader = setPixel + fetch + forces.dissipative + `
            void main(){
            
                ivec2 pixel = setPixel();
                
                vec4 force = getForceDissipative( positionX, velocity2, pixel );
                
                gl_FragColor = force;
                
            }
        `;

        const shaders = {

            velocity:{
                simulation: velocityShader,
                initialization: initialCond.velocity,
            },

            positionX: {
                simulation: positionShader,
                initialization: initialCond.position,
            },

            forceConservative: forceConservativeShader,

            forceDissipative: forceDissipativeShader,

            velocity2: {
                simulation: velocity2Shader,
                initialization: initialCond.velocity,
            },

            forceDissipative2: forceDissipative2Shader,
        };


        const options = {
            res: res,
            filter:LinearFilter,
        };

        this.computer = new ComputeSystem(variables, shaders, uniforms, options, renderer);

        this.iterations=1;

    }

    initialize(){
        this.computer.initialize();
    }

    setIterations(n){
        this.iterations=n;
    }


    tick(time,dTime){

        for(let i=0; i<this.iterations; i++) {
            this.computer.tick(time, dTime);
        }

    }

}



export { VerletDissipative };
