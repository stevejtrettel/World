import {
    WebGLRenderTarget,
    ClampToEdgeWrapping,
    FloatType,
    NearestFilter,
    RGBAFormat
} from "../../3party/three/build/three.module";




const rtSettings = {
    format:  RGBAFormat,
    type:  FloatType,
    wrapS: ClampToEdgeWrapping,
    wrapT: ClampToEdgeWrapping,
    minFilter: NearestFilter,
    magFilter: NearestFilter,
    depthBuffer: false,
    stencilBuffer:  false,
};


class ComputeRenderTargets {

    constructor( res ){

        this.a = new WebGLRenderTarget(res[0], res[1], rtSettings);
        this.b = new WebGLRenderTarget(res[0], res[1], rtSettings);

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
        renderer.render(fsq);
        this.swap();
        //now the result is stored in the b texture:
    }

    get data(){
        return this.b.texture;
    }

}



export { ComputeRenderTargets };
