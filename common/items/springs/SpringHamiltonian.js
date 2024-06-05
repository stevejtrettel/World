
import {globals} from "../World/globals.js";

import {VerletHamiltonian } from "../compute/gpu/VerletHamiltonian.js";
import { CSSpheres } from "../compute/gpu/displays/CSSpheres.js";
import { CSQuad } from "../compute/gpu/displays/CSQuad.js";

import { setIJ, onEdges, fetch } from "../shaders/springs/setup.js";
import { SpringStruct } from "../shaders/springs/Spring.js";
import { grid2D_springPotentialGrad } from "../shaders/springs/grid2D/grid2D_springPotentialGrad.js";


//-------------------------------------------------------------------
// SETUP THE SPRING FORCES
//-------------------------------------------------------------------


// const springGradients =  singleSpringPotentialGrad + gridSpringsPotentialGrad + diagSpringsPotentialGrad + `
//     vec4 springGradients( sampler2D posTex, ivec2 ij ){
//         vec4 totalForce = vec4(0.);
//
//         totalForce += gridSpringsPotentialGrad(posTex, ij);
//         totalForce += diagSpringsPotentialGrad(posTex, ij);
//
//         totalForce += doubleGridSpringsPotentialGrad(posTex, ij);
//         totalForce += doubleDiagSpringsPotentialGrad(posTex, ij);
//
//         return totalForce;
//     }
// `;


const springGradients =  SpringStruct + grid2D_springPotentialGrad + `
    vec4 springGradients( sampler2D posTex, ivec2 ij ){
        vec4 totalForce = vec4(0.);
        
        totalForce += grid2D_springPotentialGrad(posTex, ij);
        
        return totalForce;
    }
`;

const envGradients = `
    vec4 envGradients( sampler2D posTex, ivec2 ij ){
       vec4 totalForce = vec4(0.);
        
        //the force from gravity is constant, downwards:
        totalForce += vec4( 0, 5.*mass, 0, 0);
       
        return totalForce;
    }
`;






class SpringGrid {

    constructor(arraySize, springParameters, springConditions, renderer){

        //copy over all the data
        this.arraySize=arraySize;
        this.renderer = renderer;

        //extra uniforms, beyond time, resolution, and the data of each shader
        let uniforms = {
            mass: { type: 'float', value: springParameters.mass },
            springConst: { type:'float', value: springParameters.springConst},
            gridSpacing: { type: 'float', value: springParameters.gridSpacing },
            dampingConst: { type: 'float', value: springParameters.dampingConst },
            airDragConst: { type: 'float', value: springParameters.airDragConst },
        };



        const iniPositionShader = setIJ + fetch + onEdges + springConditions.position + `
    void main(){
           ivec2 ij = setIJ();
           
           vec4 iniPos = getInitialPos( ij );
           gl_FragColor = iniPos;
        }
`;


        const iniMomentumShader= setIJ + fetch + onEdges + springConditions.momentum + `
        void main(){
             ivec2 ij = setIJ();
             
             vec4 iniMom = getInitialMom(ij);
             gl_FragColor = iniMom;
        }
        `;


        const initialCond = {
            position: iniPositionShader,
            momentum: iniMomentumShader,
        };


        //all together these constitute the conservative forces of the system:
        const getdHdq = springGradients + envGradients + springConditions.boundary + `
            vec4 getdHdq( sampler2D posTex, sampler2D momTex, ivec2 ij ){
            
                vec4 dHdq=vec4(0.);
                dHdq += springGradients( posTex, ij );
                dHdq += envGradients( posTex, ij );
            
                setBoundaryConditions( ij, dHdq );
            
                return dHdq;
            }  
        `;


        //derivative of p^2/2m is just p/m
        const getdHdp = springConditions.boundary + `
            vec4 getdHdp( sampler2D posTex, sampler2D momTex, ivec2 ij ){
            
                vec4 totalMomentum = fetch( momTex, ij );
        
                vec4 dHdp = totalMomentum / mass;
                
                setBoundaryConditions( ij, dHdp );
                
                return dHdp;
            }
        `;

        const hamiltonian = {
            dq: getdHdq,
            dp: getdHdp
        };

        //build the Integrator for this:
        this.integrator = new VerletHamiltonian(hamiltonian, initialCond, uniforms, this.arraySize, this.renderer);


        //build the display for this
        this.spheres = new CSSpheres(this.integrator.computer, 'position');



    }


    addToScene(scene){

        this.integrator.initialize();

        this.spheres.init();
        scene.add(this.spheres);

    }



    addToUI(ui){

    }



    tick(time,dTime){

        this.integrator.tick(time,dTime);
        this.spheres.tick(time,dTime);
    }

    setIterations(n){
        this.integrator.setIterations(n);
    }

}





















//-------------------------------------------------------------------
// BUILDING AN EXAMPLE
//-------------------------------------------------------------------



const res =  [64,64];

let springParameters = {
    mass:0.1,
    springConst: 30.,
    gridSpacing : 0.25,
    dampingConst : 0.5,
    airDragConst : 0.,
};


const getInitialPos = `
        vec4 getInitialPos( ivec2 ij ){
               vec4 xdir = vec4(1,0,0,0);
               vec4 ydir = normalize(vec4(0,0,1,0));
               
               float x = float(ij.x);
               float y = float(ij.y);
             
                vec4 origin = vec4(-res.x/2.+30., -res.y/2., -100, 0.);
               return origin + gridSpacing * (x*xdir + y*ydir);
        }
`;

const getInitialMom = `
    vec4 getInitialMom( ivec2 ij ){
        return vec4(0);
    }
`;

const setBdyCond = `
    void setBoundaryConditions(ivec2 ij, inout vec4 totalForce ){
        //if(ij.y==int(res.y)-1 && (ij.x==0||ij.x==int(res.x/2.)||ij.x==int(res.x)-1)){totalForce = vec4(0);}
        if(onCorner(ij)){totalForce =vec4(0);}
    }`;


const springConditions = {
    position: getInitialPos,
    momentum: getInitialMom,
    boundary: setBdyCond,
};



let springSim = new SpringGrid(res, springParameters, springConditions, globals.renderer);
springSim.setIterations(50);


let testDisplay = new CSQuad(springSim.integrator.computer);

export default {
    system: springSim,
    display: testDisplay,
};




export { SpringGrid };







