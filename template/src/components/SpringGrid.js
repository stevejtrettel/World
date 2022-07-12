
import {globals} from "../globals.js";

import { CSQuad } from "../../../common/gpu/displays/CSQuad.js";
import { CSSpheres } from "../../../common/gpu/displays/CSSpheres.js";
import {VerletGPU} from "../../../common/gpu/VerletGPU.js";


//components of shaders

const fetch = `
    vec4 fetch(sampler2D tex, ivec2 ij) {

        return texelFetch(tex, ij, 0);
    }
    `;


const onEdge = `
    bool onEdge(ivec2 ij){
        if( ij.x == 0 || ij.y == 0 || ij.x == int(res.x)-1 || ij.y == int(res.y)-1 ){
            return true;
        }
        return false;
    }
`;

//INPUT TO THE PHYSICAL SYSTEM


const iniPositionShader=`
    void main(){
           gl_FragColor = vec4(floor(gl_FragCoord.x),0,  floor(gl_FragCoord.y), 0)/10.;
        }
`;


const iniMomentumShader=`
    void main(){
       
            // if(floor(gl_FragCoord.x)==floor(res.x/2.) && floor(gl_FragCoord.y)==floor(res.y/2.)){
            // gl_FragColor = vec4(0,0, 20,0.);
            // }
            // else{
            //  gl_FragColor = vec4(0,0, 0,0.);
            //  }

             gl_FragColor = vec4(0,0, 0,0.);
        }
        `;







const PESpring =`
    float PE(vec4 p, vec4 q, float rest){
        vec4 v = q-p;
        float l = length(v);
        float delta = l - rest;
        
        float springPE=0.5*springK*delta*delta;
        
        return springPE;
    }
    `;



//take in two positions, return the gradient of the distance squared
//of the first to the second, when varying the coordinates of the first:

const gradPESpring = PESpring+ `

    vec4 gradPESpring(sampler2D pos, ivec2 ij, ivec2 uv, float rest){
        
        vec4 ijPos = fetch(pos, ij);
        vec4 uvPos = fetch(pos,uv);
        
        float dX, dY, dZ;
        
        vec4 eX=vec4(1,0,0,0);
        vec4 eY=vec4(0,1,0,0);
        vec4 eZ=vec4(0,0,1,0);
        
        float epsilon=0.0001;
        
        dX = PE(ijPos+epsilon*eX,uvPos,rest)-PE(ijPos-epsilon*eX,uvPos,rest);
        dY = PE(ijPos+epsilon*eY,uvPos,rest)-PE(ijPos-epsilon*eY,uvPos,rest);
        dZ = PE(ijPos+epsilon*eZ,uvPos,rest)-PE(ijPos-epsilon*eZ,uvPos,rest);
        
        vec4 grad = vec4(dX,dY,dZ,0)/(2.*epsilon);
        
        
        return grad;
    }
`;


const gradPEGravity =`

    vec4 gradPEGravity(ivec2 ij){
        return vec4(0,mass,0,0);
    }
`


const gradPE=gradPESpring+gradPEGravity+`
   
   vec4 gradPE(ivec2 ij){
   
   //springs right along the coordinate axes
       ivec2 eX=ivec2(1,0);
       ivec2 eY=ivec2(0,1);
    
       vec4 grad=vec4(0);
       
       //not on the left side, so can do the leftward spring
       if( ij.x != 0 ){
          grad+=gradPESpring(position, ij,ij-eX, restL); 
       }

        //not on the right side, so can do the rightward spring
       if( ij.x != int(res.x)-1 ){
         grad+=gradPESpring(position, ij,ij+eX,restL); 
       }

        //not on the bottom, do the topwards spring
       if( ij.y != 0 ){
          grad+=gradPESpring(position, ij,ij-eY,restL); 
       }

        //not on the top, can do the bottom-hanging spring
       if( ij.y != int(res.y)-1 ){
          grad+=gradPESpring(position, ij,ij+eY,restL); 
       }

       
       //springs diagonal with respect to the axes:
       ivec2 UR = eX+eY;
       ivec2 UL = -eX+eY;
       ivec2 DL = -eX-eY;
       ivec2 DR = eX+eY;
       
       
       float sq2=sqrt(2.);

       //if we are not on the left side, can do left diagonals:

       // if(ij.x != 0 ){
       //
       //      if( ij.y != int(res.y)-1 ){
       //          //if we are not on the top, do the upwards left diagonal
       //           grad+=gradPESpring(position, ij, ij+UL, sq2*restL); 
       //          }
       //
       //      if( ij.y != 0 ){
       //          //if we are not on the bottom, do downwards left diagonal
       //          grad+=gradPESpring(position, ij, ij+DL, sq2*restL); 
       //          }
       //
       //   }

       //  //if we are not on the right side, can do right diagonals:
       // if(ij.x != int(res.x)-1 ){
       //  if( ij.y != int(res.y)-1 ){
       //      //if we are not on the top, do the upwards right diagonal
       //      grad+=gradPESpring(position, ij, ij+UR, sq2*restL); 
       //      }
       //
       //  if( ij.y != 0 ){
       //      //if we are not on the bottom, do downwards right diagonal
       //      grad+=gradPESpring(position, ij, ij+DR, sq2*restL); 
       //      }
       //
       //   }
       //  
    
    
    //add in the gravitational potential
        grad += gradPEGravity(ij);
        
       return grad;
            
        }
`;












//the only occurance of q in the hamiltonian is in the potential energy
const dHdqShader = fetch + gradPE+ onEdge+`
 void main(){
       
       ivec2 ij = ivec2(int(gl_FragCoord.x), int(gl_FragCoord.y));
       gl_FragColor = gradPE(ij);
       if(onEdge(ij)){gl_FragColor = vec4(0);}
       }
`;

//the only occurance of momentum in the hamiltonian is in the kinetic term p^2/2m
//thus, the derivative of this is p/m:
//that means, dHdp is just a rescaling of the momentum shader!
const dHdpShader=fetch+onEdge+`
    void main(){
            ivec2 ij = ivec2(int(gl_FragCoord.x),int(gl_FragCoord.y));
            vec4 momentum = fetch(momentum, ij);
            gl_FragColor = momentum/mass;
            if(onEdge(ij)){gl_FragColor = vec4(0);}
            
        }
`;







const hamiltonian = {
    dHdp: dHdpShader,
    dHdq: dHdqShader
};

const initialCond = {
    position: iniPositionShader,
    momentum: iniMomentumShader
};







class SpringGrid {
    constructor(arraySize, mass, k, restLength, renderer){

        //copy over all the data
        this.arraySize=arraySize;
        this.mass=mass;
        this.k=k;
        this.restLength=restLength;
        this.renderer = renderer;

        //extra uniforms, beyond time, resolution, and the data of each shader
        let uniforms = {
            mass:{type:'float', value:this.mass},
            springK:{type:'float', value:this.k},
            restL:{type:'float', value:this.restLength},
        };

        //build the Integrator for this:
        this.integrator = new VerletGPU(hamiltonian,initialCond, uniforms, this.arraySize, this.renderer);

        //build the display for this
        this.spheres = new CSSpheres(this.integrator.computer, 'position');

    }


    addToScene(scene){

        this.integrator.initialize();

        this.spheres.init();
        scene.add(this.spheres);

    }



    addToUI(ui){

    }



    tick(time,dTime){

        this.integrator.tick(time,dTime);
        this.spheres.tick(time,dTime);
    }

    setIterations(n){
        this.integrator.setIterations(n);
    }

    }





let springSystem = new SpringGrid([64,64],0.1,10,0.1, globals.renderer);
springSystem.setIterations(10);


let testDisplay = new CSQuad(springSystem.integrator.computer);

export default {
   system: springSystem,
    display: testDisplay,
};
