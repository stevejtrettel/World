
import {globals} from "../globals.js";

import {ComputeSystem} from "../../../common/gpu/ComputeSystem.js";
import { CSQuad } from "../../../common/gpu/displays/CSQuad.js";
import { CSSpheres } from "../../../common/gpu/displays/CSSpheres.js";





//components of shaders

const fetch = `
    vec4 fetch(sampler2D tex, ivec2 ij) {

        return texelFetch(tex, ij, 0);
    }
    `;




//write the requisite shaders:

const positionShader=fetch+`
    void main(){
    
         float epsilon = 0.02;
         ivec2 ij = ivec2(int(gl_FragCoord.x),int(gl_FragCoord.y));
            
         vec4 positionLast = fetch(position2, ij);
         vec4 dPosition = fetch(dHdp, ij);
            
         vec4 positionNext = positionLast + dPosition*epsilon/2.;
         gl_FragColor = positionNext;
         
        }
        `;

const iniPositionShader=`
    void main(){
           gl_FragColor = vec4(gl_FragCoord.x-0.5, gl_FragCoord.y-0.5, 0, 0);
        }
`;

const momentumShader=fetch+`
    void main(){
    
            float epsilon = 0.02;
            ivec2 ij = ivec2(int(gl_FragCoord.x),int(gl_FragCoord.y));
            
            vec4 momentumLast = fetch(momentum, ij);
            vec4 dMomentum = -fetch(dHdq, ij);
            
            vec4 momentumNext = momentumLast + dMomentum*epsilon;
            gl_FragColor = momentumNext;
            
        }
`;
const iniMomentumShader=`
    void main(){
    
            if(gl_FragCoord.x==0.5 && gl_FragCoord.y==0.5){
            gl_FragColor = vec4(0,0, 1,0.);
            }
            else{
             gl_FragColor = vec4(0,0, 0,0.);
             }
        }
        `;



const positionShader2=fetch+`
    void main(){
               
         float epsilon = 0.02;
         ivec2 ij = ivec2(int(gl_FragCoord.x),int(gl_FragCoord.y));
            
         vec4 positionLast = fetch(position, ij);
         vec4 dPosition = fetch(dHdp2, ij);
            
         vec4 positionNext = positionLast + dPosition*epsilon/2.;
         gl_FragColor = positionNext;
   
        }
`;



//take in two positions, return the gradient of the distance squared
//of the first to the second, when varying the coordinates of the first:
const gradPEFunction = `

    float PE(vec4 p, vec4 q){
        vec4 v = q-p;
        float l = length(v);
        float delta = l - restL;
        
        return 0.5*springK*delta*delta;
    }
    
    
    vec4 gradPE(sampler2D pos, ivec2 ij, ivec2 uv){
        
        vec4 ijPos = fetch(pos, ij);
        vec4 uvPos = fetch(pos,uv);
        
        float dX, dY, dZ;
        
        vec4 eX=vec4(1,0,0,0);
        vec4 eY=vec4(0,1,0,0);
        vec4 eZ=vec4(0,0,1,0);
        
        float epsilon=0.001;
        
        dX = PE(ijPos+epsilon*eX,uvPos)-PE(ijPos-epsilon*eX,uvPos);
        dY = PE(ijPos+epsilon*eY,uvPos)-PE(ijPos-epsilon*eY,uvPos);
        dZ = PE(ijPos+epsilon*eZ,uvPos)-PE(ijPos-epsilon*eZ,uvPos);
        
        vec4 grad = vec4(dX,dY,dZ,0)/(2.*epsilon);
        
        return grad;
    }
`;


const dHdqShader=fetch+gradPEFunction+ `
    void main(){
        
       ivec2 ij = ivec2(int(gl_FragCoord.x), int(gl_FragCoord.y));
       ivec2 eX=ivec2(1,0);
       ivec2 eY=ivec2(0,1);
       
       vec4 grad=vec4(0);

       
       if( ij.x != 0 ){
          grad+=gradPE(position, ij,ij-eX); 
       }

       if( ij.x != int(res.x)-1 ){
         grad+=gradPE(position, ij,ij+eX); 
       }

       if( ij.y != 0 ){
          grad+=gradPE(position, ij,ij-eY); 
       }

       if( ij.y != int(res.y)-1 ){
          grad+=gradPE(position, ij,ij+eY); 
       }
    
            gl_FragColor = grad;
        }
`;

//the only occurance of momentum in the hamiltonian is in the kinetic term p^2/2m
//thus, the derivative of this is p/m:
//that means, dHdp is just a rescaling of the momentum shader!
const dHdpShader=fetch+`
    void main(){
            ivec2 ij = ivec2(int(gl_FragCoord.x),int(gl_FragCoord.y));
            vec4 momentum = fetch(momentum, ij);
            gl_FragColor = momentum/mass;
        }
`;

//the only occurance of momentum in the hamiltonian is in the kinetic term p^2/2m
//thus, the derivative of this is p/m:
//that means, dHdp is just a rescaling of the momentum shader!
const dHdpShader2=fetch+`
    void main(){
            ivec2 ij = ivec2(int(gl_FragCoord.x),int(gl_FragCoord.y));
            vec4 momentum = fetch(momentum, ij);
            gl_FragColor = momentum/mass;
        }
`;

const shaders = {
    dHdp: dHdpShader,
    position: {
        simulation:positionShader,
        initialization: iniPositionShader,
    },
    dHdq:dHdqShader,
    momentum: {
        simulation: momentumShader,
        initialization: iniMomentumShader,
    },
    dHdp2: dHdpShader2,
    position2: {
        simulation:positionShader2,
        initialization: iniPositionShader,
    },

};












class SpringGrid {
    constructor(arraySize, mass, k, restLength, renderer){

        //copy over all the data
        this.arraySize=arraySize;
        this.mass=mass;
        this.k=k;
        this.restLength=restLength;
        this.renderer = renderer;

        //build the Compute System for this:
        //shaders have resolution numXxnumY
        //there are going to be a position and momentum shaders
        //to compute these, we'll need to know the p and q derivatives of the hamiltonian:
        //not all of these shaders need separate initial conditions; BUT position and momentum do

        let variables=['position', 'momentum', 'position2', 'dHdq', 'dHdp'];

        //extra uniforms, beyond time, resolution, and the data of each shader
        let uniforms = {
            mass:{type:'float', value:this.mass},
            springK:{type:'float', value:this.k},
            restL:{type:'float', value:this.restLength},
        };

        //options for the input:
        let options = {
            res:this.arraySize,
        }

        //these shaders need some uniforms

        this.computer=new ComputeSystem(variables, shaders, uniforms, options, this.renderer);

        this.spheres = new CSSpheres(this.computer, 'position');

    }


    addToScene(scene){

        this.computer.initialize();

        this.spheres.init();
        scene.add(this.spheres);

    }



    addToUI(ui){

    }



    tick(time,dTime){
        this.computer.tick(time,dTime);
        this.spheres.tick(time,dTime);
    }

    }





let springSystem = new SpringGrid([10,10],1,1,1,globals.renderer);

let testDisplay = new CSQuad(springSystem.computer);

export default {
   system: springSystem,
    display: testDisplay,
};
