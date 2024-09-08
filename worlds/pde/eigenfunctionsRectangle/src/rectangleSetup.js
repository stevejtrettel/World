


import {colorConversion} from "../../../../code/shaders/colors/colorConversion.js";


let uniforms = {
    xLength:{
        type: 'float',
        value: 5,
        range: [0,10,0.1],
    },
    yLength:{
        type: 'float',
        value: 5,
        range: [0,10,0.1],
    },
    n:{
        type: 'float',
        value: 1,
        range: [0,10,1],
    },
    m:{
        type: 'float',
        value: 3,
        range: [0,10,1],
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
};




let vertAux = ``;



//need  a function vec3 displace(vec3 origV)
//origV has its two xy components in (0,1)
let displace = `
vec3 displace( vec2 uv ){


    float x = 2.*xLength * uv.x - xLength;
    float y = 2.*yLength * uv.y - yLength;
    
    float xSin = sin( PI * x/xLength * n );
    float ySin = sin( PI * y/yLength * m);
    
    float lambda = sqrt(n*n+m*m)/2.;
    float tSin = sin( lambda * time );
    
    float z = 2.* amplitude/lambda * xSin * ySin * tSin;
    
    return vec3( x, z, -y );
}
`;










let fragAux = colorConversion;


//need to make a function vec3 fragColor();
const fragColor = `
      vec3 fragColor(){

            float height = vPosition.y;
            
            vec3 col;
            float k = 2./3.1415*atan(2.*height);
            float hue = 1.-(1.+k)/2.-0.2;

            float sat = 0.6;
           
           //change lightness to get dark areas:
           float mag = 0.15*(pow(abs(sin(20.*k)),30.))+0.9;
           
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


let res = [512,512];

export {res, vert, frag, uniforms};
