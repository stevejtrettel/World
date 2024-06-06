import {
    WebGLRenderTarget,
    ClampToEdgeWrapping,
    FloatType,
    NearestFilter,
    RGBAFormat, LinearFilter
} from "../../../../3party/three/build/three.module.js";





// a pair of render targets that take in FullScreenQuads and render them, swap targets, and read out result
//a compute system can be built of multiple FullScreenQuads and use this as the rendering device for all of them

class ComputeRenderTargets {

    constructor( settings={} ){

        const rtSettings = {
            format:  RGBAFormat,
            type:  settings.type||FloatType,
            wrapS: settings.wrap||ClampToEdgeWrapping,
            wrapT: settings.wrap||ClampToEdgeWrapping,
            minFilter: settings.filter||NearestFilter,
            magFilter: settings.filter||NearestFilter,
            depthBuffer: false,
            stencilBuffer:  false,
        };

        const resX = settings.res[0]||256;
        const resY = settings.res[1]||256;


        this.a = new WebGLRenderTarget(resX,resY, rtSettings);
        this.b = new WebGLRenderTarget(resX,resY, rtSettings);
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


    readPixel(i,j,renderer){
        //read out a vec4 as the rtargets store floats in rgba format
        const read = new Float32Array( 4 );
        //ij is the location of the pixel, 1,1 means we are reading one pixel out
        //readRenderTargetPixels in general reads out a rectangle starting in the upper left at ij
        renderer.readRenderTargetPixels( this.b, i,j, 1, 1, read );
        return read;
    }


}



export default ComputeRenderTargets;
