
//------------------------------------------------------------------
// DEFAULT VALUES OF THE PARAMETERS
//-------------------------------------------------------------------
//Build the compute system
const res = [1024,1024];

//can use these in either shader
let uniforms = {
    sigma:{
        type: 'float',
        value: 10.,
        range: [9,11,0.001],
    },
    beta:{
        type: 'float',
        value: 2.6666,
        range: [1,5,0.001],
    },
    rho:{
        type: 'float',
        value: 28.,
        range: [23,32,0.001],
    },
};





const vecField = `
    //choose the vector field based on a uniform: chooseAttractor

    vec3 vecField( vec3 pos ) {

                float x = pos.x;
                float y = pos.y;
                float z = pos.z;

                float vx = sigma*(y-x);
                float vy = x*(rho-z)-y;
                float vz = x*y-beta*z;

                return vec3(vx,vy,vz);
    }
    `;



export {res, uniforms, vecField};