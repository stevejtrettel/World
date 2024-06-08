

//shader pieces to build up a custom shader material

const constants = ``;
//` float PI = 3.14159; \n`


const varyings = `
    varying vec2 vUv;
    varying vec3 vPosition;
    //for some reason varying vNormal is already defined for us
`;

//dont change any of the positions: we are doing this part on the CPU with ParametricMaterial
const newPos = `
    vec2 uv = position.xy;
    vec3 newPos = position.xyz;
`;

//also don't change the normal vector!
const newNormal = `
    vec3 newNormal = normal.xyz;
`;


//set the varyings (they probably already were this, because we didn't change anything!)
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
