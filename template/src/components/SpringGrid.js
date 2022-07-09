import {ComputeSystem} from "../../../common/gpu/ComputeSystem.js";
import {globals} from "../globals.js";
import {
    SphereBufferGeometry,
    MeshNormalMaterial,
    Mesh,
    Vector3,
    InstancedBufferGeometry,
    InstancedBufferAttribute,
    ShaderMaterial,
    MeshBasicMaterial,
    BoxBufferGeometry, Vector2,
} from "../../../3party/three/build/three.module.js";

import { CSQuad } from "../../../common/gpu/displays/CSQuad.js";
import { CSSpheres } from "../../../common/gpu/displays/CSSpheres.js";






//VERY USEFUL FUNCTION:
//initialize an n-dimensional array ready to be filled with things:
//ex: length = list of numbers, eg createAray(x,y) makes a 2d array of x by y
function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
}





//components of shaders

const fetch = `
    vec4 fetch(sampler2D tex, ivec2 ij) {

        return texelFetch(tex, ij, 0);
    }
    `;




//write the requisite shaders:

const positionShader=fetch+`
    void main(){
    
         float epsilon = 0.01;
         ivec2 ij = ivec2(int(gl_FragCoord.x),int(gl_FragCoord.y));
            
         vec4 positionLast = fetch(position, ij);
         vec4 dPosition = fetch(dHdp, ij);
            
         vec4 positionNext = positionLast + dPosition*epsilon;
         gl_FragColor = positionNext;
   
           
        }
        `;

const iniPositionShader=`
    void main(){
           gl_FragColor = vec4(gl_FragCoord.x, gl_FragCoord.y, 0, 0);
        }
`;

const momentumShader=fetch+`
    void main(){
    
            float epsilon = 0.01;
            ivec2 ij = ivec2(int(gl_FragCoord.x),int(gl_FragCoord.y));
            
            vec4 momentumLast = fetch(momentum, ij);
            vec4 dMomentum = -fetch(dHdq, ij);
            
            vec4 momentumNext = momentumLast + dMomentum*epsilon;
            gl_FragColor = momentumNext;
            
        }
`;
const iniMomentumShader=`
    void main(){
            gl_FragColor = vec4(sin(gl_FragCoord.x), cos(gl_FragCoord.y), sin(gl_FragCoord.x*gl_FragCoord.y),0.);
        }
        `;



const positionShader2=fetch+`
    void main(){
            gl_FragColor = vec4(0, 0, 0, 0);
        }
`;


const dHdqShader=fetch+`
    void main(){
            gl_FragColor = vec4(0, 0, 0, 0);
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


const shaders = {
    position: {
        simulation:positionShader,
        initialization: iniPositionShader,
    },
    momentum: {
        simulation: momentumShader,
        initialization: iniMomentumShader,
    },
    position2: positionShader2,
    dHdq:dHdqShader,
    dHdp: dHdpShader,
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
        this.computer.addToScene(scene);

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





let springSystem = new SpringGrid([256,512],1,1,1,globals.renderer);

let testDisplay = new CSQuad(springSystem.computer);

export default {
   system: springSystem,
    display: testDisplay,
};
