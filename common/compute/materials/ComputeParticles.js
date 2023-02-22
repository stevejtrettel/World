import {
    AdditiveBlending,
    BufferAttribute,
    BufferGeometry,
    Points,
    ShaderMaterial,
    Vector2
} from "../../../3party/three/build/three.module.js";

import { createParticleMesh } from "../gpu/components/createParticleMesh.js";


class ComputeParticles {
    constructor( computeSystem, uniforms, vertex, fragment, options = {} ) {


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
            this.createUniform( variable, 'sampler2D', this.compute.getData( variable ));
        }

        //uniforms for the particle system governed by UI
        //package the uniforms for the UI in a useful way:
        this.paramProperties = uniforms;
        this.parameters = {};


        for( let uniform of Object.keys(this.paramProperties)){
            this.parameters[uniform] = this.paramProperties[uniform].value;
            this.createUniform(uniform, this.paramProperties[uniform].type, this.paramProperties[uniform].value);
        }

        //create the particle mesh by adding vertices at points in a (0,1)x(0,1) square
        const vertices = createParticleMesh(this.compute.res[0], this.compute.res[1]);
        let geometry = new BufferGeometry();
        geometry.setAttribute('position', new BufferAttribute(vertices,3));


        //the material which will be used for the Points() object:
        //its vertex shader tells the points where to go by reading the compute texture
        let material = new ShaderMaterial( {
            uniforms: this.uniforms,
            vertexShader: this.uniformString+vertex,
            fragmentShader: this.uniformString+fragment,
            transparent: true,
            blending:AdditiveBlending,
        } );

        //adding the this.display object
        this.particles = new Points( geometry, material );

    }


    setName( name ){
        this.name = name;
    }

    //only to be used during construction:
    createUniform(variable, type, value) {
        this.uniforms[ variable ] = {value: value };
        this.uniformString += `uniform ${type} ${variable}; \n`;
    }


    updateUniforms() {
        //update all the uniforms coming from compute system
        this.uniforms.frameNumber.value += 1.;
        for( let variable of this.compute.variables ){
            this.uniforms[variable].value =  this.compute.getData( variable );
        }

        //other uniforms (from UI) are automatically updated
    }







    addToUI( ui ) {
        //make a folder for this compute system:
        if(Object.keys(this.paramProperties).length != 0) {
            let Folder = ui.addFolder(this.name);
            for (let variable of Object.keys(this.paramProperties)) {
                //add uniform to folder. update the uniforms on change
                Folder.add(this.parameters, variable, ...this.paramProperties[variable].range).onChange(val => this.uniforms[variable].value = val);
            }
        }
    }

    addToScene( scene ) {
        scene.add(this.particles);
    }

    tick( ) {
        this.updateUniforms();
    }

}




export { ComputeParticles };
