//A compute system is a collection of ComputeShaders
// (position,velocity,etc) that all work together

import { Vector2} from "../../3party/three/build/three.module.js";
import { ComputeShader } from "./components/ComputeShader.js";
import {FullScreenQuad} from "./components/FullScreenQuad.js";

//names come in an ordered array
//[position, velocity]

//shaders will come in the form of an object
// { position: {simulation: x, initialization: y},
//   velocity :{simulation: z, initialization: w}...}

//uniforms will come in the form of an object like follows
//{name: {type: x, value: y, range:z,}}
//uniforms are common to all shaders right now


class ComputeSystem {

    constructor( variables, shaders, uniforms, options, renderer ) {

        //copy the passed data
        this.res = options.res;
        this.renderer = renderer;

        //names are in the order we wish to execute the shaders
        //this is our iterable object
        this.variables = variables;

        //for each of the input uniforms, add it to the shader
        //ADD THESE TO THE UI AS WELL:
        this.uniforms = {};
        this.uniformString = ``;

        //package the uniforms for the UI in a useful way:
        this.parameters = {};
        this.paramProperties = uniforms;

        for( let uniform of Object.keys(this.paramProperties)){
            this.parameters[uniform] = this.paramProperties[uniform].value;
            this.createUniform(uniform, this.paramProperties[uniform].type, this.paramProperties[uniform].value);
        }

        this.createUniform('frameNumber' ,'float', 0);
        this.createUniform('time' ,'float', 0);
        this.createUniform('dTime' ,'float', 0);
        this.createUniform('res', 'vec2', new Vector2(this.res[0], this.res[1]));

        for( let variable of this.variables ){
            this.createUniform(variable, 'sampler2D', null);
        }

        //build an object to store all computing materials: FUllScreenQuads, and resulting textures:
        //each objects is of the form {pos: QUAD, vel: QUAD, }...etc
        this.compute={};
        this.data={};

        for (let variable of this.variables) {

            //build a compute system:
            //add the uniforms after, not during creation, as they are not in the shaders
            const rtSettings ={
                res: options.res,
                filter: options.filter,
            }

            this.compute[variable] = new ComputeShader( shaders[variable], {}, rtSettings, this.renderer );
            this.compute[variable].addUniforms(this.uniforms, this.uniformString);

            //console.log(this.compute[variable].simulation.material.fragmentShader);

            //make a spot to store it's data
            this.data[variable] = null;

        }


        //option to name the ComputeSystem
        this.name = null;


        //if we need a reset switch, add one:
        if(options.resetSwitch){
            //set the resetSwitch to a function, so when it is clicked we run 'initialize'
            this.parameters.reset = ()=>this.initialize();
        }

    }

    //only to be used during constructor!
    //maybe can define as a function inside there?
    createUniform(variable, type, value) {
        this.uniforms[ variable ] = {value: value };
        this.uniformString += `uniform ${type} ${variable}; \n`;
    }


    updateUniforms() {

        //the uiUniforms are automatically updated by the UI
        //do nothing about these

        //increase frame number
        this.uniforms.frameNumber.value += 1.;

        // //update all the data textures
        for( let variable of this.variables ){
            this.uniforms[variable].value = this.data[variable];
        }
    }

    recompile(variable){
        this.compute[variable].recompile();
    }

    getData( variable ){
        return this.data[variable];
    }

    run() {

        for( let variable of this.variables ){
            //do one cycle of the cpu
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
        //make a folder for this compute system:
        let Folder = ui.addFolder(`${this.name}`);

        //add the reset switch:
        if(this.parameters.reset){
            Folder.add(this.parameters,'reset').name('Reset');
        }

        //add the parameter variables:
        for( let variable of Object.keys(this.paramProperties)){
            //add uniform to folder. update the uniforms on change
            Folder.add(this.parameters, variable, ...this.paramProperties[variable].range).onChange(val => this.uniforms[variable].value = val);
        }
    }

    addToScene( scene ) {

    }

    tick(time, dTime){
        //if you add the compute shader to the scene it'll run
        this.run();
        this.uniforms.time.value = time;
        this.uniforms.dTime.value = dTime;
    }

    readPixel(variable, i,j){
        return this.compute[variable].readPixel(i,j);
    }

}



export { ComputeSystem };
