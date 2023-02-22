import {ComputeSystem} from "./ComputeSystem.js";
import {LinearFilter} from "../../../3party/three/build/three.module.js";


//implements the augmentation of standard velocity verlet integration
//with dissapative forces (velocity dependent)
//https://www.sciencedirect.com/science/article/pii/S0010465503002029


//the input is a pair of initial condition shaders, and then two force functions
//forceConservative(ij, posTex, velTex)
//forceDissipative(ij, posTex, velTex)


//the collision variable is a triple of things:
//{
// detectCollision: vec4 detectCollision( ivec2 pixel )
// updatePosition:  vec4 updatePosition( vec4 pos, ivec2 pixel)
// updateVelocity:  vec4 updateVelocity( vec4 vel, ivec2 pixel)
// }

//components of shaders


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



const impact = `
    bool impact(ivec2 pixel){
        vec4 impactData = fetch( collision, pixel);
        if(impactData.x>0.){return true;}
        return false;
    }
`;




class VerletCollision {

    constructor(forces, initialCond, collision, uniforms, res, simTimeStep, renderer){

        const variables = ['velocity', 'positionX', 'forceConservative', 'forceDissipative', 'velocity2', 'forceDissipative2', 'collision' ];

//the shaders used in the integrator

        const velocityShader = setPixel + fetch + impact + collision.updateVelocity + `
            void main(){
                ivec2 pixel = setPixel();
                
                vec4 vel = fetch( velocity2, pixel );
                vec4 fC = fetch( forceConservative, pixel );
                vec4 fD = fetch( forceDissipative2, pixel );
                
                
                if( impact(pixel) ){
                   gl_FragColor = updateVelocity(vel, pixel);
                }
                else{
                    vec4 newVel = vel + 1./(2.*mass)*(fC + fD)*simTimeStep;
                    gl_FragColor = newVel;
                }
            }
        `;

        const positionShader = setPixel + fetch + impact + collision.updatePosition +`
            void main(){
                ivec2 pixel = setPixel();
                
                vec4 vel = fetch( velocity, pixel );
                vec4 pos = fetch( positionX, pixel );
               
                if( impact(pixel) ){
                   gl_FragColor = updatePosition(pos, pixel);
                }
                else{
                    vec4 newPos = pos + vel*simTimeStep;
                    gl_FragColor = newPos;
                }
            }
        `;


        const velocity2Shader = setPixel + fetch + impact + collision.updateVelocity +`
            void main(){
                ivec2 pixel = setPixel();
                
                vec4 vel = fetch( velocity, pixel );
                vec4 fC = fetch( forceConservative, pixel );
                vec4 fD = fetch( forceDissipative, pixel );
                
                vec4 newVel = vel + 1./(2.*mass)*(fC + fD)*simTimeStep; 
                gl_FragColor = newVel;
            }
        `;



        const forceConservativeShader = setPixel + fetch + impact + forces.conservative + `
            void main(){
            
                ivec2 pixel = setPixel();
                
                vec4 force = getForceConservative( positionX, velocity, pixel );
                gl_FragColor = force;
            }
`;
        const forceDissipativeShader = setPixel + fetch + impact + forces.dissipative + `
            void main(){
            
                ivec2 pixel = setPixel();

                vec4 force = getForceDissipative( positionX, velocity, pixel );
                gl_FragColor = force;
            }
        `;

        const forceDissipative2Shader = setPixel + fetch + impact + forces.dissipative + `
            void main(){
            
                ivec2 pixel = setPixel();
               
                vec4 force = getForceDissipative( positionX, velocity, pixel );
                gl_FragColor = force;
            }
        `;

        const collisionShader = setPixel + fetch + collision.detectCollision +
            `
             void main(){
            
                ivec2 pixel = setPixel();

                vec4 detection = detectCollision( pixel );
                
                gl_FragColor = detection;
                
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

            collision: collisionShader,
        };


        const options = {
            res: res,
            filter:LinearFilter,
        };

        //add the timestep to the list of uniforms:
        let allUniforms =
            {
                simTimeStep :{
                    type: `float`,
                    value: simTimeStep,
                },
                ...uniforms,
            };



        this.computer = new ComputeSystem(variables, shaders, allUniforms, options, renderer);

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



export { VerletCollision };
