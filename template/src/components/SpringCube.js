import {globals} from "../globals.js";

import {VerletDissipative } from "../../../common/gpu/VerletDissipative.js";
import { CSSpheres } from "../../../common/gpu/displays/CSSpheres.js";

import { setIJK, onEdges, fetch } from "../../../common/shaders/springs/setup.js";
import {SpringStruct} from "../../../common/shaders/springs/Spring.js";
import { grid3D_texLookup } from "../../../common/shaders/springs/grid3D/grid3D_texLookup.js";
import { grid3D_springForce } from "../../../common/shaders/springs/grid3D/grid3D_springForce.js";
import { grid3D_springDamping } from "../../../common/shaders/springs/grid3D/grid3D_springDamping.js";

//-------------------------------------------------------------------
// SETUP THE SPRING FORCES
//-------------------------------------------------------------------



const envForces = `
    vec4 envForces( sampler2D posTex, ivec3 ijk ){
       vec4 totalForce = vec4(0.);
        
        //the force from gravity is constant, downwards:
        totalForce += vec4( 0, -5.*mass, 0, 0);
       
        
        return totalForce;
    }
`;



const envDrag = `
    vec4 envDrag( sampler2D velTex, ivec3 ijk ){
    
        vec4 totalDrag = vec4(0.);
        
        vec4 vel = grid3D_texLookup( velTex, ijk );
        
        totalDrag += -airDragConst * vel;
       
        return totalDrag;
    }
`;














class SpringGrid {

    constructor(cubeSize, springParameters, springConditions, renderer){

        //copy over all the data
        this.cubeSize = cubeSize;
        this.arraySize=[this.cubeSize[0]*this.cubeSize[2], this.cubeSize[1]];
        this.renderer = renderer;

        //extra uniforms, beyond time, resolution, and the data of each shader
        let uniforms = {
            mass: { type: 'float', value: springParameters.mass },
            springConst: { type:'float', value: springParameters.springConst},
            gridSpacing: { type: 'float', value: springParameters.gridSpacing },
            dampingConst: { type: 'float', value: springParameters.dampingConst },
            airDragConst: { type: 'float', value: springParameters.airDragConst },
        };




        const iniPositionShader = setIJK + springConditions.position + `
    void main(){
           ivec3 ijk = setIJK();
           
           vec4 iniPos = getInitialPos( ijk );
           gl_FragColor = iniPos;
        }
`;


        const iniVelocityShader= setIJK + springConditions.velocity + `
        void main(){
             ivec3 ijk = setIJK();
             
             vec4 iniVel = getInitialVel(ijk);
             gl_FragColor = iniVel;
        }
        `;


        const initialCond = {
            position: iniPositionShader,
            velocity: iniVelocityShader,
        };









        //all together these constitute the conservative forces of the system:
        const getForceConservative = setIJK + SpringStruct + grid3D_texLookup + grid3D_springForce + envForces + springConditions.boundary + `
            vec4 getForceConservative( sampler2D posTex, sampler2D velTex, ivec2 pixel ){
            
                vec4 totalForce=vec4(0.);
                
                ivec3 ijk = setIJK();
                
                totalForce += grid3D_springForce( posTex, ijk );
                totalForce += envForces( posTex, ijk );
            
                setBoundaryConditions( ijk, totalForce );

                return totalForce;
            }  
        `;


        const getForceDissipative = setIJK + onEdges + SpringStruct + grid3D_texLookup + grid3D_springDamping + envDrag + springConditions.boundary + `
            vec4 getForceDissipative( sampler2D posTex, sampler2D velTex, ivec2 pixel ){
            
                vec4 totalDrag = vec4(0.);
                
                ivec3 ijk = setIJK();
        
                totalDrag += grid3D_springDamping( velTex, ijk );
                totalDrag += envDrag( velTex, ijk );
                
                setBoundaryConditions( ijk, totalDrag );
                
 
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


const resolution = [16,16,16];

let springParameters = {
    mass:0.02,
    springConst: 10.,
    gridSpacing : 0.5,
    dampingConst : 0.1,
    airDragConst : 0.,
};


const getInitialPos = `
        vec4 getInitialPos( ivec3 ijk ){
               vec4 xdir = vec4(1,0,0,0);
               vec4 ydir = vec4(0,1,0,0);
               vec4 zdir = vec4(0,0,1,0);
               
               float x = float(ijk.x);
               float y = float(ijk.y);
               float z = float(ijk.z);
             
                vec4 origin = vec4(0,0,0,0);
               return  origin + gridSpacing * (x*xdir + y*ydir+ z*zdir);
        }
`;

const getInitialVel = `
    vec4 getInitialVel( ivec3 ijk ){
        return vec4(0);
    }
`;

const setBdyCond = `
    void setBoundaryConditions(ivec3 ijk, inout vec4 totalForce ){
        if(ijk.y==int(res.y)-1 && (ijk.x==0 || ijk.x==int(res.y)-1)){totalForce = vec4(0);}
    }`;







//-------------------------------------------------------------------
// actually doing it
//-------------------------------------------------------------------




const springConditions = {
    position: getInitialPos,
    velocity: getInitialVel,
    boundary: setBdyCond,
};


let springSim = new SpringGrid([32,32,32], springParameters, springConditions, globals.renderer);
springSim.setIterations(20);



export { SpringGrid };

export default { springSim };



