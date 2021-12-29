//A compute system is a collection of ComputeShaders
// (position,velocity,etc) that all work together

import { Vector2 } from "../../3party/three/build/three.module.js";
import { ComputeShader } from "./components/ComputeShader.js";
import {FullScreenQuad} from "./components/FullScreenQuad.js";

//names come in an ordered array
//[position, velocity]

//shaders will come in the form of an object
// { position: {simulation: x, initialization: y},
//   velocity :{simulation: z, initialization: w}...}

//uniforms will come in the form of an object like follows
//uniforms are common to all shaders right now
//{
// name : {value, x}, name2: {value: y}, ...
//}



class ComputeSystem {

    constructor( variables, shaders, uniforms, res, renderer ) {

        //copy the passed data
        this.res = res;
        this.renderer = renderer;

        //names are in the order we wish to execute the shaders
        //this is our iterable object
        this.variables = variables;

        //add to these uniforms ones that are explicit to simulation:
        this.uniforms = uniforms;
        this.uniformString = ``;

        // this.uniforms.res = {value : new Vector2(res[0], res[1])};
        // this.uniforms.frameNumber = {value : 0.};
        // for (let variable of this.variables) {
        //     //add a uniform to the simulation with this name: this is the data texture
        //     this.uniforms[variable] = {value: null};
        // }

        this.createUniform('frameNumber' ,'float', 0);
        this.createUniform('res', 'vec2', new Vector2(this.res[0], this.res[1]));
        for( let variable of this.variables ){
            this.createUniform(`${variable}`, 'sampler2D', null);
        }

        //build an object to store all computing materials: FUllScreenQuads, and resulting textures:
        //each objects is of the form {pos: QUAD, vel: QUAD, }...etc
        this.compute={};
        this.data={};

        for (let variable of this.variables) {

            //build a compute system:
            //add the uniforms after, not during creation, as they are not in the shaders
            this.compute[variable] = new ComputeShader( shaders[variable], {}, this.res, this.renderer );
            this.compute[variable].addUniforms(this.uniforms, this.uniformString);

            //make a spot to store it's data
            this.data[variable] = null;

        }


        //option to name the ComputeSystem
        this.name=null;


    }

    //only to be used during constructor!
    //maybe can define as a function inside there?
    createUniform(variable, type, value) {
        this.uniforms[ variable ] = {value: value };
        this.uniformString += `uniform ${type} ${variable}; \n`;
    }


    updateUniforms() {

        //increase frame number
        this.uniforms.frameNumber.value += 1.;

        // //update all the data textures
        for( let variable of this.variables ){
            this.uniforms[variable].value = this.data[variable];
        }

    }

    getData( variable ){
        return this.data[variable];
    }

    run() {

        for( let variable of this.variables ){
            //do one cycle of the integration
            this.compute[variable].run();
            this.data[variable] = this.compute[variable].getData();
        }

        this.updateUniforms();
    }


    initialize() {

        for( let variable of this.variables ){
            //run the initial condition shader
            this.compute[variable].initialize();
            this.data[variable] = this.compute[variable].getData();
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
