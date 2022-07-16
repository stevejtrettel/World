
import {globals} from "../globals.js";

import { CSQuad } from "../../../common/gpu/displays/CSQuad.js";
import { CSSpheres } from "../../../common/gpu/displays/CSSpheres.js";
import {VerletHamiltonian} from "../../../common/gpu/VerletHamiltonian.js";



//components of shaders

const step = `
    const float epsilon = 0.001;
`;

const fetch = `
    vec4 fetch(sampler2D tex, ivec2 ij) {
        return texelFetch(tex, ij, 0);
    }
    `;

const setIJ = `
    ivec2 setIJ(){
        return ivec2(int(gl_FragCoord.x),int(gl_FragCoord.y));
    }
`;



const onEdges =    `
      bool onTop( ivec2 ij ){
        return ij.y == int(res.y)-1;
      }
      
      bool onBottom( ivec2 ij ){
        return ij.y == 0;
      }
      
      bool onLeft( ivec2 ij ){
        return ij.x == 0;
      }
      
      bool onRight( ivec2 ij ){
        return ij.x == int(res.x)-1;
      }
      
     bool onEdge(ivec2 ij){
        if( ij.x == 0 || ij.y == 0 || ij.x == int(res.x)-1 || ij.y == int(res.y)-1 ){
            return true;
        }
        return false;
    }
    
        bool onCorner( ivec2 ij ){
        bool top = onTop(ij);
        bool left = onLeft(ij);
        bool right = onRight(ij);
        bool bottom = onBottom(ij);
        
        return top&&left || top&&right;
        
        //|| bottom&&left || bottom&&right;
    }
`;




//INPUT TO THE PHYSICAL SYSTEM


const iniPositionShader = setIJ + fetch + `
    void main(){
           ivec2 ij = setIJ();
           vec4 xdir = vec4(1,0,0,0);
           vec4 ydir = vec4(0,1,1,0)/sqrt(2.);
           
           float x = float(ij.x);
           float y = float(ij.y);
         
           gl_FragColor = gridSpacing * (x*xdir + y*ydir);
        }
`;


const iniMomentumShader= setIJ + fetch + `
    void main(){
                 gl_FragColor = vec4(0,0, 0,0.);
        }
        `;











const singleSpringPotential =    `
    float singleSpringPotential( ivec2 ij, ivec2 uv, float rest ){
        float totalPotential;
        
        //get endpoints of the spring,
        vec4 pij = fetch( position, ij );
        vec4 puv = fetch( position, uv );
        
        //get vector along springs length
        vec4 springVec = puv - pij;
        float springLength = length( springVec );
        vec4 springDir = normalize( springVec );
        
        //potential is proportional to square of difference from rest length:
        float delta = (springLength - rest);
        
        totalPotential = delta*delta;
        totalPotential *= 0.5*springConst;
    
        return totalPotential;
    }
    
    
    //overload in terms ofspace variables instead of spring index
    float singleSpringPotential( vec4 p, vec4 q, float rest ){
        float totalPotential;
        
        //get vector along springs length
        vec4 springVec = q - p;
        float springLength = length( springVec );
        vec4 springDir = normalize( springVec );
        
        //potential is proportional to square of difference from rest length:
        float delta = (springLength - rest);
        
        totalPotential = delta*delta;
        totalPotential *= 0.5*springConst;
    
        return totalPotential;
    }
`;





const singleSpringGradient =    `
    vec4 singleSpringGradient( ivec2 ij, ivec2 uv, float rest ){
        vec4 gradPotential;
        
        //get endpoints of the spring,
        vec4 ijPos = fetch( position, ij );
        vec4 uvPos = fetch( position, uv );
        
        float dX, dY, dZ;
        
        float ep = 0.0001;
        
        vec4 eX=ep*vec4(1,0,0,0);
        vec4 eY=ep*vec4(0,1,0,0);
        vec4 eZ=ep*vec4(0,0,1,0);
        
        dX = singleSpringPotential(ijPos+eX,uvPos,rest)-singleSpringPotential(ijPos-eX,uvPos,rest);
        dY = singleSpringPotential(ijPos+eY,uvPos,rest)-singleSpringPotential(ijPos-eY,uvPos,rest);
        dZ = singleSpringPotential(ijPos+eZ,uvPos,rest)-singleSpringPotential(ijPos-eZ,uvPos,rest);
        
        gradPotential = vec4(dX,dY,dZ,0)/(2.*ep);
        return gradPotential;
    }
`;







const gridLineSprings = `
    vec4 gridLineSprings(ivec2 ij) {
    
        vec4 totalGradient = vec4(0.);
        ivec2 dir;
        float rest = gridSpacing;
        
        //if not on the top, have springs connecting to above
        if( !onTop(ij) ){
            dir = ivec2(0,1);
            totalGradient += singleSpringGradient( ij, ij+dir, rest);
        }
        
        //if not on bottom, have springs connecting to below:
        if( !onBottom(ij) ){
             dir = ivec2(0,-1);
            totalGradient += singleSpringGradient( ij, ij+dir, rest);
        }
        
        
        //if furthermore not on the right, we have rightward springs:
        if( !onRight(ij) ){
            dir = ivec2(1,0);
            totalGradient += singleSpringGradient( ij, ij+dir, rest);
        }
            
        //if not on the left, we have leftward springs:
        if( !onLeft(ij) ){
            dir = ivec2(-1,0);
            totalGradient += singleSpringGradient( ij, ij+dir, rest);
        }
    
        return totalGradient;
    }
`;



const diagLineSprings = `
 vec4 diagLineSprings(ivec2 ij) {
    
        vec4 totalGradient = vec4(0.);
        ivec2 dir;
        float rest = sqrt(2.)*gridSpacing;
        
        //if not on the top, have springs connecting to above
        if( !onTop(ij) ){
            
            //if furthermore not on the left, that means we have down,left-facing springs:
            if( !onLeft(ij) ){
                dir = ivec2(-1,1);
                totalGradient += singleSpringGradient(ij, ij+dir, rest);
            }
            
            //if furthermore not on the right, that means we have down,right-facing springs:
            if( !onRight(ij) ){
                dir = ivec2(1,1);
                totalGradient += singleSpringGradient(ij, ij+dir, rest);
            }
            
        }
        
        //if not on bottom, have springs connecting to above:
        if( !onBottom(ij) ){
        
            //if furthermore not on the left, that means we have upward,left-facing springs:
            if( !onLeft(ij) ){
                dir = ivec2(-1,-1);
                totalGradient += singleSpringGradient(ij, ij+dir, rest);
            }
            
            //if furthermore not on the right, that means we have upward,right-facing springs:
            if( !onRight(ij) ){
                dir = ivec2(1,-1);
                totalGradient += singleSpringGradient(ij, ij+dir, rest);
            }
        
        }
    
        return totalGradient;
    }
`;




//putting it all together:


//the total forces acting on the system at a point ij:

const springGradients = singleSpringPotential + singleSpringGradient + gridLineSprings + diagLineSprings + `
    vec4 springGradients( ivec2 ij ){
        vec4 totalGradient = vec4(0.);
        
        totalGradient += gridLineSprings(ij);
        totalGradient += diagLineSprings(ij);
        
        return totalGradient;
    }
`;

const envGradients = `
    vec4 envGradients( ivec2 ij ){
       vec4 totalGradient = vec4(0.);
        
        //the gradient from gravity is constant, downwards:
        totalGradient += vec4( 0, 1., 0, 0);
        
        return totalGradient;
    }
`;











// Building the hamiltonian derivative shaders!

//the only occurence of q in the hamiltonian is in the potential energy
const dHdqShader = setIJ + fetch + onEdges + springGradients + envGradients + `
 void main(){
     
        vec4 grad = vec4(0.);
        ivec2 ij = setIJ();
        
        grad += springGradients(ij);
        grad += envGradients(ij);
    
        gl_FragColor = grad;
         if(ij.y==int(res.y)-1 && (ij.x==0||ij.x==int(res.x/2.)||ij.x==int(res.x)-1)){gl_FragColor = vec4(0);}
      
    }
`;

//the only occurance of momentum in the hamiltonian is in the kinetic term p^2/2m
//thus, the derivative of this is p/m:
//that means, dHdp is just a rescaling of the momentum shader!
const dHdpShader = setIJ + fetch + onEdges + `
    void main(){
     
        vec4 grad = vec4(0.);
        ivec2 ij = setIJ();
        
        vec4 momentum = fetch(momentum, ij);
        
        gl_FragColor = momentum/mass;
        if(ij.y==int(res.y)-1 && (ij.x==0||ij.x==int(res.x/2.)||ij.x==int(res.x)-1)){gl_FragColor = vec4(0);}
      
            
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







class SpringConservative {

    constructor(arraySize, options, renderer){

        //copy over all the data
        this.arraySize=arraySize;

        this.renderer = renderer;

        //extra uniforms, beyond time, resolution, and the data of each shader
        let uniforms = {
            mass: { type: 'float', value: options.mass },
            springConst: { type:'float', value: options.springConst },
            gridSpacing: { type: 'float', value: options.gridSpacing },
            linearDrag: { type: 'float', value: options.linearDrag },
        };

        //build the Integrator for this:
        this.integrator = new VerletHamiltonian(hamiltonian, initialCond, uniforms, this.arraySize, this.renderer);

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




let options = {
    mass: 0.1,
    springConst: 30,
    gridSpacing: 0.5,
};

let springSystem = new SpringConservative([128,64], options, globals.renderer);
springSystem.setIterations(10);


let testDisplay = new CSQuad(springSystem.integrator.computer);

export default {
    system: springSystem,
    display: testDisplay,
};
