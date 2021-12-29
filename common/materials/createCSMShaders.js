




//shader pieces to build up a custom shader material

const constants = ` float PI = 3.14159; \n`


const varyings = `
    varying vec2 vUv;
    varying vec3 vPosition;
`;

const newPos = `
    vec3 newPos = displace(position);
`;

const newNormal = `
    float offset = 0.001;
    vec3 tangent = vec3(1,0,0);
    vec3 bitangent = vec3(0,1,0);
    vec3 neighbour1 = position + tangent * offset;
    vec3 neighbour2 = position + bitangent * offset;
    
    vec3 displacedNeighbour1 = displace(neighbour1);
    vec3 displacedNeighbour2 = displace(neighbour2);
    
    vec3 displacedTangent = displacedNeighbour1 - newPos;
    vec3 displacedBitangent = displacedNeighbour2 - newPos;
    
    vec3 newNormal = normalize(cross(displacedTangent, displacedBitangent));
`;


const varyingValues = `
    vUv = position.xy;
    vPosition = newPos;
    vNormal = newNormal;
`;



const newColor = `
    vec4 newColor = vec4( fragColor(), 1.);
`;






function createVertexCSM(uniforms, vertAuxFns, displace) {

    const defines = constants + uniforms + varyings;
    const header = vertAuxFns + displace;
    const main = newPos + newNormal + varyingValues;

    return {
        defines: defines,
        header: header,
        main: main
    }
}


function createFragmentCSM(uniforms, fragAuxFns, fragColor) {

    const defines = constants + uniforms + varyings;
    const header = fragAuxFns + fragColor;
    const main = newColor;

    return {
        defines: defines,
        header: header,
        main: main
    }

}




export{ createFragmentCSM, createVertexCSM };
