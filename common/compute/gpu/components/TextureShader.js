
import {FullScreenQuad} from "./FullScreenQuad.js";
import {ComputeRenderTargets} from "./ComputeRTs.js";



//a simplified ComputeShader
//meant to be used independently
//running a single shader to be used as a map texture
//shader is entered 100% complete, uniforms and all.

class TextureShader {

    constructor( shader, uniforms, uniformsString, rtSettings, renderer ){

        //the render targets
        this.rts = new ComputeRenderTargets( rtSettings );
        //save the renderer
        this.renderer=renderer;
        // store the simulation uniforms
        this.uniforms = uniforms;
        this.uniformsString = uniformsString;

        //the shader material to run:
        this.simulation = new FullScreenQuad({
            fragmentShader: shader,
        });
        this.simulation.addUniforms(this.uniforms, this.uniformsString);

        //where the result is stored
        this.data = null;

    }

    recompile(newShaderText){
        //this is just because the FullScreenQuad class takes a "build shader" function
        this.simulation.recompile(()=>{ return newShaderText; });
    }

    // //add to each FSQ
    // addUniforms(uniformObject,uniformString) {
    //     this.simulation.addUniforms(uniformObject, uniformString);
    // }

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
        this.data = this.rts.getResult();
    }

    updateUniforms(newUniforms={}){
        //go thru list of uniforms: if it exists in the input data, update it's value
        //(if it is in the list of things that have been updated only, of course)
        for(const [key, val] of Object.entries(this.uniforms) ){
            if(Object.hasOwn(newUniforms,key)) {
                this.uniforms[key].value = newUniforms[key];
            }
        }
    }

}


export default TextureShader;


