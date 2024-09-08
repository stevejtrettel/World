
//A class that takes as input a knot parameterized in S3 and then draws the complement:
//THIS IS JUST A NICE WRAPPER FOR A PARAMETRIC MATERIAL

import ParametricMaterial from "../../../code/compute/materials/ParametricMaterial.js";

import {rotateR4} from "../../../code/shaders/geometry/rotateR4.js";
import {projectR4} from "../../../code/shaders/geometry/projectR4.js";
import {diffGeoS3} from "../../../code/shaders/geometry/diffGeoS3.js";
import {colorConversion} from "../../../code/shaders/colors/colorConversion.js";




//------------------------------------------------------------------
// SETTING PARAMETERS
//-------------------------------------------------------------------

let defaultKnot = `vec4 knot( float t ) {
    //the knot lying on the Clifford torus
    float freq1=3.;
    float freq2=2.;
    float r1=1.;
    float r2=1.;
    vec2 uCirc=vec2(cos(freq1*t), sin(freq1*t));
    vec2 vCirc=vec2(cos(freq2*t), sin(freq2*t));

    //rescaling to lie on the rU-rV torus
    vec4 p=normalize(vec4(r1*uCirc, r2*vCirc));

    return p;
}`

let defaultOptions = {
    clearcoat:1,
    metalness:0.2,
    roughness:0.1,
    envMapIntensity:2
}






//------------------------------------------------------------------
// COLOR FUNCTIONS FOR PARAMETRIC MATERIAL
//-------------------------------------------------------------------

//Color Function Stuff
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


//need to make a function vec3 fragColor();
//have available as varyings vPosition, vUv and vNormal
let fragColor = `
vec3 fragColor(){


    float hue = 0.75+vUv.x;
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



//------------------------------------------------------------------
// VERTEX SHADERS FOR PARAMETRIC MATERIAL
//-------------------------------------------------------------------

let vertAux = rotateR4+projectR4+diffGeoS3;


//need  a function vec3 displace(vec3 origV)
//origV has its two xy components in (0,1)

//THIS USES THE FUNCTION KNOT, WHICH IS INPUT IN THE constructor
const displace = `
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







class KnotComplementS3{
    constructor(knot = defaultKnot, knotUniforms = {}) {

        this.knot = knot;

        this.uniforms = knotUniforms;

        //add the uniforms of thickness and rotation:
        this.uniforms.thickness = {
            type: 'float',
            value: 0.125,
            range: [0,0.25,0.01],
        };
        this.uniforms.rotation = {
            type: 'float',
            value: 0.1,
            range: [0,1,0.01],
        };


        //making the shaders:

        this.vert = {
            aux: rotateR4+projectR4+diffGeoS3,
            displace: knot + displace,
        }

        this.frag = {
            aux: colorConversion + coordLines,
            fragColor: fragColor,
        }


        this.surface = new ParametricMaterial([2048,32], this.vert, this.frag, this.uniforms, defaultOptions);
        this.surface.setName('KnotComplement');



    }


    addToScene(scene){
        this.surface.addToScene(scene);
    }

    addToUI(ui){
        this.surface.addToUI(ui);
    }

    tick(time,dTime){
        this.surface.tick(time,dTime);
    }
}


export default KnotComplementS3;
