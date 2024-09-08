import {colorConversion} from "../../../code/shaders/colors/colorConversion.js";
import {hopfSurface, hopfMapTools} from "../../../code/shaders/geometry/hopfMap.js";
import {rotateR4} from "../../../code/shaders/geometry/rotateR4.js";
import {projectR4} from "../../../code/shaders/geometry/projectR4.js";

import ParametricMaterial from "../../../code/compute/materials/ParametricMaterial.js";





//------------------------------------------------------------------
// SETTING PARAMETERS
//-------------------------------------------------------------------




let defaultCurve = `
vec2 sphereCurve(float t){
    float phi=1.+amplitude*(1.+0.3*sin(time))*sin(folds*t+0.3*cos(time)+0.3*time);
    return vec2(phi,t);
}`;



let defaultOptions = {
    clearcoat:1,
    metalness:0.2,
    roughness:0.1,
    envMapIntensity:2
}




//------------------------------------------------------------------
// COLOR FUNCTIONS FOR PARAMETRIC MATERIAL
//-------------------------------------------------------------------

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






//------------------------------------------------------------------
// VERTEX SHADERS FOR PARAMETRIC MATERIAL
//-------------------------------------------------------------------

//THIS USES THE FUNCTION SPHERECURVE, WHICH IS INPUT IN THE constructor
//it also requires the input of hopfSurface

//need  a function vec3 displace(vec3 origV)
//origV has its two xy components in (0,1)
let displace = `
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





class HopfTorus{
    constructor(sphereCurve = defaultCurve, uniforms = {}) {

        this.sphereCurve = sphereCurve;

        this.uniforms = uniforms;

        //add rotation and thickness of the grid
        this.uniforms.gridThickness={
            type: 'float',
                value: 0.5,
                range: [0,1,0.01],
        };
        this.uniforms.rotation = {
            type: 'float',
            value: 0.1,
            range: [0,1,0.01],
        };


        //making the shaders:

        this.vert = {
            aux: rotateR4+projectR4+hopfMapTools,
            displace: this.sphereCurve + hopfSurface + displace,
        }

        this.frag = {
            aux: colorConversion + coordLines,
            fragColor: fragColor,
        }


        this.surface = new ParametricMaterial([128,128], this.vert, this.frag, this.uniforms, defaultOptions);
        this.surface.setName('HopfTorus');

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


export default HopfTorus;
