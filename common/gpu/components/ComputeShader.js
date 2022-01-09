import {FullScreenQuad} from "./FullScreenQuad.js";
import {ComputeRenderTargets} from "./ComputeRTs.js";


//shaders is either 1) a single shader or 2) a pair {initialization:x, simulation:y}
//theyve already been built, including their uniforms, and come here complete
class ComputeShader {

    constructor( shaders, uniforms, resolution, renderer ){

        //the render targets
        this.rts = new ComputeRenderTargets( resolution );

        //save the renderer
        this.renderer=renderer;


        // store the simulation uniforms
        this.uniforms = uniforms;


        //the main simulation:


        //what was passed as shaders?
        // can either pass a single shader, or an object {initialization: x, simulation: y}
        if (typeof shaders === 'string' || shaders instanceof String){

            //if we were passed a single shader, do the same for both of them
            this.simulation = new FullScreenQuad({
                fragmentShader: shaders,
                uniforms: this.uniforms
            });
            this.initialization = new FullScreenQuad({
                fragmentShader: shaders,
                uniforms: this.uniforms
            });
        }
        else{
            //otherwise we were passed two shaders!
            this.simulation = new FullScreenQuad({
                fragmentShader: shaders.simulation,
                uniforms: this.uniforms
            });
            this.initialization = new FullScreenQuad( {
                fragmentShader:  shaders.initialization,
                uniforms: this.uniforms
            });
        }

        //where the result is stored
        this.data = null;

    }

    //add to each FSQ
    addUniforms(uniformObject,uniformString) {
        this.simulation.addUniforms(uniformObject, uniformString);
        this.initialization.addUniforms(uniformObject, uniformString);
    }

    setData( dat ) {
        this.data=dat;
    }

    getData(){
        return this.data;
    }

    run() {
        //do one cycle of the cpu
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
