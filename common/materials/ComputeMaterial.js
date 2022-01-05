import {
    Vector2,
    Mesh,
    DoubleSide,
} from "../../3party/three/build/three.module.js";

import {
    UnitSquare,
} from "../gpgpu/components/UnitSquare.js";

import { CustomShaderMaterial} from "../../3party/three-csm.m.js";
import { createVertexCSM, createFragmentCSM } from "./createCSMShaders.js";



// writing custom vertex and fragment shaders for a material
// but instead of using ShaderMaterial(), injecting this code into an
// already - existing threejs material like (MeshPhysicalMaterial)
// 1) move the vertices with a vertex shader
// 2) using varyings from the vertex shader to properly color the fragment shader
//takes a compute system, uses its variables
// as uniforms in the vertex and fragment shaders


//REFACTORING GOAL:
//input vertex is of the form {auxFns: x, displace: y}
//input fragment is of the form {auxFns: x, fragColor: y}
//then we use assembleVertexCSM and assembleFragmentCSM to build the shader

class ComputeMaterial {

    constructor( computeSystem, vertex, fragment, options = {} ) {

        //store reference to the compute system
        this.compute = computeSystem;


        //make uniforms for the display shaders
        //start with assumption there are no new special ones just for the display
        //need to update this in the future (want sliders for hue, opacity, etc)
        this.uniformString = ``;
        this.uniforms = {};

        //uniforms relevant to the compute system:
        //add in the res, frameNumber, and the compute system's textures:
        this.createUniform('frameNumber' ,'float', 0);
        this.createUniform('res', 'vec2', new Vector2(this.compute.res[0], this.compute.res[1]));
        for( let variable of this.compute.variables ){
            this.createUniform(variable, 'sampler2D', this.compute.getData( variable ));
        }


        //build shaders from our inputs
        this.vertex = createVertexCSM( this.uniformString, vertex.aux, vertex.displace );
        this.fragment = createFragmentCSM( this.uniformString, fragment.aux, fragment.fragColor );



        //create the mesh by adding vertices at points in a (0,1)x(0,1) square
        this.geometry = new UnitSquare(this.compute.res[0]/5.,this.compute.res[1]/5.);


        //get the desired material properties
        this.options = options;

        //make the custom material with the vertex shader, and using the fragment shader
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
            uniforms: this.uniforms,
            passthrough: {
                side: DoubleSide,
                ...this.options
            },
        };

        //use Farazz's CustomShaderMaterial class
        this.material = new CustomShaderMaterial( customMatParameters );

        this.mesh = new Mesh(this.geometry, this.material);

        this.name = null;

    }

    //only to be used during construction:
    createUniform(variable, type, value) {
        this.uniforms[ variable ] = {value: value };
        this.uniformString += `uniform ${type} ${variable}; \n`;
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
        //just need to copy the textures into our shader uniforms, and let things go
        this.updateUniforms();
    }


}


export { ComputeMaterial };
