import {allAttractors} from "../../../common/shaders/odes/attractors.js";


//------------------------------------------------------------------
// DEFAULT VALUES OF THE PARAMETERS
//-------------------------------------------------------------------
//Build the compute system
const res = [2048,1024];

//can use these in either shader
let uniforms = {
    a:{
        type: 'float',
        value: 10.,
        range: [9,11,0.001],
    },
    b:{
        type: 'float',
        value: 2.6666,
        range: [1,5,0.001],
    },
};


const sprott = `
            vec3 sprott(vec3 p){
                float A = 2.07+a;
                float B = 1.79+b;
                
                float x = p.x;
                float y = p.y;
                float z = p.z;
                    
                float vx = y+A*x*y+x*z;
                float vy = 1.- B*x*x + y*z;
                float vz = x - x*x - y*y;
                
                return vec3(vx,vy,vz);
            }
`;

const vecField = sprott + `
    vec3 vecField( vec3 p ) {
                return sprott(p);
                // float A = 2.07+a;
                // float B = 1.79+b;
                //
                // float x = p.x;
                // float y = p.y;
                // float z = p.z;
                //    
                // float vx = y+A*x*y+x*z;
                // float vy = 1.- B*x*x + y*z;
                // float vz = x - x*x - y*y;
                //
                // return vec3(vx,vy,vz);
    }
    `;



export {res, uniforms, vecField};