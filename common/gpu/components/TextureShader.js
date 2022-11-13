//a simplified ComputeShader
//meant to be used independently
//running a single shader to be used as a map texture

class TextureShader{
    constructor(shaderText,uniforms,res){

        this.uniforms;
        this.uniformsGLSL;


    }

    addUniform(uniformObject, uniformString){

    }

    recompile(newShaderText){
        const newShader = this.uniformsGLSL+newShaderText;

    }

    getData(){

    }

    run(){

    }




}



export default TextureShader;