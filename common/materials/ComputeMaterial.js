import {
    PlaneBufferGeometry,
    ShaderMaterial,
    MeshStandardMaterial,
    Vector2,
    Mesh,
    DoubleSide, BufferGeometry, BufferAttribute,
} from "../../3party/three/build/three.module.js";

import { CustomShaderMaterial} from "../../3party/three-csm.m.js";
import { ComputeShader } from "../gpgpu/components/ComputeShader.js";

// writing custom vertex and fragment shaders for a material
// but instead of using ShaderMaterial(), injecting this code into an
// already - existing threejs material like (MeshPhysicalMaterial)
// 1) move the vertices with a vertex shader
// 2) using varyings from the vertex shader to properly color the fragment shader


//takes a compute system, uses its variables
// as uniforms in the vertex and fragment shaders

class ComputeMaterial {

    constructor( computeSystem, vertex, fragment, options = {} ) {

        //store reference to the compute system
        this.compute = computeSystem;

        //copy over the shaders
        this.vertex = vertex;
        this.fragment = fragment;

        //get the desired material properties
        this.options = options;


        //make uniforms for the display shaders
        this.uniforms = {};
        this.uniforms.frameNumber = { value: 0};
        this.uniforms.res = { value: new Vector2(this.compute.res[0], this.compute.res[1])};
        for( let variable of this.compute.variables ){
            this.uniforms[variable] = { value : this.compute.getData( variable ) };
        }

        //create the mesh by adding vertices at points in a 1x1 square
        //ideally rebuild this so the coordinates are in (0,1)x(0,1);
        this.geometry = new PlaneBufferGeometry(1,1,this.compute.res[0],this.compute.res[1]);

        //make the custom material with the vertex shader, and using the fragment shader
        //use Farazz's CustomShaderMaterial class

        let customMatParameters = {
            baseMaterial: "MeshPhysicalMaterial",
                vShader: {
                defines: this.vertex.defines,
                    header: this.vertex.header,
                    main: this.vertex.main,
            },

            fShader: {
                defines: this.fragment.defines,
                header: this.fragment.header,
                main: this.fragment.main,
            },
          //  fShader: undefined,
            uniforms: this.uniforms,
            passthrough: {
                side: DoubleSide,
                ...this.options
            },
        };

        this.material = new CustomShaderMaterial( customMatParameters );

        this.mesh = new Mesh(this.geometry, this.material);

        this.name = null;

    }

    setName( name ){
        this.name = name;
    }


    addToScene( scene ){
        scene.add(this.mesh);
    }

    addToUI( ui ){

    }

    updateUniforms() {
        //update all the textures!
        this.uniforms.frameNumber.value += 1.;
        for( let variable of this.compute.variables ){
            this.uniforms[variable].value =  this.compute.getData( variable );
        }
    }

    tick(){
        //the compute system is running independently:
        //just need to run the texture generator, and update the map:
      //  this.textureGenerator.run();
       // this.texture = this.textureGenerator.getData();
       // this.material.map = this.texture;

        this.updateUniforms();
    }


}


export { ComputeMaterial };
