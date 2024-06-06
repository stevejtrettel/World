import hydrogenOrbital from "../../shaders/math/hydrogenOrbital.js";
import { colorConversion } from "../../shaders/colors/colorConversion.js";
import { ParametricMaterial } from "../../compute/materials/ParametricMaterial.js";




let uniforms = {
    n:{
        type: 'int',
        value: 3,
        range: [1,10,1],
    },
    l:{
        type: 'int',
        value: 2,
        range: [0,10,1],
    },
    m:{
        type: 'int',
        value: 2,
        range: [-10,10,1],
    },
    zoom:{
        type: 'float',
        value: 1,
        range: [0.1,10,0.01],
    },
    slice:{
        type: 'float',
        value: 0,
        range: [-1,1,0.01],
    },
};




let vertAux = hydrogenOrbital;

//need  a function vec3 displace(vec3 origV)
//uv has its two xy components in (0,1)

let parametricSurf = `
    vec3 parametricSurf( vec2 uv){
    
    float radius = 5.;
    //convert to a point in 3D space:
    float r  = radius * uv.x-0.003;
    float theta = (2.*PI+0.01) *uv.y;
    float x = r * cos(theta);
    float y = r * sin(theta);
    
    //find the magnitude of the orbital at this point!
    vec3 pos = 10. * zoom * vec3(x,slice,-y);
    
    return pos;
    }`

let displace = parametricSurf + `
vec3 displace( vec2 uv ){

    //figure out where the plane goes in space:
    vec3 pos = parametricSurf(uv);
    
    //find the value of the orbital at this point
    vec2 psi = hydrogenOrbital(n,l,m, pos);
    float mag = psi.x;
    
    //get the energy to get the frequency of change of phase:
    float E = float(n);
  
    //oscillate in time
    float z = 10.*mag * sin(E*time);
    return pos/(10.*zoom)+vec3(0,z,0);
}
`;










let fragAux = colorConversion;


//need to make a function vec3 fragColor();
const fragColor = `
      vec3 fragColor(){

            //recover the value of the schrodinger wavefunction
            float height = vPosition.y-slice;
            
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

let hydrogenAtom = new ParametricMaterial([512,512], vert, frag, uniforms, options);
hydrogenAtom.setName('Hydrogen');

export default  hydrogenAtom;
