
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
    vec3 newPos = displace( uv );
`;

function createNewPosShader(scale=1.){
    return `
    //shrinking the domain SLIGHTLY to avoid seeing edge effects on the large edges
    //this should be done another way than hard coding....
    vec2 uv = float(${scale})*position.xy;
    vec3 newPos = displace( uv );
    `;
}

const newNormalFromDisplace = `
    float offset = 0.01;
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

const newNormal = `
    vec3 newNormal = nVec( uv );
`;


const varyingValues = `
    vUv = uv;
    vPosition = newPos;
    vNormal = newNormal;
`;



const newColor = `
    vec4 newColor = vec4( fragColor(), 1);
`;



const defaultOptions = {
    scaleFactor:1.,
}

function createVertexCSM(uniforms, vertAuxFns, displace, nVec=``, options=defaultOptions) {

    const defines = constants + varyings + uniforms;
    const header = vertAuxFns + displace + nVec;
    let main;
    //const newPos = createNewPosShader(options.scaleFactor||1.);
    if(options.nVec){
        main = newPos + newNormal + varyingValues;
    }
    else{
        main = newPos + newNormalFromDisplace + varyingValues;
    }

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



