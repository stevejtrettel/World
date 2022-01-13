import { rotateR4 } from "../../../common/shaders/geometry/rotateR4.js";
import { projectR4 } from "../../../common/shaders/geometry/projectR4.js";

import { parameterizedKnots } from "../../../common/shaders/geometry/parameterizedKnots.js";
import { diffGeoS3 } from "../../../common/shaders/geometry/diffGeoS3.js";

import { colorConversion } from "../../../common/shaders/colors/colorConversion.js";

import { ParametricMaterial } from "../../../common/materials/ParametricMaterial.js";







let uniforms = {
    Knot: {
        type: 'int',
        value: 0,
        range: [{
            'Trefoil':0,
            'Fig8':1,
            'Granny':2,
            'Torus(11,3)': 3,
        }],
    },
    thickness:{
        type: 'float',
        value: 0.125,
        range: [0,0.25,0.01],
    },
    rotation:{
        type: 'float',
        value: 0.1,
        range: [0,1,0.01],
    },
};




let vertAux = rotateR4+projectR4+diffGeoS3+parameterizedKnots;


const knot = `
vec4 knot( float t ) {
        switch (Knot) {
            case 0:
                return trefoil(t);
            case 1:
                return fig8(t);
            case 2:
                return granny(t);
            case 3:
                return torusKnot(vec2(11,3),t);
        }
}
`;



//need  a function vec3 displace(vec3 origV)
//origV has its two xy components in (0,1)
const displace = knot + `
vec3 displace( vec2 uv ){

    float t = 2.*PI * uv.x;
    float s = 2.*PI * uv.y;
    
    //get points along the knot
    vec4 pos0 = knot(t-0.005);
    vec4 pos1 = knot(t);
    vec4 pos2 = knot(t+0.005);
    
    //build frame from these points
    mat4 frame = frenetFrameS3(pos0,pos1,pos2);
    
    //build orthogonal circle from this:
    vec4 q = orthogonalCircle( frame, thickness, s );
    
    //rotate q in R4 using the time uniform:
    float angle = 0.3*rotation * time;
    q = rotateR4( q, 0.5 * angle, 0.7 * angle, -0.4 * angle );
    
    //stereographically project
    vec3 p = stereographicProj( q );

    return p;
}
`;








//draw a coordinate grid on top of the final torus

const coordLines = `
float coordLines(vec2 freq, vec2 uv){

    float t = uv.x;
    float s =uv.y;

    float coordS = abs( sin(2.*PI * freq.x * s) );
    float coordT = abs( sin(2.*PI * freq.y * t) );
    
    float bright = abs( log( coordS ) + log( coordT ) );
    bright = clamp( 0.25 * bright, 0., 1. );
    //bright = 1.-bright;

    return bright;
}
`;




const fragAux = colorConversion+coordLines;

//need to make a function vec3 fragColor();
//have available as varyings vPosition, vUv and vNormal
let fragColor = `
vec3 fragColor(){


    float hue = vUv.x;
    float cLines = coordLines(vec2(5),vUv);
    float sat = 0.65;
    float light = 0.75-0.25*cLines;
    
    
    vec3 baseColor = hsb2rgb(vec3(hue,sat, light));
    
    return baseColor;

    float grid = coordLines( vec2(5.,5.), vUv);
    grid = 0.7*grid + 0.3;
    
    return grid * baseColor;
    
}
`;



let vert = {
    aux: vertAux,
    displace: displace,
}

let frag = {
    aux: fragAux,
    fragColor: fragColor,
}


let options = {
    clearcoat:1,
    metalness:0.2,
    roughness:0.1,
}

let knotComp = new ParametricMaterial([2048,32], vert, frag, uniforms, options);
knotComp.setName('KnotComplement');


const knotComplement = {
    knotComp: knotComp,
};

export { knotComplement };
