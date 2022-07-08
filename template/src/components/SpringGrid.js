import {ComputeSystem} from "../../../common/gpu/ComputeSystem.js";
import {globals} from "../globals.js";
import {
    SphereBufferGeometry,
    MeshNormalMaterial,
    Mesh,
    Vector3
} from "../../../3party/three/build/three.module.js";



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
    vec3 fetch(sampler2D tex, ivec2 ij) {

        return texelFetch(tex, ij, 0).xyz;
    }
    `;




//write the requisite shaders:

const positionShader=fetch+`
    void main(){
   
            gl_FragColor = vec4(gl_FragCoord.x,gl_FragCoord.y, sin(time), 0);
        }
        `;

const iniPositionShader=`
    void main(){
            gl_FragColor = vec4(gl_FragCoord.x,gl_FragCoord.y, 0, 0);
        }
`;

const momentumShader=fetch+`
    void main(){
            gl_FragColor = vec4(gl_FragCoord.x,gl_FragCoord.y, 0, 0);
        }
`;
const iniMomentumShader=`'
    void main(){
            gl_FragColor = vec4(gl_FragCoord.x,gl_FragCoord.y, 0, 0);
        }
        `;



const positionShader2=fetch+`
    void main(){
            gl_FragColor = vec4(gl_FragCoord.x,gl_FragCoord.y, 0, 0);
        }
`;


const dHdqShader=fetch+`
    void main(){
            gl_FragColor = vec4(gl_FragCoord.x,gl_FragCoord.y, 0, 0);
        }
`;


const dHdpShader=fetch+`
    void main(){
            gl_FragColor = vec4(gl_FragCoord.x, gl_FragCoord.y, 0, 0);
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
        let uniforms = {};

        //options for the input:
        let options = {
            res:this.arraySize,
        }

        //these shaders need some uniforms

        this.computer=new ComputeSystem(variables, shaders, uniforms, options, this.renderer);




        //make the visualization part:
        //make an empty array ready to populate with spheres.
        this.spheres = createArray(this.arraySize[0], this.arraySize[1]);
        let geo= new SphereBufferGeometry(0.2,32,32);
        let mat = new MeshNormalMaterial();
        let sph = new Mesh(geo,mat);

        for( let i=0; i<this.arraySize[0];i++ ){
            for( let j=0; j<this.arraySize[1];j++ ){
               this.spheres[i][j]=sph.clone();
            }
        }

    }


    updateSpheres(){

        let posData;

        for( let i=0; i<this.arraySize[0];i++ ){
            for( let j=0; j<this.arraySize[1];j++ ){
                posData= this.computer.readPixel('position',i,j);
                this.spheres[i][j].position.set(posData[0],posData[2],posData[1]);
            }
        }

    }




    addToScene(scene){

       this.computer.addToScene(scene);

        let posData;

        for( let i=0; i<this.arraySize[0];i++ ){
            for( let j=0; j<this.arraySize[1];j++ ){
                posData= this.computer.readPixel('position',i,j);
                this.spheres[i][j].position.set(posData[0],posData[2],posData[1]);
                scene.add(this.spheres[i][j]);
            }
        }
    }



    addToUI(ui){

    }



    tick(time,dTime){
        this.computer.tick(time,dTime);
        this.updateSpheres();
    }


    }





let springSystem = new SpringGrid([10,10],10,1,1,globals.renderer);


export default {springSystem};
