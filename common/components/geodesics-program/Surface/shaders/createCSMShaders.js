

//shader pieces to build up a custom shader material

const constants = ``;
//` float PI = 3.14159; \n`


const varyings = `
    varying vec2 vUv;
    varying vec3 vPosition;
    //for some reason varying vNormal is already defined for us
    
    //there are other BLANK varyings that I have made available to every material
    //it would be better to replace this with a createVarying command or something...
    varying float vFloat;
    varying vec2 vVec2;
    varying vec3 vVec3;
    varying vec4 vVec4;
    //if you use any of these, you have to define them when you make the "displace" function
`;

const newPos = `
    vec2 uv = position.xy;
    vec3 newPos = position.xyz;
`;

const newNormal = `
    vec3 newNormal = normal.xyz;
`;


const varyingValues = `
    vUv = uv;
    vPosition = newPos;
    vNormal = newNormal;
`;


const newColor = `
    vec4 newColor = vec4( fragColor(), 1.);
`;




//a vertex shader that doesn't change anything
function createVertexCSM() {
    const defines = constants + varyings;
    const header = '';
    let main = newPos + newNormal + varyingValues;

    return {
        defines: defines,
        header: header,
        main: main
    }
}


function createFragmentCSM(uniforms, fragAuxFns, fragColor) {

    const defines = constants + varyings + uniforms;
    const header = fragAuxFns + fragColor;
    const main = newColor;

    return {
        defines: defines,
        header: header,
        main: main
    }

}



























export{ createFragmentCSM, createVertexCSM };
