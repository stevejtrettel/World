import{ globals } from "../globals.js";
import { ComputeSystem } from "../../../common/gpu/ComputeSystem.js";
import { CSQuad } from "../../../common/gpu/displays/CSQuad.js";
import {ComputeMaterial} from "../../../common/materials/ComputeMaterial.js";
import { colorConversion } from "../../../common/shaders/colors/colorConversion.js";




const parameterization = `
    vec3 parameterization( float u, float v ){
         float x = (b+a*cos(v))*cos(u);
         float y = (b+a*cos(v))*sin(u);
         float z = a*sin(v);

        return vec3(x,y,z);
    }
`;




const fetch = `
    vec3 fetch(sampler2D tex, ivec2 ij) {

        return texelFetch(tex, ij, 0).xyz;
    }
    `;


const derivativeCalc = `

            vec3 texDerivativeCentral(sampler2D tex, ivec2 ij, ivec2 dir){
                vec3 value0 = fetch( tex, ij - dir );
                vec3 value1 = fetch( tex, ij + dir );
                
                float ep;
                if(dir.x==1){
                    ep=1./res.x;
                }
                else{
                    ep=1./res.y;
                }

                float h = 2.*ep;
                
                vec3 tang = ( value1 - value0 ) / h;
                
                return tang;
            }
                
            vec3 texDerivativeRight(sampler2D tex, ivec2 ij, ivec2 dir){
            
                vec3 value0 = fetch( tex, ij  );
                vec3 value1 = fetch( tex, ij + dir );
                
                float ep;
                if(dir.x==1){
                    ep=1./res.x;
                }
                else{
                    ep=1./res.y;
                }

                float h = ep;
                
                vec3 tang = ( value1 - value0 ) / h;
                
                return tang;
            }
            
            vec3 texDerivativeLeft(sampler2D tex, ivec2 ij, ivec2 dir){
            
                vec3 value0 = fetch( tex, ij -dir  );
                vec3 value1 = fetch( tex, ij  );
                
                float ep;
                if(dir.x==1){
                    ep=1./res.x;
                }
                else{
                    ep=1./res.y;
                }

                float h = ep;
                
                vec3 tang = ( value1 - value0 ) / h;
                
                return tang;
            }
            
            

            vec3 texDerivative( sampler2D tex, ivec2 ij, ivec2 dir ){
            
                //need to worry about edge cases: what happens at the boundary of the texture?
                
                ivec2 testRight = ij+dir;
                ivec2 testLeft = ij-dir;
                
                
                if(testLeft.x<1||testLeft.y<1){
                    //only sample the current point and the one in front
                    return texDerivativeRight(tex,ij,dir);
                }
                else if(testRight.x>int(res.x)-1||testRight.y>int(res.y)-1){
                    //only sample the current point and the one behind
                    return texDerivativeLeft(tex,ij,dir);
                }
                else{
                    //the generic case, do the central difference
                    return texDerivativeCentral(tex,ij,dir);
                }
            }
        `;

const pointShader = parameterization + `
            void main(){

                 vec2 uv = gl_FragCoord.xy/res;
                 uv *= 6.29;
                 
                 float u = uv.x;
                 float v = uv.y;
                
                 vec3 pos = parameterization( u, v );

                 
                 gl_FragColor = vec4(pos,1.);
            }
        `;


const tangentUShader = fetch + derivativeCalc + `
        void main(){
            ivec2 ij = ivec2(gl_FragCoord.xy-vec2(0.5));
            ivec2 dir = ivec2(1,0);
            
            vec3 posU = texDerivative(point, ij, dir);
            
            gl_FragColor = vec4(posU,0);
        }
        `;

const tangentVShader = fetch + derivativeCalc + `
        void main(){
            ivec2 ij = ivec2(gl_FragCoord.xy-vec2(0.5));
            ivec2 dir = ivec2(0,1);
            
            vec3 posV = texDerivative(point, ij, dir);
            
            gl_FragColor = vec4(posV,0);
        }
        `;


const normalVecShader = fetch + `
        void main(){
            ivec2 ij = ivec2(gl_FragCoord.xy-vec2(0.5));
            
            vec3 tU = fetch(tangentU, ij);
            vec3 tV = fetch(tangentV, ij);
           
            vec3 nVec = cross( tU, tV );
            nVec = normalize( nVec );
            
            gl_FragColor=vec4(nVec, 0.);
        }
        `;


const firstFFShader = fetch + `
        void main(){
            ivec2 ij = ivec2(gl_FragCoord.xy-vec2(0.5));
            
            vec3 tU = fetch(tangentU, ij);
            vec3 tV = fetch(tangentV, ij);
            
            float E = dot( tU, tU );
            float F = dot( tU, tV );
            float G = dot( tV, tV );
            
            vec3 I = vec3(E,F,G);
            
            gl_FragColor=vec4( I, 0. );
        }
        `;

const secondFFShader = fetch + derivativeCalc + `
        void main(){
            ivec2 ij = ivec2(gl_FragCoord.xy-vec2(0.5));
            ivec2 eU = ivec2(1,0);
            ivec2 eV = ivec2(0,1);
           
           //get the normal vector
            vec3 nVec = fetch(normalVec, ij);
            
            //compute the second derivatives of the parameterization:
            vec3 posUU = texDerivative(tangentU, ij, eU);
            vec3 posUV = texDerivative(tangentU, ij, eV);
            vec3 posVV = texDerivative(tangentV, ij, eV);
            
            float L = dot( posUU, nVec );
            float M = dot( posUV, nVec );
            float N = dot( posVV, nVec );
            
            vec3 II = vec3(L, M, N);
            
            gl_FragColor=vec4( II, 0. );
        }
        `;


const curvatureShader = fetch + `
        void main(){
            ivec2 ij = ivec2(gl_FragCoord.xy-vec2(0.5));
            
            vec3 I = fetch(firstFF, ij);
            float E = I.x;
            float F = I.y;
            float G = I.z;
            
            vec3 II = fetch(secondFF, ij);
            float L = II.x;
            float M = II.y;
            float N = II.z;
            
            float gaussCurvature = (L*N-M*M)/(E*G-F*F);
            
            float meanCurvature = (E*N-2.*F*M+G*L)/(2.*(E*G-F*F));
            
            gl_FragColor = vec4( gaussCurvature, meanCurvature, 0, 0);
        }
        `;








const variables = ['point', 'tangentU', 'tangentV', 'normalVec', 'firstFF', 'secondFF', 'curvature' ];

const shaders = {
    point: pointShader,
    tangentU: tangentUShader,
    tangentV: tangentVShader,
    normalVec: normalVecShader,
    firstFF: firstFFShader,
    secondFF: secondFFShader,
    curvature: curvatureShader,
};

const uniforms = {
    a: {
        type: `float`,
        value: 1,
        range: [0, 2, 0.01],
    },
    b: {
        type: `float`,
        value: 2,
        range: [1, 3, 0.01],
    }
};

const options = {
    res:[128,128],
};



let computer = new ComputeSystem(
    variables,
    shaders,
    uniforms,
    options,
    globals.renderer,
);
computer.setName('Surface');


//set up its display:
//everything here is working!
let surfaceDisplay = new CSQuad( computer );













// make the compute material!!!!


const vertAux = ``;

//need  a function vec3 displace(vec2 uv)
//uv takes values in (0,1)^2
const displace = `
vec3 displace( vec2 uv ){
    return texture(point, uv).xyz;
}
`;

const nVec = `
    vec3 nVec( vec2 uv ){
        return texture(normalVec, uv).xyz;
    }
`;



const  fragAux = colorConversion;

//need to make a function vec3 fragColor();
const fragColor = `
            vec3 fragColor(){
            
            //get gaussian curvature:
                float curv = texture2D(curvature, vUv).x;
                float k = tanh(3.*curv);
                float sat = 0.8*abs(k);
                
                float hue;
                if(curv<0.){
                    hue = 0.6;
                   }
               else{
                    hue = 0.;
                }
               
                vec3 col = hsb2rgb(vec3(hue, sat, 0.7));
               
                return col;
            }
            `;



let matOptions = {
    clearcoat:0.1,
    metalness:0.,
    roughness:0.4,
};


let vert = {
    aux: vertAux,
    displace: displace,
    nVec: nVec,
};

let frag = {
    aux: fragAux,
    fragColor: fragColor,
};


let surface = new ComputeMaterial(computer, vert, frag, matOptions);











const computeSurface = {
    computer: computer,
    display: surfaceDisplay,
    surface: surface
};

export{ computeSurface };
