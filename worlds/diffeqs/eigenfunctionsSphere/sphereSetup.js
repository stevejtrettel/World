
//-------------------------------------------------------------------
// This is just a parametric material!
//-------------------------------------------------------------------





import sphericalHarmonic from "../../../code/shaders/math/sphericalHarmonic.js";
import {colorConversion} from "../../../code/shaders/colors/colorConversion.js";

let uniforms = {
    l:{
        type: 'int',
        value: 4,
        range: [0,15,1],
    },
    m:{
        type: 'int',
        value: 2,
        range: [-15,15,1],
    },
    amplitude:{
        type: 'float',
        value: 1,
        range: [0.01,3,0.01],
    },
    plotStyle:{
        type: 'int',
        value: 0,
        range: [{
            'Displacement': 0,
            'Modulus': 1,
            'Polar': 2,
        }],
    },
    correctSpeed:{
        type: 'bool',
        value: false,
        range: [],
    },
};







let vertAux = sphericalHarmonic;

//need  a function vec3 displace(vec3 origV)
//uv has its two xy components in (0,1)

let parametricSurf = `
    vec3 parametricSurf( vec2 uv){
    
    float phi = PI * uv.x;
    float theta = 2.*PI * uv.y;
    
    float x = cos(theta)*sin(phi);
    float y = sin(theta)*sin(phi);
    float z = cos(phi);
    
    return vec3(x,z,-y);
    }`;

let displace = parametricSurf + `

//compute the sphere position and the harmonic value as varyings:
//so: inside displace() we will set vVec3 and vVec2:

vec3 displace( vec2 uv ){

    //figure out where the plane goes in space:
    //SAVE AS A VARYING FOR THE FRAGMENT SHADER
    vVec3 = parametricSurf( uv );
    
    //find the value of the harmonic at this point
    //SAVE AS A VARYING FOR THE FRAGMENT SHADER
    vVec2 =  sphericalHarmonic( l, m, vVec3);
    
    //get the real part of the spherical harmonic:
    float dR = vVec2.x;
    
    //what is the frequency that we move at?
    float lambda = 1.;
    if(correctSpeed){
        float L = float(l);
        lambda = sqrt(L*(L+1.))/4.;
    }
    
    //how should this affect the position vector?
    float mag;
    if(plotStyle==0){
        //if we are drawing a plot of displacement:
        //allow ourselves to change the amplitude:
        dR = dR * amplitude;
        //multiply by the frequency of oscillation
        dR = dR * sin(lambda * time);
        //preturb the unit sphere by this:
        mag = 1. + dR;
    }
    else if(plotStyle==1){
        //directly plotting the modulus, in the same direction as original:
        mag = 3.*abs(dR);
    }
    else{
        //doing a polar plot
        //just plot the radius as dR:
        mag = 3. * dR;
    }
    
    //multiply the position vector of the sphere by this new quantity
    return 2.5*mag*vVec3;
}
`;









//really just need to be able to send the final harmonic along as a varying!!
let fragAux = colorConversion;


//need to make a function vec3 fragColor();
const fragColor = `
      vec3 fragColor(){
      
        //what is the frequency that we move at?
        float lambda = 1.;
        if(correctSpeed){
            float L = float(l);
            lambda = sqrt(L*(L+1.))/4.;
        }
          
            //get the real part of the spherical harmonic:
            //this was stored as a varying vec2 in the function above:
            float SH = vVec2.x*sin(lambda * time);
            
            
            if(plotStyle==0){
                //NO IDEA why this is more accurate in this case: but it seems better to recover from vPosition!
                //then we need to divide by 2.5, take length, and subtract 1.
                SH = length(vPosition)/2.5-1.;
                 SH = SH/amplitude;
           }
          
      
            vec3 col;
            float k = 2./3.14159*atan(4.*SH);
            float hue = 1.-(1.+k)/2.-0.2;

            float sat = 0.6;
  
           
           //change lightness to get dark areas:
           float mag = 1.;
           if(plotStyle==0){
                //plot equipotentials if we are oscillating the sphere
                 mag = 0.15*(pow(abs(sin(20.*k)),30.))+0.9;
           }

           
            col = hsb2rgb(vec3(hue, sat, 0.5*mag));

            return col;
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


let res = [512,1024];

export {res, vert, frag, uniforms};
