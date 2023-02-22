
import {ComputeSystem} from "./ComputeSystem.js";
import {setIJ, fetch, onEdges } from "../../shaders/springs/setup.js";


//implements the augmentation of standard velocity verlet integration
//with dissapative forces (velocity dependent)
//https://www.sciencedirect.com/science/article/pii/S0010465503002029


//the input is a pair of initial condition shaders, and then two force functions
//forceConservative(ij, posTex, velTex)
//forceDissipative(ij, posTex, velTex)


//components of shaders

const step = `
    const float dt = 0.0003;
`;


//the shaders used in the integrator
//the shaders that get used in verlet integration

const positionShader = setIJ + fetch + onEdges+ step + `
      void main(){
     
         ivec2 ij = setIJ();

         vec4 positionLast = fetch(position2, ij);
         vec4 dPosition = fetch(dHdp, ij);
         dPosition *= dt/2.;
            
         vec4 positionNext = positionLast + dPosition;
         gl_FragColor = positionNext;
      
     }
`;

const momentumShader = setIJ + fetch + onEdges + step + `
        void main(){
    
            ivec2 ij = setIJ();
            
            vec4 momentumLast = fetch(momentum, ij);
            vec4 dMomentum = -fetch(dHdq, ij);
            dMomentum *= dt;
            
            vec4 momentumNext = momentumLast + dMomentum;
            gl_FragColor = momentumNext;
            
        }
`;


const position2Shader = setIJ + fetch + onEdges + step + `
      void main(){
    
         ivec2 ij = setIJ();
         
         vec4 positionLast = fetch(position, ij);
         vec4 dPosition = fetch(dHdp2, ij);
         dPosition *= dt/2.;
            
         vec4 positionNext = positionLast + dPosition;
         gl_FragColor = positionNext;
     
     }
`;





class VerletHamiltonian {

    constructor(hamiltonian, initialCond, uniforms, res, renderer){


        const variables = ['dHdp', 'position', 'dHdq', 'momentum', 'dHdp2', 'position2'];

        const dHdqShader =  setIJ + fetch + onEdges + hamiltonian.dq + `
             void main(){     
                     ivec2 ij = setIJ();
                     vec4 dHdq = getdHdq(position, momentum, ij);
                     gl_FragColor = dHdq;     
                 }
        `;

        const dHdpShader = setIJ + fetch + onEdges + hamiltonian.dp + `
             void main(){
                     ivec2 ij = setIJ();
                     vec4 dHdp = getdHdp(position, momentum, ij);
                     gl_FragColor = dHdp;  
                 }
        `;

        const shaders = {

            dHdp: dHdpShader,

            position: {
                simulation: positionShader,
                initialization: initialCond.position,
            },

            dHdq: dHdqShader,

            momentum:{
                simulation: momentumShader,
                initialization: initialCond.momentum,
            },

            dHdp2: dHdpShader,

            position2: {
                simulation: position2Shader,
                initialization: initialCond.position,
            },
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



export { VerletHamiltonian };

