import { Vector3 } from "../../../3party/three/build/three.module.js";

import{ VerletCollision } from "../../compute/gpu/VerletCollision.js";
import {VerletDissipative } from "../../compute/gpu/VerletDissipative.js";
import { CSSpheres } from "../../compute/gpu/displays/CSSpheres.js";

import { setIJK, onEdges, fetch } from "../../shaders/springs/setup.js";
import {SpringStruct} from "../../shaders/springs/Spring.js";
import { grid3D_texLookup } from "../../shaders/springs/grid3D/grid3D_texLookup.js";
import { grid3D_springForce } from "../../shaders/springs/grid3D/grid3D_springForce.js";
import { grid3D_springDamping } from "../../shaders/springs/grid3D/grid3D_springDamping.js";


import { PlaneObstacle } from "../../shaders/springs/obstacles/Plane.js";


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



//-------------------------------------------------------------------
// DEFAULT VALUES OF THE PARAMETERS
//-------------------------------------------------------------------

const detectCollision = setIJK + grid3D_texLookup +`
    vec4 detectCollision( ivec2 pixel ){
        ivec3 ijk = setIJK();
        vec4 pos = grid3D_texLookup(positionX, ijk);
        if(pos.y<-6.){
            return vec4(1);
        }
        return vec4(0);
    }`;

const updateVelocity = `
    vec4 updateVelocity( vec4 vel, ivec2 pixel ){
        return 0.75 * vec4(vel.x, -vel.y, vel.z, vel.w);
    }
    `;

const updatePosition = `
    vec4 updatePosition( vec4 pos, ivec2 pixel ){
         return vec4(pos.x, -6., pos.z, pos.w);
    }
`;



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
        return vec4(1,0.5,0,0);
    }
`;

const setBdyCond = `
    void setBoundaryConditions(ivec3 ijk, inout vec4 totalForce ){
      //  if(ijk.y==0){totalForce=vec4(0.);}
      //  if(ijk.y==int(res.y)-1 && (ijk.x==0 || ijk.x==int(res.y)-1)){totalForce = vec4(0);}
    }`;


const defaultResolution = [16,16,16];

let defaultSpringParameters = {
    mass:0.05,
    springConst: 15.,
    gridSpacing : 0.65,
    dampingConst : 0.05,
    airDragConst : 0.,
    simTimeStep:0.003,
};


const defaultCollision = {
    detectCollision: detectCollision,
    updateVelocity: updateVelocity,
    updatePosition: updatePosition,
};


const defaultSpringConditions = {
    position: getInitialPos,
    velocity: getInitialVel,
    boundary: setBdyCond,
};






class SpringCube {

    constructor(
        renderer,
        cubeSize= defaultResolution,
        springParameters = defaultSpringParameters,
        springConditions = defaultSpringConditions,
        collision = defaultCollision,
        ) {
        //copy over all the data
        this.cubeSize = cubeSize;
        this.arraySize=[this.cubeSize[0]*this.cubeSize[2], this.cubeSize[1]];
        this.simTimeStep=springParameters.simTimeStep;
        this.renderer = renderer;

        this.reset=function(){
            this.integrator.initialize();
        };

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
        this.integrator = new VerletCollision(forces, initialCond, collision, uniforms, this.arraySize, this.simTimeStep, this.renderer);


        //build the display for this
        this.spheres = new CSSpheres(this.integrator.computer, 'positionX');



        //build the object we are colliding with.
        this.object = new PlaneObstacle(new Vector3(0,-6,0), new Vector3(0,1,0));

    }


    addToScene(scene){

        this.integrator.initialize();

        this.spheres.init();
        scene.add(this.spheres);

        scene.add(this.object.mesh);

    }



    addToUI(ui){
       ui.add(this, 'reset');
    }



    tick(time,dTime){

        this.integrator.tick(time,dTime);
        this.spheres.tick(time,dTime);
    }

    setIterations(n){
        this.integrator.setIterations(n);
    }


}


export default SpringCube;

