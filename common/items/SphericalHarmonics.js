import SphericalHarmonic from "../shaders/math/sphericalHarmonic.js";
import { colorConversion } from "../shaders/colors/colorConversion.js";
import { ParametricMaterial } from "../materials/ParametricMaterial.js";
import sphericalHarmonic from "../shaders/math/sphericalHarmonic.js";




let uniforms = {
    l:{
        type: 'int',
        value: 4,
        range: [0,10,1],
    },
    m:{
        type: 'int',
        value: 2,
        range: [-10,10,1],
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
            'Polar': 1,
        }],
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
vec3 displace( vec2 uv ){

    //figure out where the plane goes in space:
    vec3 pos = parametricSurf(uv);
    
    //find the value of the harmonic at this point
    vec2 harmonic =  sphericalHarmonic( l, m, pos);
    
    //get the real part of the spherical harmonic:
    float dR = harmonic.y;
    
    //how should this affect the position vector?
    float mag;
    if(plotStyle==0){
        //if we are drawing a plot of displacement:
        //allow ourselves to change the amplitude:
        dR = dR * amplitude;
        //multiply by the frequency of oscillation
        dR = dR * sin(time);
        //preturb the unit sphere by this:
        mag = 1. + dR;
    }
    else{
        //doing a polar plot
        //just plot the radius as dR:
        mag = 3. * dR;
    }
    
    //multiply the position vector of the sphere by this new quantity
    return 2.5*mag*pos;
}
`;










let fragAux = colorConversion;


//need to make a function vec3 fragColor();
const fragColor = `
      vec3 fragColor(){
      
            //should really figure out how to pass the spherical harmonic value as a varying:
            //but for now, a DIRTY TRICK! just undo the mapping to length that was given above:
            
            float SH;
            if(plotStyle == 0){
                //then we need to divide by 2.5, take length, and subtract 1.
                SH = length(vPosition)/2.5-1.;
                SH = SH/amplitude;
                SH = 2.*SH;
            }
            else{
                //otherwise we are doing a polar plot, need to recover Magnitude AND Sign:
                //THIS IS A SAD HACK: JUST IMPLEMENT VARYINGS ALREADY :(
                //since vPosition is multiplied by the spherical harmonic value, we can get the value
                //by taking vPosition and dividing any of its coordinates by the original coordinate on the sphere:
                float sphY = cos(PI*vUv.x);
                SH = vPosition.y / (2.5);
                SH /= sphY;
                
                //now we have the original value SH that we wanted to pass:
                //since we didn't multiply the coordinates by sin(time), do it here for the color
                SH *= sin(time);
            }
            
            vec3 col;
            float k = 2./3.1415*atan(2.*SH);
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


let options = {
    clearcoat:1,
    metalness:0.,
    roughness:0.2,
}

let sphere = new ParametricMaterial([512,512], vert, frag, uniforms, options);
sphere.setName('SphericalHarmonics');

export default { sphere };
