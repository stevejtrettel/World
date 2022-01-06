




//shader pieces to build up a custom shader material

const constants = ` float PI = 3.14159; \n`


const varyings = `
    varying vec2 vUv;
    varying vec3 vPosition;
    //for some reason varying vNormal is already defined for us
`;

const newPos = `
    vec2 uv = position.xy;
    vec3 newPos = displace( uv );
`;

const newNormal = `
    float offset = 0.001;
    vec2 tangent = vec2(1,0);
    vec2 bitangent = vec2(0,1);
    vec2 neighbour1 = uv + tangent * offset;
    vec2 neighbour2 = uv + bitangent * offset;
    
    vec3 displacedNeighbour1 = displace(neighbour1);
    vec3 displacedNeighbour2 = displace(neighbour2);
    
    vec3 displacedTangent = displacedNeighbour1 - newPos;
    vec3 displacedBitangent = displacedNeighbour2 - newPos;
    
    vec3 newNormal = normalize(cross(displacedTangent, displacedBitangent));
`;


const varyingValues = `
    vUv = uv;
    vPosition = newPos;
    vNormal = newNormal;
`;



const newColor = `
    vec4 newColor = vec4( fragColor(), 1.);
`;






function createVertexCSM(uniforms, vertAuxFns, displace) {

    const defines = constants + varyings + uniforms;
    const header = vertAuxFns + displace;
    const main = newPos + newNormal + varyingValues;

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
