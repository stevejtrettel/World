//A compute system is a collection of ComputeShaders
// (position,velocity,etc) that all work together

import { Vector2 } from "../../3party/three/build/three.module.js";
import { ComputeShader } from "./components/ComputeShader.js";

//shaders will come in the form of an object like
//{
// position: {simulation: x, initialization: y},
//  velocity: {simulation: x, initialization: y},
// }

//uniforms will come in the form of an object like
//{
// name : {value, x}, name2: {value: y}, ...
//}



class ComputeSystem {

    //same inputs as ComputeShader
    constructor( shaders, uniforms, res, renderer ) {

        this.res = res;
        this.renderer = renderer;
        this.uniforms = uniforms;

        //get the names of each shader:
        this.names = Object.keys(shaders);
        this.default = this.names[0];

        //add to these uniforms ones that are explicit to simulation:
        this.uniforms.res = {value : new Vector2(res[0], res[1])};
        this.uniforms.frameNumber = {value : 0.};
        for (let name of this.names) {
            //add a uniform to the simulation with this name: this is the data texture
            this.uniforms[name] = {value: null};
        }


        //build an object to store all computing materials: FUllScreenQuads, and resulting textures:
        //each objects is of the form {pos: QUAD, vel: QUAD, }...etc
        this.compute={};
        this.data={};

        for (let name of this.names) {

            //build a compute system:
            this.compute[name] = new ComputeShader(shaders[name], this.uniforms, this.res, this.renderer);

            //make a spot to store it's data
            this.data[name] = null;

        }


    }

    setDefault(name){
        this.default = name;
    }


    updateUniforms() {

        //increase frame number
        this.uniforms.frameNumber.value += 1.;

        // //update all the data textures
        for( let name of this.names ){
            this.uniforms[name].value = this.data[name];
        }

    }



    getData( name ){
        return this.data[name];
    }

    getDefault(){
        return this.data[ this.default ];
    }

    run() {

        for( let name of this.names ){
            //do one cycle of the integration
            this.compute[name].run();
            this.data[name] = this.compute[name].getData();
        }

        this.updateUniforms();
    }


    initialize() {

        for( let name of this.names ){
            //run the initial condition shader
            this.compute[name].initialize();
            this.data[name] = this.compute[name].getData();
        }

        this.updateUniforms();
    }


    setName( name ){
        this.name = name;
    }

    addToUI( ui ){

    }

    addToScene( scene ) {

    }

    tick(){
        //if you add the compute shader to the scene it'll run
        this.run();
    }



}



export { ComputeSystem };
