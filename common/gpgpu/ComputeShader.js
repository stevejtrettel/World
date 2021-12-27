import {
    ShaderMaterial,
    Vector2,
} from "../../3party/three/build/three.module.js";

import {FullScreenQuad} from "./FullScreenQuad.js";
import {ComputeRenderTargets} from "./ComputeRTs.js";


class ComputeShader {

    constructor( shaders, uniforms, resolution, renderer ){

        //the resolution of the simulation
        this.res = resolution;
        const resVector = new Vector2(resolution[0], resolution[1]);

        //save the renderer
        this.renderer=renderer;

        this.uniforms = {};

        //the initial condition computations
        this.uniforms.initialization = {
            res: {value: resVector},
            ...uniforms.initialization,
        };

        this.initialization = new FullScreenQuad( {
            fragmentShader:  shaders.initialization,
            uniforms: this.uniforms.initialization
        });

        //the simulation computations
        this.uniforms.simulation = {
            res: {value: resVector},
            frameNumber: {value: 0},
            data: {value: null },
            ...uniforms.simulation
        };

        this.simulation = new FullScreenQuad({
            fragmentShader: shaders.simulation,
            uniforms: this.uniforms.simulation
        });



        //the render targets
        this.rts = new ComputeRenderTargets( this.res );


        //where the result is stored
        this.data = null;

    }


    updateUniforms() {
        //whatever we need to do here
        this.uniforms.simulation.frameNumber.value +=1;
    }


    setData( dat ) {
        this.data=dat;
        this.uniforms.simulation.data.value = dat;
    }

    getData(){
        return this.data;
    }

    run() {
        //do one cycle of the integration
        this.rts.render( this.simulation, this.renderer );
        this.setData(this.rts.getResult());
        this.updateUniforms();
    }

    initialize() {
        //run the initial condition shader
       this.rts.render( this.initialization, this.renderer );
       this.setData(this.rts.getResult());
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


export { ComputeShader };
