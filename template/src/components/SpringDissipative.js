
import {globals} from "../globals.js";

import { CSQuad } from "../../../common/gpu/displays/CSQuad.js";
import { CSSpheres } from "../../../common/gpu/displays/CSSpheres.js";
import {VerletDissipative} from "../../../common/gpu/VerletDissipative.js";


//components of shaders

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
           vec4 ydir = normalize(vec4(0,0,1,0));
           
           float x = float(ij.x);
           float y = float(ij.y);
         
           gl_FragColor = gridSpacing * (x*xdir + y*ydir);
        }
`;


const iniVelocityShader= setIJ + fetch + `
    void main(){
             ivec2 ij = setIJ();
             gl_FragColor = vec4(0,0, 0,0.);
        }
        `;

















const singleSpringForce =    `
    vec4 singleSpringForce( sampler2D posTex, ivec2 ij, ivec2 uv,  float rest ){
        vec4 totalForce=vec4(0.);
        
        //get endpoints of the spring,
        vec4 pij = fetch( posTex, ij );
        vec4 puv = fetch( posTex, uv );
        
        //get vector along springs length
        vec4 springVec = puv - pij;
        float springLength = length( springVec );
        vec4 springDir = normalize( springVec );
        
        //force is proportional to difference from rest length:
       // if(springLength > rest){
            totalForce = (springLength - rest) * springDir;
            totalForce *= springConst;
       // }
    
        return totalForce;
    }
`;



const gridSpringsForce = `
    vec4 gridSpringsForce( sampler2D posTex, ivec2 ij ) {
    
        vec4 totalForce=vec4(0.);
        ivec2 dir;
        float rest = gridSpacing;
        
        //if not on the top, have springs connecting to above
        if( !onTop(ij) ){
            dir = ivec2(0,1);
            totalForce += singleSpringForce( posTex, ij, ij+dir, rest);
        }
        
        //if not on bottom, have springs connecting to below:
        if( !onBottom(ij) ){
             dir = ivec2(0,-1);
            totalForce += singleSpringForce( posTex, ij, ij+dir, rest);
        }
        
        
        //if furthermore not on the right, we have rightward springs:
        if( !onRight(ij) ){
            dir = ivec2(1,0);
            totalForce += singleSpringForce( posTex, ij, ij+dir, rest);
        }
            
        //if not on the left, we have leftward springs:
        if( !onLeft(ij) ){
            dir = ivec2(-1,0);
            totalForce += singleSpringForce( posTex, ij, ij+dir, rest);
        }
    
        return totalForce;
    }
    
    
    
    vec4 doubleGridSpringsForce( sampler2D posTex, ivec2 ij ) {
    
        vec4 totalForce=vec4(0.);
        ivec2 dir;
        float rest = 2.*gridSpacing;
        
        //if not on the top, have springs connecting to above
        if( ij.y < int(res.y)-2 ){
            dir = ivec2(0,2);
            totalForce += singleSpringForce( posTex, ij, ij+dir, rest);
        }
        
        //if not on bottom, have springs connecting to below:
        if( ij.y > 1 ){
             dir = ivec2(0,-2);
            totalForce += singleSpringForce( posTex, ij, ij+dir, rest);
        }
        
        
        //if furthermore not on the right, we have rightward springs:
        if( ij.x < int(res.x)-2 ){
            dir = ivec2(2,0);
            totalForce += singleSpringForce( posTex, ij, ij+dir, rest);
        }
            
        //if not on the left, we have leftward springs:
        if( ij.x>1 ){
            dir = ivec2(-2,0);
            totalForce += singleSpringForce( posTex, ij, ij+dir, rest);
        }
    
        return totalForce;
    }
`;



const diagSpringsForce = `
 vec4 diagSpringsForce(sampler2D posTex, ivec2 ij) {
    
        vec4 totalForce=vec4(0.);
        ivec2 dir;
        float rest = gridSpacing*sqrt(2.);
        
        //if not on the top, have springs connecting to above
        if( !onTop(ij) ){
            
            //if furthermore not on the left, that means we have down,left-facing springs:
            if( !onLeft(ij) ){
                dir = ivec2(-1,1);
                totalForce += singleSpringForce(posTex, ij, ij+dir, rest);
            }
            
            //if furthermore not on the right, that means we have down,right-facing springs:
            if( !onRight(ij) ){
                dir = ivec2(1,1);
                totalForce += singleSpringForce(posTex, ij, ij+dir, rest);
            }
            
        }
        
        //if not on bottom, have springs connecting to below:
        if( !onBottom(ij) ){
        
            //if furthermore not on the left, that means we have upward,left-facing springs:
            if( !onLeft(ij) ){
                dir = ivec2(-1,-1);
                totalForce += singleSpringForce(posTex, ij, ij+dir, rest);
            }
            
            //if furthermore not on the right, that means we have upward,right-facing springs:
            if( !onRight(ij) ){
                dir = ivec2(1,-1);
                totalForce += singleSpringForce(posTex, ij, ij+dir, rest);
            }
        
        }
    
        return totalForce;
    }
    
    
    vec4 doubleDiagSpringsForce(sampler2D posTex, ivec2 ij) {
    
        vec4 totalForce=vec4(0.);
        ivec2 dir;
        float rest = 2.*gridSpacing*sqrt(2.);
        
        //if not on the top, have springs connecting to above
        if( ij.y < int(res.y)-2 ){
            
            //if furthermore not on the left, that means we have down,left-facing springs:
            if( ij.x >1 ){
                dir = ivec2(-2,2);
                totalForce += singleSpringForce(posTex, ij, ij+dir, rest);
            }
            
            //if furthermore not on the right, that means we have down,right-facing springs:
            if( ij.x < int(res.x)-2 ){
                dir = ivec2(2,2);
                totalForce += singleSpringForce(posTex, ij, ij+dir, rest);
            }
            
        }
        
        //if not on bottom, have springs connecting to below:
        if( ij.y > 1 ){
        
            //if furthermore not on the left, that means we have upward,left-facing springs:
            if( ij.x > 1 ){
                dir = ivec2(-2,-2);
                totalForce += singleSpringForce(posTex, ij, ij+dir, rest);
            }
            
            //if furthermore not on the right, that means we have upward,right-facing springs:
            if( ij.x < int(res.x)-2 ){
                dir = ivec2(2,-2);
                totalForce += singleSpringForce(posTex, ij, ij+dir, rest);
            }
        
        }
    
        return totalForce;
    }
`;

``



const singleSpringDrag = `
    vec4 singleSpringDrag( sampler2D velTex, ivec2 ij, ivec2 uv ){
      
        vec4 totalDrag=vec4(0.);
        
        //get endpoints of the spring,
        vec4 pij = fetch( velTex, ij );
        vec4 puv = fetch( velTex, uv );
        
        //difference in endpoint velocities
        //based at pij?
        vec4 springVel = puv - pij;
       
        
        //drag is proportional to this velocity:
        totalDrag += linearDrag * springVel;
        
        return totalDrag;
    }
`;


const gridSpringsDrag = `
    vec4 gridSpringsDrag( sampler2D velTex, ivec2 ij ) {
    
        vec4 totalDrag=vec4(0.);
        ivec2 dir;
        
        //if not on the top, have springs connecting to above
        if( !onTop(ij) ){
            dir = ivec2(0,1);
            totalDrag += singleSpringDrag( velTex, ij, ij+dir );
        }
        
        //if not on bottom, have springs connecting to below:
        if( !onBottom(ij) ){
             dir = ivec2(0,-1);
            totalDrag += singleSpringDrag( velTex, ij, ij+dir );
        }
        
        
        //if furthermore not on the right, we have rightward springs:
        if( !onRight(ij) ){
            dir = ivec2(1,0);
            totalDrag += singleSpringDrag( velTex, ij, ij+dir );
        }
            
        //if not on the left, we have leftward springs:
        if( !onLeft(ij) ){
            dir = ivec2(-1,0);
            totalDrag += singleSpringDrag( velTex, ij, ij+dir );
        }
    
        return totalDrag;
    }
`;

const diagSpringsDrag = `
vec4 diagSpringsDrag(sampler2D velTex, ivec2 ij) {
    
        vec4 totalForce=vec4(0.);
        ivec2 dir;
      
        
        //if not on the top, have springs connecting to above
        if( !onTop(ij) ){
            
            //if furthermore not on the left, that means we have down,left-facing springs:
            if( !onLeft(ij) ){
                dir = ivec2(-1,1);
                totalForce += singleSpringDrag(velTex, ij, ij+dir);
            }
            
            //if furthermore not on the right, that means we have down,right-facing springs:
            if( !onRight(ij) ){
                dir = ivec2(1,1);
                totalForce += singleSpringDrag( velTex, ij, ij+dir );
            }
            
        }
        
        //if not on bottom, have springs connecting to below:
        if( !onBottom(ij) ){
        
            //if furthermore not on the left, that means we have upward,left-facing springs:
            if( !onLeft(ij) ){
                dir = ivec2(-1,-1);
                totalForce += singleSpringDrag( velTex, ij, ij+dir );
            }
            
            //if furthermore not on the right, that means we have upward,right-facing springs:
            if( !onRight(ij) ){
                dir = ivec2(1,-1);
                totalForce += singleSpringDrag( velTex, ij, ij+dir );
            }
        
        }
    
        return totalForce;
    }



vec4 doubleDiagSpringsDrag(sampler2D velTex, ivec2 ij) {
    
        vec4 totalDrag=vec4(0.);
        ivec2 dir;

        
        //if not on the top, have springs connecting to above
        if( ij.y < int(res.y)-2 ){
            
            //if furthermore not on the left, that means we have down,left-facing springs:
            if( ij.x >1 ){
                dir = ivec2(-2,2);
                totalDrag += singleSpringDrag(velTex, ij, ij+dir );
            }
            
            //if furthermore not on the right, that means we have down,right-facing springs:
            if( ij.x < int(res.x)-2 ){
                dir = ivec2(2,2);
                totalDrag += singleSpringDrag(velTex, ij, ij+dir );
            }
            
        }
        
        //if not on bottom, have springs connecting to below:
        if( ij.y > 1 ){
        
            //if furthermore not on the left, that means we have upward,left-facing springs:
            if( ij.x > 1 ){
                dir = ivec2(-2,-2);
                totalDrag += singleSpringDrag( velTex, ij, ij+dir );
            }
            
            //if furthermore not on the right, that means we have upward,right-facing springs:
            if( ij.x < int(res.x)-2 ){
                dir = ivec2(2,-2);
                totalDrag += singleSpringDrag( velTex, ij, ij+dir );
            }
        
        }
    
        return totalDrag/sqrt(2.);
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
       

        return totalDrag;
    }
`;
















//the total forces acting on the system at a point ij:

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
        if(onCorner(ij)){totalForce = vec4(0);}
        
        return totalForce;
    }
`;



//all together these constitute the conservative forces of the system:
const getForceConservative = springForces + envForces + `
    vec4 getForceConservative( sampler2D posTex, sampler2D velTex, ivec2 ij ){
    
        vec4 totalForce=vec4(0.);
        totalForce += springForces( posTex, ij );
        totalForce += envForces( posTex, ij );
        
        
 //if(ij.y==int(res.y)-1 && (ij.x==0||ij.x==int(res.x/2.)||ij.x==int(res.x)-1)){totalForce = vec4(0);}
                    if(onTop(ij)){totalForce =vec4(0);}
              
        return totalForce;
    }
`;













const getForceDissipative = onEdges + springDrag + airDrag + `
    vec4 getForceDissipative( sampler2D posTex, sampler2D velTex, ivec2 ij ){
    
        vec4 totalDrag = vec4(0.);

        totalDrag += springDrag( velTex, ij );
        totalDrag += airDrag( velTex, ij );
        
            if(onTop(ij)){totalDrag =vec4(0);}
          //  if(ij.y==int(res.y)-1 && (ij.x==0||ij.x==int(res.x/2.)||ij.x==int(res.x)-1)){totalDrag = vec4(0);}
        
        return totalDrag;
    }
`;





const initialCond = {
    position: iniPositionShader,
    velocity: iniVelocityShader
};

const forces = {
    conservative: getForceConservative,
    dissipative: getForceDissipative
};




class SpringGrid {

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
        this.integrator = new VerletDissipative(forces, initialCond, uniforms, this.arraySize, this.renderer);

        //build the display for this
        this.spheres = new CSSpheres(this.integrator.computer, 'positionX');

    }


    addToScene(scene){

        this.integrator.initialize();

        this.spheres.init();
      //  scene.add(this.spheres);

    }



    addToUI(ui){

    }



    tick(time,dTime){

        this.integrator.tick(time,dTime);
      //  this.spheres.tick(time,dTime);
    }

    setIterations(n){
        this.integrator.setIterations(n);
    }

}




let options = {
    mass:0.2,
    springConst: 50,
    gridSpacing : 0.25,
    linearDrag : 0.75,
};

let springSystem = new SpringGrid([64,64], options, globals.renderer);
springSystem.setIterations(20);


let testDisplay = new CSQuad(springSystem.integrator.computer);




export default {
    system: springSystem,
    display: testDisplay,
};

export { SpringGrid };
