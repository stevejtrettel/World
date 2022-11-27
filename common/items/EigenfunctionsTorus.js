import { rotateR4 } from "../shaders/geometry/rotateR4.js";
import { projectR4 } from "../shaders/geometry/projectR4.js";
import { colorConversion } from "../shaders/colors/colorConversion.js";
import { ParametricMaterial } from "../materials/ParametricMaterial.js";


let uniforms = {
    m:{
        type: 'int',
        value: 3,
        range: [0,10,1],
    },
    n:{
        type: 'int',
        value: 3,
        range: [0,10,1],
    },
    aspectRatio:{
        type: 'float',
        value: 0.8,
        range: [0.05,0.95,0.01],
    },
    amplitude:{
        type: 'float',
        value: 0.75,
        range: [0.01,3,0.01],
    },
    rotation:{
        type: 'float',
        value: 0.1,
        range: [0,1,0.01],
    },
};




let vertAux = rotateR4+projectR4;

//need  a function vec3 displace(vec3 origV)
//uv has its two xy components in (0,1)

let parametricSurf = `

    //parameterization of the clifford torus in the 3 sphere:
    vec4 torus( vec2 uv){
    
    float s = 2.*PI*uv.x;
    float t = 2.*PI*uv.y;
    
    float r1 = sin(PI/2.*aspectRatio);
    float r2 = cos(PI/2.*aspectRatio);
    
    vec2 xy = vec2(cos(s),sin(s));
    vec2 zw = vec2(cos(t),sin(t));
    
    return vec4(r1*xy, r2*zw);
    
    }
    
    
    vec4 torusNormal( vec2 uv ){
        
        float s = 2.*PI*uv.x;
        float t = 2.*PI*uv.y;
        
        float r1 = sin(PI/2.*aspectRatio);
        float r2 = cos(PI/2.*aspectRatio);
        
        vec2 xy = vec2(cos(s),sin(s));
        vec2 zw = vec2(cos(t),sin(t));
        
        //almost the same! But negate the first vector and switch r1, r2:
        return vec4(-r2*xy, r1*zw);
   
    }
`;



let displace = parametricSurf + `

//compute the position of the cylinder, and its displacement:
//so: inside displace() we will set vVec3 and vVec2:

vec3 displace( vec2 uv ){

    //get the coordinates:
    float s = 2.*PI*uv.x;
    float t = 2.*PI*uv.y;
    
    //compute the eigenfunction corresponding to n,m at this point:
    float M = float(m);
    float N = float(n);
    float val = cos(M*s)*cos(N*t);
    
    float lambda = sqrt( N*N + M*M );
    //save this:
    vVec2 = vec2(val, lambda);
    
    //how should this affect the position vector?
    float mag = sin(lambda/4. * time) * val;
    mag *= 0.2 * amplitude;
    

    //get the point on the torus:
    vec4 torusPos = torus(uv);
    
    //find the normal vector in S3 to the torus at this point:
    vec4 torusN = torusNormal(uv);
   
    //add this shift in position to the original
    vec4 adjustedPos = torusPos + mag*torusN;
    adjustedPos = normalize(adjustedPos);
    
    
    //now need to stereographically project into R3 so that we can see it!
    //rotate q in R4 using the time uniform:
    float angle = 0.3 * rotation * time;
    adjustedPos = rotateR4( adjustedPos, 0.5 * angle, 0.7 * angle, -0.4 * angle );
    vec3 p = stereographicProj( adjustedPos );

    return 2.*p;
}
`;




//really just need to be able to send the final harmonic along as a varying!!
let fragAux = colorConversion;


//need to make a function vec3 fragColor();
const fragColor = `
      vec3 fragColor(){
      
            float val = vVec2.x;
            float lambda = vVec2.y;
            float mag = sin(lambda/4. * time) * val;
      
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

let torus = new ParametricMaterial([512,512], vert, frag, uniforms, options);
torus.setName('TorusEigenfunctions');

export default { torus };
