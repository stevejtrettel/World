import { rotateR4 } from "../../shaders/geometry/rotateR4.js";
import { projectR4 } from "../../shaders/geometry/projectR4.js";
import { hopfMapTools, hopfSurface } from "../../shaders/geometry/hopfMap.js";

import { colorConversion } from "../../shaders/colors/colorConversion.js";

import { ParametricMaterial } from "../../compute/materials/ParametricMaterial.js";







let uniforms = {
    folds:{
        type: 'float',
        value: 0,
        range: [0,8,1],
    },
    amplitude:{
        type: 'float',
        value: 0.5,
        range: [0,1,0.01],
    },
    gridThickness:{
        type: 'float',
        value: 0.5,
        range: [0,1,0.01],
    },
    rotation:{
        type: 'float',
        value: 0.1,
        range: [0,1,0.01],
    },
};




let vertAux = rotateR4+projectR4+hopfMapTools;




//need to make a function called 'sphere curve' for use in HopfSurface
const sphereCurve = `

vec2 sphereCurve(float t){

    float phi=1.+amplitude*(1.+0.3*sin(time))*sin(folds*t+0.3*cos(time)+0.3*time);
    
    return vec2(phi,t);
}
`;


//need  a function vec3 displace(vec3 origV)
//origV has its two xy components in (0,1)
let displace = sphereCurve + hopfSurface +`
vec3 displace( vec2 uv ){

    float s =2.*PI*uv.x;
    float t = 2.*PI*uv.y;
    
    vec4 q = hopfSurface(s,t);
    
    //rotate q in R4 using the time uniform:
    float angle = 0.3*rotation * time;
    q = rotateR4( q, 0.5 * angle, 0.7 * angle, -0.4 * angle );
    
    vec3 p = stereographicProj( q );

    return p;
}
`;








//draw a coordinate grid on top of the final torus

let coordLines = `
float coordLines(vec2 freq, vec2 uv){

    float s = uv.x;
    float t = 2.*uv.y-uv.x;

    float coordS = abs( sin(2.*PI * freq.x * s) );
    float coordT = abs( sin(2.*PI * freq.y * t) );
    
    float bright = abs( log( coordS ) + log( coordT ) );
    bright = clamp( 0.5 * gridThickness * bright, 0., 1. );

    return bright;
}
`;




let fragAux = colorConversion+coordLines;

//need to make a function vec3 fragColor();
//have available as varyings vPosition, vUv and vNormal
let fragColor = `
vec3 fragColor(){


    float hue = vUv.x;
    float cLines = coordLines(vec2(5),vUv);
    float sat = 0.65*(1.-0.2*cLines);
    float light = 0.75+0.25*cLines;
    
    
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

let torus = new ParametricMaterial([100,100], vert, frag, uniforms, options);
torus.setName('Torus');


export default { torus };
