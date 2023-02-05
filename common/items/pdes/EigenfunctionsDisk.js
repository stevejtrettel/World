import bessel from "../../shaders/math/bessel.js";
import { colorConversion } from "../../shaders/colors/colorConversion.js";
import { ParametricMaterial } from "../../materials/ParametricMaterial.js";




let uniforms = {
    radius:{
        type: 'float',
        value: 5,
        range: [0,10,0.1],
    },
    n:{
        type: 'int',
        value: 2,
        range: [1,10,1],
    },
    m:{
        type: 'int',
        value: 2,
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




let vertAux = bessel;

//need  a function vec3 displace(vec3 origV)
//origV has its two xy components in (0,1)
let displace = `
vec3 displace( vec2 uv ){

    float r  = radius * uv.x;
    float s = 2.*PI *uv.y;

    float x = r * cos(s);
    float y = r * sin(s);
    
    float root = besselRoot(m,n);
    float lambda = root/radius;
        
    float sCos = cos(float(m)*s);
    float rBessel = besselJ(m, lambda * r);
    
    float speed = 1.;
    float tSin = sin( speed * lambda * time );
    
    float z = 10./sqrt(root) * amplitude * rBessel * sCos * tSin;
    
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


let options = {
    clearcoat:1,
    metalness:0.,
    roughness:0.2,
}

let drum = new ParametricMaterial([512,512], vert, frag, uniforms, options);
drum.setName('Drum');

export default { drum };
