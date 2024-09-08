
import VerletDissipative from "../../../../code/compute/gpu/VerletDissipative.js";
import ComputeMaterial from "../../../../code/compute/materials/ComputeMaterial.js";

import { colorConversion} from "../../../../code/shaders/colors/colorConversion.js";

import { setIJ, onEdges, fetch } from "../../../../code/shaders/springs/setup.js";
import {SpringStruct} from "../../../../code/shaders/springs/Spring.js";
import { grid2D_springForce } from "../../../../code/shaders/springs/grid2D/grid2D_springForce.js";
import { grid2D_springDamping } from "../../../../code/shaders/springs/grid2D/grid2D_springDamping.js";



//-------------------------------------------------------------------
// SETUP THE SPRING FORCES
//-------------------------------------------------------------------


const envForces = `
    vec4 envForces( sampler2D posTex, ivec2 ij ){
       vec4 totalForce = vec4(0.);
        
        //the force from gravity is constant, downwards:
        totalForce += vec4( 0, -5.*mass, 0, 0);
       
        
        return totalForce;
    }
`;



const envDrag = `
    vec4 envDrag( sampler2D velTex, ivec2 ij ){
    
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
            
            vec4 vel = texture(forceConservative, vUv);
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



//-------------------------------------------------------------------
// DEFAULT VALUES OF THE PARAMETERS
//-------------------------------------------------------------------



let matOptions = {
    clearcoat:0.5,
    metalness:0.,
    roughness:0.5,
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
        if(ij.y==int(res.y)-1 && (ij.x==0||ij.x==int(res.x/2.)||ij.x==int(res.x)-1)){totalForce = vec4(0);}
        //if(onCorner(ij)){totalForce =vec4(0);}
    }`;


const defaultSpringConditions = {
    position: getInitialPos,
    velocity: getInitialVel,
    boundary: setBdyCond,
};

let defaultSpringParameters = {
    mass:0.1,
    springConst: 20.,
    gridSpacing : 0.5,
    dampingConst : 0.1,
    airDragConst : 0.,
    simTimeStep : 0.002,
};

const defaultResolution = [128,64];




let defaultSpringMaterial = {
    uniforms: {},
    options: matOptions,
};



class SpringSurface {

    constructor(
        renderer,
        arraySize = defaultResolution,
        springParameters = defaultSpringParameters,
        springConditions = defaultSpringConditions,
        springMaterial = defaultSpringMaterial
    ){

        //copy over all the data
        this.arraySize=arraySize;
        this.renderer = renderer;
        this.simTimeStep = springParameters.simTimeStep;

        //extra uniforms, beyond time, resolution, and the data of each shader
        let uniforms = {
            mass: { type: 'float', value: springParameters.mass },
            springConst: { type:'float', value: springParameters.springConst},
            gridSpacing: { type: 'float', value: springParameters.gridSpacing },
            dampingConst: { type: 'float', value: springParameters.dampingConst },
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
        const getForceConservative = onEdges + SpringStruct + grid2D_springForce + envForces + springConditions.boundary + `
            vec4 getForceConservative( sampler2D posTex, sampler2D velTex, ivec2 ij ){
            
                vec4 totalForce=vec4(0.);
                totalForce += grid2D_springForce( posTex, ij );
                totalForce += envForces( posTex, ij );
            
                setBoundaryConditions( ij, totalForce );
            
                return totalForce;
            }  
        `;


        const getForceDissipative = onEdges + SpringStruct+ grid2D_springDamping + envDrag + springConditions.boundary + `
            vec4 getForceDissipative( sampler2D posTex, sampler2D velTex, ivec2 ij ){
            
                vec4 totalDrag = vec4(0.);
        
                totalDrag += grid2D_springDamping( velTex, ij );
                totalDrag += envDrag( velTex, ij );
                
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
        this.integrator = new VerletDissipative(forces, initialCond, uniforms, this.arraySize, this.simTimeStep, this.renderer);

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



export default SpringSurface;
