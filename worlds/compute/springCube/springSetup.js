import {setIJK} from "../../../code/shaders/springs/setup.js";
import {grid3D_texLookup} from "../../../code/shaders/springs/grid3D/grid3D_texLookup.js";




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







//-------------------------------------------------------------------
// actually doing it
//-------------------------------------------------------------------


const resolution = [16,16,16];

let springParameters = {
    mass:0.05,
    springConst: 15.,
    gridSpacing : 0.65,
    dampingConst : 0.05,
    airDragConst : 0.,
    simTimeStep:0.003,
};


const collision = {
    detectCollision: detectCollision,
    updateVelocity: updateVelocity,
    updatePosition: updatePosition,
};


const springConditions = {
    position: getInitialPos,
    velocity: getInitialVel,
    boundary: setBdyCond,
};


export {springParameters, springConditions, collision,resolution};

