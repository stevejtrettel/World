import {
    WebGLRenderTarget,
    ClampToEdgeWrapping,
    FloatType,
    NearestFilter,
    RGBAFormat, LinearFilter
} from "../../../3party/three/build/three.module.js";




//SHOULD SWITCH TO NEARESTFILTER IF WE WANT EXACT PIXEL
//BUT THIS CAUSES PIXELATION WHEN WE TRY TO READ IT OFF AS A TEXTURE
//INSTEAD: TRYING TO USE TEXELFETCH() AND LINEARFILTER
const rtSettings = {
    format:  RGBAFormat,
    type:  FloatType,
    wrapS: ClampToEdgeWrapping,
    wrapT: ClampToEdgeWrapping,
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    depthBuffer: false,
    stencilBuffer:  false,
};



// a pair of render targets that take in FullScreenQuads and render them, swap targets, and read out result
//a compute system can be built of multiple FullScreenQuads and use this as the rendering device for all of them

class ComputeRenderTargets {

    constructor( res ){

        this.a = new WebGLRenderTarget(res[0], res[1], rtSettings);
        this.b = new WebGLRenderTarget(res[0], res[1], rtSettings);
       // this.data = null;

    }

    swap(){
        //swap the render targets
        let temp = this.a;
        this.a = this.b;
        this.b = temp;
    }

    //take in a full screen quad and render it:
    //save result in this.data;
    render( fsq, renderer ){
        renderer.setRenderTarget(this.a);
        fsq.render(renderer);
        this.swap();
        renderer.setRenderTarget(null);
    }



    getResult(){
        //we always read from b and write to a
        return this.b.texture;
    }


}



export { ComputeRenderTargets };
