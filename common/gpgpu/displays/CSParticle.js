import {
    Vector2,
    Points,
    ShaderMaterial,
    AdditiveBlending,
    BufferGeometry,
    BufferAttribute,
} from "../../../3party/three/build/three.module.js";

import { CSDisplay } from "./CSDisplay.js";

let rendV = `
uniform sampler2D data;//RenderTarget containing the transformed positions
uniform float pointSize;//size
void main() {
 
    //the mesh is a square so the uvs = the xy positions of the vertices
       vec3 pos = texture2D( data, position.xy ).xyz;
    //pos now contains a 3D position in space, we can use it as a regular vertex
    //we also export it to the fragment shader
 
    //regular projection of our position
    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
 
    //sets the point size
    gl_PointSize = pointSize;
}`;



let rendF = `
uniform sampler2D data;//RenderTarget containing the transformed positions

void main()
{
    gl_FragColor = vec4( vec3(1.), .15 );
}`;






function createParticleMesh(width,height){

    const size = width * height;

    // //Set up the vertices of our mesh:
    let vertices = new Float32Array( size * 3 );

    //no idea what this is doing yet?
    for ( let i = 0; i < size; i++ ) {
        let i3 = i * 3;
        vertices[ i3 ] = ( i % width ) / width ;
        vertices[ i3 + 1 ] = ( i / width ) / height;
    }

    return vertices;

}




class CSParticle extends CSDisplay {

    constructor( computeSystem ) {

        super( computeSystem );



        //just need to create this.display:

        //helpful to store this.uniforms as wewll
        this.uniforms =  {
            data: { value: this.compute.getDefault() },
            pointSize: { value: 2 },
            res: { value: new Vector2(this.compute.res[0], this.compute.res[1])},
        }

        //create the particle mesh by adding vertices at points in a (0,1)x(0,1) square
        let vertices = createParticleMesh(this.compute.res[0], this.compute.res[1]);
        let geometry = new BufferGeometry();
        geometry.setAttribute('position', new BufferAttribute(vertices,3));

        //the material which will be used for the Points() object:
        //its vertex shader tells the points where to go by reading the compute texture
        let material = new ShaderMaterial( {
            uniforms: this.uniforms,
            vertexShader: rendV,
            fragmentShader: rendF,
            transparent: true,
            blending:AdditiveBlending,
        } );


        //adding the this.display object
        this.display = new Points( geometry, material );

    }


    tick(){
       //the simulation has been separately added to the scene and run on its own:
       // this.compute.run();
        this.uniforms.data.value = this.compute.getData(this.selectedDisplay());
    }


}


export { CSParticle };
