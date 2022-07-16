import {ComputeSystem} from "./ComputeSystem.js";




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
    vec4 fetch(sampler2D tex, ivec2 ij) {
        return texelFetch(tex, ij, 0);
    }
    `;

const setIJ = `
    ivec2 setIJ(){
        return ivec2(int(gl_FragCoord.x),int(gl_FragCoord.y));
    }
`;







//the shaders used in the integrator

const velocityShader = setIJ + fetch + step + `
    void main(){
        ivec2 ij = setIJ();
        
        vec4 vel = fetch( velocity2, ij );
        vec4 fC = fetch( forceConservative, ij );
        vec4 fD = fetch( forceDissipative2, ij );
        
        vec4 newVel = vel + 1./(2.*mass)*(fC + fD)*dt;
        
        gl_FragColor = newVel;
    }
`;

const positionShader = setIJ + fetch + step + `
    void main(){
        ivec2 ij = setIJ();
        
        vec4 vel = fetch( velocity, ij );
        vec4 pos = fetch( positionX, ij );
        
        vec4 newPos = pos + vel*dt;
            
        gl_FragColor = newPos;
    }
`;


const velocity2Shader = setIJ + fetch + step + `
    void main(){
        ivec2 ij = setIJ();
        
        vec4 vel = fetch( velocity, ij );
        vec4 fC = fetch( forceConservative, ij );
        vec4 fD = fetch( forceDissipative, ij );
        
        vec4 newVel = vel + 1./(2.*mass)*(fC + fD)*dt;
        
        gl_FragColor = newVel;
    }
`;



class VerletDissipative {

    constructor(forces, initialCond, uniforms, res, renderer){



        const variables = ['velocity', 'positionX', 'forceConservative', 'forceDissipative', 'velocity2', 'forceDissipative2'];



        const forceConservativeShader = setIJ + fetch + forces.conservative + `
            void main(){
            
                ivec2 ij = setIJ();
                
                vec4 force = getForceConservative( positionX, velocity, ij );
                
                gl_FragColor = force;
            }
`;

        const forceDissipativeShader = setIJ + fetch + forces.dissipative + `
            void main(){
            
                ivec2 ij = setIJ();
                
                vec4 force = getForceDissipative( positionX, velocity, ij );
                
                gl_FragColor = force;
            }
        `;

        const forceDissipative2Shader = setIJ + fetch + forces.dissipative + `
            void main(){
            
                ivec2 ij = setIJ();
                
                vec4 force = getForceDissipative( positionX, velocity2, ij );
                
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
