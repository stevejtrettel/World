import {
    OrthographicCamera,
    BufferGeometry,
    Float32BufferAttribute,
    Mesh,
    ShaderMaterial, DataTexture, RGBAFormat, FloatType,
} from "../../../3party/three/build/three.module.js";


const _camera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

// https://github.com/mrdoob/three.js/pull/21358

const _geometry = new BufferGeometry();
_geometry.setAttribute( 'position', new Float32BufferAttribute( [ - 1, 3, 0, - 1, - 1, 0, 3, - 1, 0 ], 3 ) );
_geometry.setAttribute( 'uv', new Float32BufferAttribute( [ 0, 2, 0, 0, 2, 0 ], 2 ) );

class FullScreenQuad {

    //optional argument rebuildFragmentShader replaces parameters.FragmentShader with a new string
    constructor( parameters) {
        //parameters are an object of the form { fragmentShader: x, uniforms: y}
        this.parameters = parameters;

        //useful for rebuilding shader
        this.uniformObject = {};
        this.uniformString = ``;

        this.material = new ShaderMaterial( parameters );

        this._mesh = new Mesh( _geometry, this.material );
    }


    //add new uniforms to the shader
    //to be used one at a time, as you add new ones
    addUniforms(uniformObject, uniformString ){
        this.uniformObject = {...uniformObject, ...this.uniformObject};
        this.uniformString = uniformString + this.uniformString;
        this.material.fragmentShader = uniformString + this.material.fragmentShader;
        this.material.uniforms = {...uniformObject,...this.material.uniforms};
    }


    render( renderer ) {
        renderer.render( this._mesh, _camera );
    }


    recompile(buildShader){
        //takes in a function buildShader and remakes everythign!
        //probably can clean this up
        this.parameters.fragmentShader = buildShader();
        this._mesh.material.dispose();
        this._mesh.material = new ShaderMaterial(this.parameters);

       this._mesh.material.fragmentShader = this.uniformString + this._mesh.material.fragmentShader;
       this._mesh.material.uniforms = this.uniformObject;
    }

}



export { FullScreenQuad };
