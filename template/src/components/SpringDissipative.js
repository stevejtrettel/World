
import {globals} from "../globals.js";

import { CSQuad } from "../../../common/gpu/displays/CSQuad.js";
import { CSSpheres } from "../../../common/gpu/displays/CSSpheres.js";
import {VerletDissipative} from "../../../common/gpu/VerletDissipative.js";


import { singleSpringForce } from "../../../common/shaders/springs/singleSpringForce.js";
import { singleSpringDrag } from "../../../common/shaders/springs/singleSpringDrag.js";
import { gridSpringsForce, diagSpringsForce } from "../../../common/shaders/springs/springForces_Grid2D.js";
import { gridSpringsDrag, diagSpringsDrag } from "../../../common/shaders/springs/springDrag_Grid2D.js";
import { setIJ, onEdges, fetch } from "../../../common/shaders/springs/setup.js";



//INPUT TO THE PHYSICAL SYSTEM


const iniPositionShader = setIJ + fetch + `
    void main(){
           ivec2 ij = setIJ();
           vec4 xdir = vec4(1,0,0,0);
           vec4 ydir = normalize(vec4(0,0,1,0));
           
           float x = float(ij.x);
           float y = float(ij.y);
         
            vec4 origin = vec4(-res.x/2.+30., -res.y/2., -100, 0.);
           gl_FragColor = origin + gridSpacing * (x*xdir + y*ydir);
        }
`;


const iniVelocityShader= setIJ + fetch + `
    void main(){
             ivec2 ij = setIJ();
             gl_FragColor = vec4(0,0, 0,0.);
        }
        `;





















//the total forces acting on the system at a point ij:

const springForces = onEdges + singleSpringForce + gridSpringsForce + diagSpringsForce + `
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



//all together these constitute the conservative forces of the system:
const getForceConservative = springForces + envForces + `
    vec4 getForceConservative( sampler2D posTex, sampler2D velTex, ivec2 ij ){
    
        vec4 totalForce=vec4(0.);
        totalForce += springForces( posTex, ij );
        totalForce += envForces( posTex, ij );
        
        
    //if(ij.y==int(res.y)-1 && (ij.x==0||ij.x==int(res.x/2.)||ij.x==int(res.x)-1)){totalForce = vec4(0);}
                    if(onCorner(ij)){totalForce =vec4(0);}
              
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

const getForceDissipative = onEdges + springDrag + airDrag + `
    vec4 getForceDissipative( sampler2D posTex, sampler2D velTex, ivec2 ij ){
    
        vec4 totalDrag = vec4(0.);

        totalDrag += springDrag( velTex, ij );
        totalDrag += airDrag( velTex, ij );
        
            if(onCorner(ij)){totalDrag =vec4(0);}
          //  if(ij.y==int(res.y)-1 && (ij.x==0||ij.x==int(res.x/2.)||ij.x==int(res.x)-1)){totalDrag = vec4(0);}
        
        return totalDrag;
    }
`;





const initialCond = {
    position: iniPositionShader,
    velocity: iniVelocityShader
};

const forces = {
    conservative: getForceConservative,
    dissipative: getForceDissipative
};




class SpringGrid {

    constructor(arraySize, options, renderer){

        //copy over all the data
        this.arraySize=arraySize;

        this.renderer = renderer;

        //extra uniforms, beyond time, resolution, and the data of each shader
        let uniforms = {
            mass: { type: 'float', value: options.mass },
            springConstShort: { type:'float', value: options.springConstShort},
            springConstLong: { type:'float', value: options.springConstLong},
            gridSpacing: { type: 'float', value: options.gridSpacing },
            springDragConst: { type: 'float', value: options.springDragConst },
            airDragConst: { type: 'float', value: options.airDragConst },
        };

        //build the Integrator for this:
        this.integrator = new VerletDissipative(forces, initialCond, uniforms, this.arraySize, this.renderer);

        //build the display for this
        this.spheres = new CSSpheres(this.integrator.computer, 'positionX');

    }


    addToScene(scene){

        this.integrator.initialize();

        this.spheres.init();
      //  scene.add(this.spheres);

    }



    addToUI(ui){

    }



    tick(time,dTime){

        this.integrator.tick(time,dTime);
      //  this.spheres.tick(time,dTime);
    }

    setIterations(n){
        this.integrator.setIterations(n);
    }

}




let options = {
    mass:0.2,
    springConstShort: 50,
    springConsLong: 50,
    gridSpacing : 0.25,
    springDragConst : 0.75,
    airDragConst : 0.75,
};

let springSystem = new SpringGrid([64,64], options, globals.renderer);
springSystem.setIterations(20);


let testDisplay = new CSQuad(springSystem.integrator.computer);




export default {
    system: springSystem,
    display: testDisplay,
};

export { SpringGrid };
