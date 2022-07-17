import {globals} from "../globals.js";

import {VerletDissipative} from "../../../common/gpu/VerletDissipative.js";
import { CSSpheres } from "../../../common/gpu/displays/CSSpheres.js";


import { colorConversion } from "../../../common/shaders/colors/colorConversion.js";

import { singleSpringForce } from "../../../common/shaders/springs/springForce.js";
import { singleSpringDrag } from "../../../common/shaders/springs/singleSpringDrag.js";
import { gridSpringsForce, diagSpringsForce } from "../../../common/shaders/springs/springForces_Grid2D.js";
import { gridSpringsDrag, diagSpringsDrag } from "../../../common/shaders/springs/springDrag_Grid2D.js";
import { setIJ, onEdges, fetch } from "../../../common/shaders/springs/setup.js";






//-------------------------------------------------------------------
// SETUP THE SPRING FORCES
//-------------------------------------------------------------------


const springForces = singleSpringForce + gridSpringsForce + diagSpringsForce + `
    vec4 springForces( sampler2D posTex, ivec2 ij ){
        vec4 totalForce = vec4(0.);
        
        totalForce += gridSpringsForce(posTex, ij);
        totalForce += diagSpringsForce(posTex, ij);
        
        totalForce += doubleGridSpringsForce(posTex, ij);
        totalForce += doubleDiagSpringsForce(posTex, ij);
        
        return totalForce;
    }
`;

const envForces = `
    vec4 envForces( sampler2D posTex, ivec2 ij ){
       vec4 totalForce = vec4(0.);
        
        //the force from gravity is constant, downwards:
        totalForce += vec4( 0, -5.*mass, 0, 0);
       
        
        return totalForce;
    }
`;









const springDrag =  singleSpringDrag + gridSpringsDrag + diagSpringsDrag + `
    vec4 springDrag( sampler2D velTex, ivec2 ij ){
    
        vec4 totalDrag = vec4(0.);

        totalDrag += gridSpringsDrag( velTex, ij );
        totalDrag += diagSpringsDrag( velTex, ij );

        return totalDrag;
    }
`;

const airDrag = `
    vec4 airDrag( sampler2D velTex, ivec2 ij ){
    
        vec4 totalDrag = vec4(0.);
        
        vec4 vel = fetch( velTex, ij );
        
        totalDrag += -airDragConst * vel;
       
        return totalDrag;
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
            springConstShort: { type:'float', value: springParameters.springConstShort},
            springConstLong: { type:'float', value: springParameters.springConstLong},
            gridSpacing: { type: 'float', value: springParameters.gridSpacing },
            springDragConst: { type: 'float', value: springParameters.springDragConst },
            airDragConst: { type: 'float', value: springParameters.airDragConst },
        };


        const iniPositionShader = setIJ + fetch + springConditions.position + `
    void main(){
           ivec2 ij = setIJ();
           
           vec4 iniPos = getInitialPos( ij );
           gl_FragColor = iniPos;
        }
`;


        const iniVelocityShader= setIJ + fetch + springConditions.velocity + `
        void main(){
             ivec2 ij = setIJ();
             
             vec4 iniVel = getInitialVel(ij);
             gl_FragColor = iniVel;
        }
        `;


        const initialCond = {
            position: iniPositionShader,
            velocity: iniVelocityShader,
        };










        //all together these constitute the conservative forces of the system:
        const getForceConservative = springForces + envForces + springConditions.boundary + `
            vec4 getForceConservative( sampler2D posTex, sampler2D velTex, ivec2 ij ){
            
                vec4 totalForce=vec4(0.);
                totalForce += springForces( posTex, ij );
                totalForce += envForces( posTex, ij );
            
                setBoundaryConditions( ij, totalForce );
            
                return totalForce;
            }  
        `;


        const getForceDissipative = onEdges + springDrag + airDrag + springConditions.boundary + `
            vec4 getForceDissipative( sampler2D posTex, sampler2D velTex, ivec2 ij ){
            
                vec4 totalDrag = vec4(0.);
        
                totalDrag += springDrag( velTex, ij );
                totalDrag += airDrag( velTex, ij );
                
                setBoundaryConditions( ij, totalDrag );
                
                return totalDrag;
            }
        `;

        const forces = {
            conservative: getForceConservative,
            dissipative: getForceDissipative
        };


        //build the Integrator for this:
        this.integrator = new VerletDissipative(forces, initialCond, uniforms, this.arraySize, this.renderer);


        //build the display for this
        this.spheres = new CSSpheres(this.integrator.computer, 'positionX');



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



let springParameters = {
    mass:0.1,
    springConstShort: 30.,
    springConstLong: 60.,
    gridSpacing : 0.5,
    springDragConst : 0.75,
    airDragConst : 0.005,
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

const getInitialVel = `
    vec4 getInitialVel( ivec2 ij ){
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
    velocity: getInitialVel,
    boundary: setBdyCond,
};



let springSim = new SpringGrid([64,64], springParameters, springConditions, globals.renderer);
springSim.setIterations(20);



export { SpringGrid };

export default { springSim };





