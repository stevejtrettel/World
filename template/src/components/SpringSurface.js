import {globals} from "../globals.js";

import {VerletDissipative} from "../../../common/gpu/VerletDissipative.js";
import {ComputeMaterial} from "../../../common/materials/ComputeMaterial.js";

import { colorConversion } from "../../../common/shaders/colors/colorConversion.js";

import { singleSpringForce } from "../../../common/shaders/springs/singleSpringForce.js";
import { singleSpringDrag } from "../../../common/shaders/springs/singleSpringDrag.js";
import { gridSpringsForce, diagSpringsForce } from "../../../common/shaders/springs/springForces_Grid2D.js";
import { gridSpringsDrag, diagSpringsDrag } from "../../../common/shaders/springs/springDrag_Grid2D.js";
import { setIJ, onEdges, fetch } from "../../../common/shaders/springs/setup.js";






//-------------------------------------------------------------------
// SETUP THE SPRING FORCES
//-------------------------------------------------------------------


const springForces = onEdges + singleSpringForce + gridSpringsForce + diagSpringsForce + `
    vec4 springForces( sampler2D posTex, ivec2 ij ){
        vec4 totalForce = vec4(0.);
        
        totalForce += gridSpringsForce(posTex, ij);
        totalForce += diagSpringsForce(posTex, ij);
        
        totalForce += doubleGridSpringsForce(posTex, ij);
        totalForce += doubleDiagSpringsForce(posTex, ij);
        
        return totalForce;
    }
`;

const envForces = `
    vec4 envForces( sampler2D posTex, ivec2 ij ){
       vec4 totalForce = vec4(0.);
        
        //the force from gravity is constant, downwards:
        totalForce += vec4( 0, -5.*mass, 0, 0);
       
        
        return totalForce;
    }
`;









const springDrag =  singleSpringDrag + gridSpringsDrag + diagSpringsDrag + `
    vec4 springDrag( sampler2D velTex, ivec2 ij ){
    
        vec4 totalDrag = vec4(0.);

        totalDrag += gridSpringsDrag( velTex, ij );
        totalDrag += diagSpringsDrag( velTex, ij );

        return totalDrag;
    }
`;

const airDrag = `
    vec4 airDrag( sampler2D velTex, ivec2 ij ){
    
        vec4 totalDrag = vec4(0.);
        
        vec4 vel = fetch( velTex, ij );
        
        totalDrag += -airDragConst * vel;
       
        return totalDrag;
    }
`;








//-------------------------------------------------------------------
// SETUP THE CLOTH MATERIAL
//-------------------------------------------------------------------

const  fragAux = colorConversion;

//need to make a function vec3 fragColor();
const fragColor = `
            vec3 fragColor(){
            
            vec3 col;
            
            vec4 vel = texture(velocity, vUv);
            float speed = length(vel);

            float k = 2./3.1415*atan(2.*speed);
            
            float hue = 1.-(1.+k)/2.-0.2;

            float sat = 0.5;
           // sat =0.25*abs(k)+0.25;
           
           //change lightness to get dark areas:
           float mag=1.;

           mag = 0.15*(pow(abs(sin(20.*k)),30.))+0.9;
          
            col = hsb2rgb(vec3(hue, sat, 0.5*mag));
           
         
                return col;
            }
            `;












class SpringSurface {

    constructor(arraySize, springParameters, springConditions, springMaterial, renderer){

        //copy over all the data
        this.arraySize=arraySize;
        this.renderer = renderer;

        //extra uniforms, beyond time, resolution, and the data of each shader
        let uniforms = {
            mass: { type: 'float', value: springParameters.mass },
            springConstShort: { type:'float', value: springParameters.springConstShort},
            springConstLong: { type:'float', value: springParameters.springConstLong},
            gridSpacing: { type: 'float', value: springParameters.gridSpacing },
            springDragConst: { type: 'float', value: springParameters.springDragConst },
            airDragConst: { type: 'float', value: springParameters.airDragConst },
        };







        const iniPositionShader = setIJ + fetch + springConditions.position + `
    void main(){
           ivec2 ij = setIJ();
           
           vec4 iniPos = getInitialPos( ij );
           gl_FragColor = iniPos;
        }
`;


        const iniVelocityShader= setIJ + fetch + springConditions.velocity + `
        void main(){
             ivec2 ij = setIJ();
             
             vec4 iniVel = getInitialVel(ij);
             gl_FragColor = iniVel;
        }
        `;


        const initialCond = {
            position: iniPositionShader,
            velocity: iniVelocityShader,
        };










        //all together these constitute the conservative forces of the system:
        const getForceConservative = springForces + envForces + springConditions.boundary + `
            vec4 getForceConservative( sampler2D posTex, sampler2D velTex, ivec2 ij ){
            
                vec4 totalForce=vec4(0.);
                totalForce += springForces( posTex, ij );
                totalForce += envForces( posTex, ij );
            
                setBoundaryConditions( ij, totalForce );
            
                return totalForce;
            }  
        `;


        const getForceDissipative = onEdges + springDrag + airDrag + springConditions.boundary + `
            vec4 getForceDissipative( sampler2D posTex, sampler2D velTex, ivec2 ij ){
            
                vec4 totalDrag = vec4(0.);
        
                totalDrag += springDrag( velTex, ij );
                totalDrag += airDrag( velTex, ij );
                
                setBoundaryConditions( ij, totalDrag );
                
                return totalDrag;
            }
        `;

        const forces = {
            conservative: getForceConservative,
            dissipative: getForceDissipative
        };



        const vertAux = ``;

        //place points on the surface mesh by their position on the position variable:
        const displace = `
                vec3 displace( vec2 uv ){
                    return texture(positionX, uv).xyz;
                }
                `;


        let vert = {
            aux: vertAux,
            displace: displace,
        };

        let frag = {
            aux: fragAux,
            fragColor: fragColor,
        };



        //build the Integrator for this:
        this.integrator = new VerletDissipative(forces, initialCond, uniforms, this.arraySize, this.renderer);

        //build the display for this
        this.surface = new ComputeMaterial(this.integrator.computer, springMaterial.uniforms, vert, frag, springMaterial.options);

    }


    addToScene(scene){

        this.integrator.initialize();
        this.surface.addToScene(scene);

    }



    addToUI(ui){

    }



    tick(time,dTime){

        this.integrator.tick(time,dTime);
        this.surface.tick(time,dTime);
    }

    setIterations(n){
        this.integrator.setIterations(n);
    }

}





















//-------------------------------------------------------------------
// BUILDING AN EXAMPLE
//-------------------------------------------------------------------



let matUniforms = {};

let matOptions = {
    clearcoat:0.5,
    metalness:0.,
    roughness:0.5,
};

let springMaterial = {
    uniforms: matUniforms,
    options: matOptions,
};



let springParameters = {
    mass:0.1,
    springConstShort: 30.,
    springConstLong: 60.,
    gridSpacing : 0.5,
    springDragConst : 0.75,
    airDragConst : 0.005,
};


const getInitialPos = `
        vec4 getInitialPos( ivec2 ij ){
               vec4 xdir = vec4(1,0,0,0);
               vec4 ydir = normalize(vec4(0,0,1,0));
               
               float x = float(ij.x);
               float y = float(ij.y);
             
                vec4 origin = vec4(-res.x/2.+30., -res.y/2., -100, 0.);
               return  origin + gridSpacing * (x*xdir + y*ydir);
        }
`;

const getInitialVel = `
    vec4 getInitialVel( ivec2 ij ){
        return vec4(0);
    }
`;

const setBdyCond = `
    void setBoundaryConditions(ivec2 ij, inout vec4 totalForce ){
        //if(ij.y==int(res.y)-1 && (ij.x==0||ij.x==int(res.x/2.)||ij.x==int(res.x)-1)){totalForce = vec4(0);}
        if(onCorner(ij)){totalForce =vec4(0);}
    }`;


const springConditions = {
    position: getInitialPos,
    velocity: getInitialVel,
    boundary: setBdyCond,
};



let cloth = new SpringSurface([64,64], springParameters, springConditions, springMaterial, globals.renderer);
cloth.setIterations(20);



export { SpringSurface };

export default { cloth };


