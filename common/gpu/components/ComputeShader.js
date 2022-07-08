import {FullScreenQuad} from "./FullScreenQuad.js";
import {ComputeRenderTargets} from "./ComputeRTs.js";


//shaders is either 1) a single shader or 2) a pair {initialization:x, simulation:y}
//they've already been built, including their uniforms, and come here complete
class ComputeShader {

    constructor( shaders, uniforms, rtSettings, renderer ){

        //the render targets
        this.rts = new ComputeRenderTargets( rtSettings );

        //save the renderer
        this.renderer=renderer;


        // store the simulation uniforms
        this.uniforms = uniforms;


        //the main simulation:

        this.buildShaders = null;

        //what was passed as shaders?
        //first instance: its a function meant to build the shader off some data!
        if(typeof shaders === 'function'){
            this.buildShaders = shaders;
            //if we were passed a single shader, do the same for both of them
            this.simulation = new FullScreenQuad({
                fragmentShader: this.buildShaders(),
                uniforms: this.uniforms
            });
            this.initialization = new FullScreenQuad({
                fragmentShader:  this.buildShaders(),
                uniforms: this.uniforms
            });
        }


        // can either pass a single shader, or an object {initialization: x, simulation: y}
        else if (typeof shaders === 'string' || shaders instanceof String){

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

    recompile(){
        this.simulation.recompile(this.buildShaders);
        this.initialization.recompile(this.buildShaders);
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

    //ij are the pixel coordinates
    //we want the value of that pixel's float rgba vector
    readPixel(i,j){
        return this.rts.readPixel(i,j,this.renderer);
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
