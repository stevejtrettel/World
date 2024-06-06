import {
    Vector2,
    Mesh,
    DoubleSide,
} from "../../../3party/three/build/three.module.js";

import { CustomShaderMaterial} from "../../../3party/three-csm.m.js";
import { createVertexCSM, createFragmentCSM } from "./createCSMShaders.js";

import UnitSquare from "../gpu/components/UnitSquare.js";

// writing custom vertex and fragment shaders for a material
// but instead of using ShaderMaterial(), injecting this code into an
// already - existing threejs material like (MeshPhysicalMaterial)
// 1) move the vertices with a vertex shader
// 2) using varyings from the vertex shader to properly color the fragment shader


class ParametricMaterial {

    constructor( res, vertex, fragment, uniforms, options = {} ) {

        //make uniforms for the display shaders
        //start with assumption there are no new special ones just for the display
        //need to update this in the future (want sliders for hue, opacity, etc)
        this.uniformString = ``;
        this.uniforms = {};

        //make strings for any new varyings that are introduced:
        this.varyingDefString=``;


        //uniforms relevant to the compute system:
        this.createUniform('frameNumber' ,'float', 0);
        this.createUniform('time' ,'float', 0);
        this.createUniform('dTime' ,'float', 0);


        //uniforms for the particle system governed by UI
        //package the uniforms for the UI in a useful way:
        this.paramProperties = uniforms;
        this.parameters = {};

        for( let uniform of Object.keys(this.paramProperties)){
            this.parameters[uniform] = this.paramProperties[uniform].value;
            this.createUniform(uniform, this.paramProperties[uniform].type, this.paramProperties[uniform].value);
        }


        //build shaders from our inputs
        this.vertex = createVertexCSM( this.uniformString, vertex.aux, vertex.displace );
        this.fragment = createFragmentCSM( this.uniformString, fragment.aux, fragment.fragColor );

        //create the mesh by adding vertices at points in a (0,1)x(0,1) square
        //resolution is given by options
        this.geometry = new UnitSquare(res[0],res[1]);

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


    //NOT USED YET: NEED TO INTRODUCE THE ABILITY TO CREATE CUSTOM VARYINGS!
    createVarying(variable,type, value){
        this.varyingDefString += `varying ${type} ${variable}; \n`;
    }


    setName( name ){
        this.name = name;
    }


    addToScene( scene ){
        scene.add(this.mesh);
    }


    addToUI( ui ) {
        //make a folder for this compute system:
        let Folder = ui.addFolder(this.name);
        for( let variable of Object.keys(this.paramProperties)){
            //add uniform to folder. update the uniforms on change
            Folder.add(this.parameters, variable, ...this.paramProperties[variable].range).onChange(val => this.uniforms[variable].value = val);
        }
    }

    updateUniforms() {
        //all ui uniforms are updated automatically
        this.uniforms.frameNumber.value += 1.;
    }

    tick(time, dTime){
        this.updateUniforms();
        this.uniforms.time.value = time;
        this.uniforms.dTime.value = dTime;
    }


}


export default ParametricMaterial;
