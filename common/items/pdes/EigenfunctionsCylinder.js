
import { colorConversion } from "../../shaders/colors/colorConversion.js";
import { ParametricMaterial } from "../../materials/ParametricMaterial.js";


let uniforms = {
    m:{
        type: 'int',
        value: 1,
        range: [0,10,1],
    },
    n:{
        type: 'int',
        value: 2,
        range: [0,10,1],
    },
    radius:{
        type: 'float',
        value: 1,
        range: [0.01,3,0.01],
    },
    height:{
        type: 'float',
        value: 2,
        range: [0.01,5,0.01],
    },
    boundary:{
        type: 'int',
        value: 0,
        range: [{
            'Neumann': 0,
            'Dirichlet': 1,
        }],
    },
    amplitude:{
        type: 'float',
        value: 1,
        range: [0.01,3,0.01],
    },
};







let vertAux = ``;

//need  a function vec3 displace(vec3 origV)
//uv has its two xy components in (0,1)

let parametricSurf = `
    vec3 parametricSurf( vec2 uv){
    
    float theta = 2.*PI * uv.x;
    float y = 2.*height * uv.y-height;
    float x = radius * cos(theta);
    float z = radius * sin(theta);
    
    return vec3(x,y,z);
    }`;

let displace = parametricSurf + `

//compute the position of the cylinder, and its displacement:
//so: inside displace() we will set vVec3 and vVec2:

vec3 displace( vec2 uv ){

    //get the coordinates of where we are at:
    float theta = 2.*PI * uv.x;
    float y = 2.*height * uv.y - height;
    
    //compute the eigenfunction corresponding to n,m at this point:
    float M = float(m);
    float N = float(n);
    
    float val;
     if(boundary==0){
        val = cos(N * theta) * cos(PI*M * y/height);
     }
     else{
        val = cos(N * theta) * sin(PI*M * y/height);
     }
    float lambda = sqrt(N*N+M*M);
    //save this:
    vVec2 = vec2(val, lambda);
    
    //figure out where the plane goes in space:
    //SAVE AS A VARYING FOR THE FRAGMENT SHADER
    vVec3 = parametricSurf( uv );
    
    //how should this affect the position vector?
    float mag = sin(lambda * time) * val;
    mag *= amplitude/lambda;
    vec3 dR = mag * vec3( vVec3.x, 0, vVec3.z);
   
    //multiply the position vector of the sphere by this new quantity
    return vVec3 + 0.5*dR;
}
`;









//really just need to be able to send the final harmonic along as a varying!!
let fragAux = colorConversion;


//need to make a function vec3 fragColor();
const fragColor = `
      vec3 fragColor(){
      
            float val = vVec2.x;
            float lambda = vVec2.y;
            float mag = sin(lambda*time)*val;
      
            vec3 col;
            float k = 2./3.14159*atan(2.*mag);
            float hue = 1.-(1.+k)/2.-0.2;

            float sat = 0.6;
  
           
           //change lightness to get dark areas:
           float light = 0.15*(pow(abs(sin(20.*k)),30.))+0.9;
         
           
            col = hsb2rgb(vec3(hue, sat, 0.5*light));

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

let cyl = new ParametricMaterial([512,1024], vert, frag, uniforms, options);
cyl.setName('CylinderEigenfunctions');

export default { cyl };
