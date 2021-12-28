import {FullScreenQuad} from "./FullScreenQuad.js";
import {ComputeRenderTargets} from "./ComputeRTs.js";


class ComputeShader {

    constructor( shaders, uniforms, resolution, renderer ){

        //the render targets
        this.rts = new ComputeRenderTargets( resolution );

        //save the renderer
        this.renderer=renderer;


        // unpack the simulation materials

        this.uniforms = uniforms;

        this.initialization = new FullScreenQuad( {
            fragmentShader:  shaders.initialization,
            uniforms: this.uniforms
        });

        this.simulation = new FullScreenQuad({
            fragmentShader: shaders.simulation,
            uniforms: this.uniforms
        });


        //where the result is stored
        this.data = null;

    }

    setData( dat ) {
        this.data=dat;
    }

    getData(){
        return this.data;
    }

    run() {
        //do one cycle of the integration
        this.rts.render( this.simulation, this.renderer );
        this.setData(this.rts.getResult());
    }

    initialize() {
        //run the initial condition shader
       this.rts.render( this.initialization, this.renderer );
       this.setData(this.rts.getResult());
    }


}


export { ComputeShader };
