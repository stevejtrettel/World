import{ globals } from "../../template/src/globals.js";
import { ComputeSystem } from "../gpu/ComputeSystem.js";
import { CSQuad } from "../gpu/displays/CSQuad.js";
import {ComputeMaterial} from "../materials/ComputeMaterial.js";
import { colorConversion } from "../shaders/colors/colorConversion.js";
import {LinearFilter, NearestFilter} from "../../3party/three/build/three.module.js";






let equations = {
    x: '(b+a*cos(u))*cos(v)',
    y: '(b+a*cos(u))*sin(v)',
    z: 'a*sin(u)+0.5*cos(u)*sin(3.*v)*sin(time)',
};

let domain = {
    uMin: -3.14,
    uMax: 3.14,
    vMin: -3.14,
    vMax: 3.14,
};


//BULD A BETTER WAY OF DOING THIS IN THE FUTURE!
equations.addToUI = (ui)=>{
    let eqnFolder = ui.addFolder(`Equations`);
    eqnFolder.add(equations,'x').name('x(u,v)=').onChange(
        ()=>{computer.recompile('point');
        });
    eqnFolder.add(equations,'y').name('y(u,v)=').onChange(
        ()=>{
            computer.recompile('point')
        });
    eqnFolder.add(equations,'z').name('z(u,v)=').onChange(
        ()=>{computer.recompile('point')
        });

    let domFolder = ui.addFolder('Domain');
    domFolder.add(domain,'uMin',-6.3,6.3,0.01).onChange(
        ()=>{
            computer.recompile('point')
        });
    domFolder.add(domain,'uMax',-6.3,6.3,0.01).onChange(
        ()=>{
            computer.recompile('point')
        });
    domFolder.add(domain,'vMin',-6.3,6.3,0.01).onChange(
        ()=>{
            computer.recompile('point')
        });
    domFolder.add(domain,'vMax',-6.3,6.3,0.01).onChange(
        ()=>{
            computer.recompile('point')
        });
};
equations.addToScene = ()=>{};




let buildPointShader = ()=> {
    return `
            void main(){

                 vec2 uv = gl_FragCoord.xy/res;
                 
                 float u = (float(${domain.uMax})-float(${domain.uMin}))/0.97*uv.x+float(${domain.uMin});
                 float v = (float(${domain.vMax})-float(${domain.vMin}))/0.97*uv.y+float(${domain.vMin});
                 
                 float x = ${equations.x};
                 float y = ${equations.y};
                 float z = ${equations.z};
                 
                 vec3 pos = vec3(x,y,z);
                 
                 gl_FragColor = vec4(pos,1.);
            }
        `;
}



//
// const pointShader = `
//             void main(){
//
//                  vec2 uv = gl_FragCoord.xy/res;
//
//                  float u = float(${domain.u[1]-domain.u[0]})*uv.x+float(${domain.u[0]});
//                  float v = float(${domain.u[1]-domain.u[0]})*uv.y+float(${domain.u[0]});
//
//                  float x = ${equations.x};
//                  float y = ${equations.y};
//                  float z = ${equations.z};
//
//                  vec3 pos = vec3(x,y,z);
//
//                  gl_FragColor = vec4(pos,1.);
//             }
//         `;
//



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
                return texDerivativeRight(tex,ij,dir);
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
    point: buildPointShader,
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
    },
    c: {
        type: `float`,
        value: 0,
        range: [-1, 1, 0.01],
    }
};

const options = {
    res:[256,256],
    filter:LinearFilter,
};



let computer = new ComputeSystem(
    variables,
    shaders,
    uniforms,
    options,
    globals.renderer,
);
computer.setName('Parameters');


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
            
            vec3 col;
            float curv;
            
            //first: if we are gaussian mor mean curvature:
            if(coloration < 2) {
            
            if( coloration == 0 ){
                curv = texture(curvature, vUv).x;
            }
            if( coloration ==1 ){
                 curv = texture(curvature, vUv).y;
            }

            float k = 2./3.1415*atan(2.*curv);
            
            float hue = 1.-(1.+k)/2.-0.2;

            float sat = 0.5;
           // sat =0.25*abs(k)+0.25;
           
           //change lightness to get dark areas:
           float mag=1.;
           if(equipotentials){
                mag = 0.15*(pow(abs(sin(20.*k)),30.))+0.9;
           }

            col = hsb2rgb(vec3(hue, sat, 0.5*mag));
            
          }
            
         //otherwise, we are the gauss map:
         //assign colors based on a sphere: white = north pole, black = south pole, hue = longitude   
         else{
         
            vec3 nVec = texture(normalVec, vUv).xyz;
            float phi = acos(nVec.z);
            float theta = atan(nVec.y, nVec.x);
            
            float hue = theta/6.29;
            float lightness = 0.5*phi/3.14+0.2;
            float sat = 0.6*sin(phi);
            
           //equipotentials give spherical grid:
           float mag=1.;
           if(equipotentials){
                float thetaLines = abs(sin(20.*theta));
                float phiLines = abs(sin(20.*phi));
                mag = 0.1*(pow(phiLines,30.))+0.1*(pow(thetaLines,30.))+0.9;
           }
           
           
            col = hsb2rgb(vec3(hue, sat,mag*lightness));
             
             }
               
               
               
                return col;
            }
            `;



let matOptions = {
    clearcoat:1.,
    metalness:0.0,
    roughness:0.3,
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




//these are all just for the fragColor shader:
let matUniforms = {
    coloration:{
        type: 'int',
        value: 0,
        range: [{
            'Gaussian Curvature': 0,
            'Mean Curvature': 1,
            'Gauss Map': 2,
        }],
    },
    equipotentials:{
        type:'bool',
        value:true,
        range:[],
    }
    // positiveHue:{
    //     type: 'float',
    //     value: 0,
    //     range: [0,1,0.01],
    // },
    // negativeHue:{
    //     type: 'float',
    //     value:0.6,
    //     range:[0,1,0.01],
    // },
    // saturation:{
    //     type: 'float',
    //     value: 0.75,
    //     range: [0,1,0.01],
    // },
    // lightness:{
    //     type: 'float',
    //     value:0.5,
    //     range:[0,1,0.01],
    // }
}


let surface = new ComputeMaterial(computer, matUniforms, vert, frag, matOptions);
surface.setName('Coloration');





class PixelReader {
    constructor(computer, variable, i,j){
        this.computer=computer;
        this.variable=variable;
        this.i=i;
        this.j=j;
    }

    addToScene(scene){}

    addToUI(ui){}

    tick(){
        console.log(this.computer.compute[this.variable].readPixel(this.i,this.j));

    }
}






// THIS IS JUST PRACTICE TO SEE IF MY READPIXEL COMMAND WORKS: IT DOES!

let readout = new PixelReader(computer, 'curvature',5,5);

const computeSurface = {
    eqn: equations,
    computer: computer,
  //  display: surfaceDisplay,
    surface: surface,
    //pixelReader:readout
};

export default computeSurface;
