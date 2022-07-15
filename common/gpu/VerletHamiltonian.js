import {ComputeSystem} from "./ComputeSystem.js";

//hamiltonian is a set of two shaders of the form
//{dHdq: dHdqShader, dHdp: dHdpShader}


//initialCond is the set of position and momentum initial conditions:
//{position: posShader, momentum: momShader}

//uniforms are any uniforms that are used in the hamiltonian shaders
//{mass:

//res is the size of the simulation



//components of shaders

const step = `
    const float epsilon = 0.001;
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






//the shaders that get used in verlet integration

const positionShader = setIJ + fetch + step + `
      void main(){
     
         ivec2 ij = setIJ();

         vec4 positionLast = fetch(position2, ij);
         vec4 dPosition = fetch(dHdp, ij);
            
         vec4 positionNext = positionLast + dPosition*epsilon/2.;
         gl_FragColor = positionNext;
      
     }
`;

const momentumShader = setIJ + fetch + step + `
        void main(){
    
            ivec2 ij = setIJ();
            
            vec4 momentumLast = fetch(momentum, ij);
            vec4 dMomentum = -fetch(dHdq, ij);
            
            vec4 momentumNext = momentumLast + dMomentum*epsilon;
            gl_FragColor = momentumNext;
            
        }
`;


const position2Shader = setIJ + fetch + step + `
      void main(){
    
         ivec2 ij = setIJ();
         
         vec4 positionLast = fetch(position, ij);
         vec4 dPosition = fetch(dHdp2, ij);
            
         vec4 positionNext = positionLast + dPosition*epsilon/2.;
         gl_FragColor = positionNext;
     
     }
`;

class VerletHamiltonian {

    constructor(hamiltonian, initialCond, uniforms, res, renderer){

        const variables = ['dHdp', 'position', 'dHdq', 'momentum', 'dHdp2', 'position2'];

        const shaders = {

            dHdp: hamiltonian.dHdp,

            position: {
                simulation: positionShader,
                initialization: initialCond.position,
            },

            dHdq: hamiltonian.dHdq,

            momentum:{
                simulation: momentumShader,
                initialization: initialCond.momentum,
            },

            dHdp2: hamiltonian.dHdp,

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
