//A compute system is a collection of ComputeShaders
// (position,velocity,etc) that all work together

import { Vector2 } from "../../3party/three/build/three.module.js";

import { FullScreenQuad } from "./FullScreenQuad.js";
import { ComputeRenderTargets } from "./ComputeRTs.js";


//shaders will come in the form of an object like
//{
// position: {simulation: x, initialization: y},
//  velocity: {simulation: x, initialization: y},
// }

//uniforms will come in the form of an object like
//{
// initialization: x,
// simulation: y,
//}



class ComputeSystem {

    //same inputs as ComputeShader
    constructor( shaders, uniforms, res, renderer ) {

        this.res = res;
        this.renderer = renderer;
        this.uniforms = uniforms;


        //add to these uniforms ones that are explicit to simulation:

        this.uniforms.res = {value : new Vector2(res[0], res[1])};
        this.uniforms.frameNumber = {value : 0.};


        //get the names of each shader:
        this.names = Object.keys(shaders);


        //build an object to store all computing materials: FUllScreenQuads, and resulting textures:
        //each objects is of the form {pos: QUAD, vel: QUAD, }...etc
        this.initialization = {};
        this.simulation = {};
        this.data={};


        let iniFSQ, simFSQ;

        for (let name of this.names) {

            //add a uniform to the simulation with this name: this is the data texture
            this.uniforms[name]={value: null};


            //make initialization full screen quad
            iniFSQ = new FullScreenQuad({
                fragmentShader:shaders[name].initialization,
                uniforms: this.uniforms,
            });

            this.initialization[name] = iniFSQ;

            //make simulation full screen quad
            simFSQ = new FullScreenQuad({
                fragmentShader: shaders[name].simulation,
                uniforms: this.uniforms,
            });

            this.simulation[name] = simFSQ;

            this.data[name] = null;

        }


        //the render targets
        this.rts = new ComputeRenderTargets( this.res );





    }


    updateUniforms() {

        //increase frame number
        this.uniforms.frameNumber += 1.;

        //update all the data textures
        for( let name of this.names ){
            this.uniforms[name].value = this.data[name];
        }

    }


    setData( data ) {

    }

    getData(){
        return this.data;
    }

    run() {
        for( let name of this.names ){
            //do one cycle of the integration
            this.rts.render( this.simulation[name], this.renderer );
            this.data[name] = this.rts.getResult();
        }

        this.updateUniforms();
    }


    initialize() {

        for( let name of this.names ){
            //run the initial condition shader
            this.rts.render( this.initialization[name], this.renderer );
            this.data[name] = this.rts.getResult();
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
