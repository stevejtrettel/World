import{
    OrthographicCamera,
    BufferGeometry,
    Float32BufferAttribute,
    Mesh,
    ShaderMaterial,
} from "../../3party/three/build/three.module.js";


const _camera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

// https://github.com/mrdoob/three.js/pull/21358

const _geometry = new BufferGeometry();
_geometry.setAttribute( 'position', new Float32BufferAttribute( [ - 1, 3, 0, - 1, - 1, 0, 3, - 1, 0 ], 3 ) );
_geometry.setAttribute( 'uv', new Float32BufferAttribute( [ 0, 2, 0, 0, 2, 0 ], 2 ) );

class FullScreenQuad {

    constructor( parameters) {
        //parameters are an objedt of the form { fragmentShader: x, uniforms: y}
        let material = new ShaderMaterial( parameters );
        this._mesh = new Mesh( _geometry, material );
    }

    dispose() {

        this._mesh.geometry.dispose();

    }

    render( renderer ) {

        renderer.render( this._mesh, _camera );

    }

    get material() {

        return this._mesh.material;

    }

    set material( value ) {

        this._mesh.material = value;

    }

}



export { FullScreenQuad };
