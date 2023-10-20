
import {DoubleSide, Mesh, MeshPhysicalMaterial} from "../../../../3party/three/build/three.module.js";
import {ParametricGeometry} from "../../../../3party/three/examples/jsm/geometries/ParametricGeometry.js";
import {CustomShaderMaterial} from "../../../../3party/three-csm.m.js";

import zHeight from "./shaders/zHeight.js";
import {createFragmentCSM,createVertexCSM} from "./shaders/utils/createCSMShaders.js";


//res is dots per inch
class PlotGPU {
    constructor(surface,res=20){

        this.surface = surface;
        this.colorFn = zHeight;

        this.options = {
            clearcoat:1,
            roughness:0.5,
        }

        let uDom = this.surface.domain.u;
        let vDom = this.surface.domain.v;
        this.slices = Math.floor(res*(uDom.max-uDom.min));
        this.stacks = Math.floor(res*(vDom.max-vDom.min));
        const plotGeometry = new ParametricGeometry(this.surface.parametricSurface,this.slices,this.stacks);


        //next: build the shader material
        let plotShaderMaterial = this.compileMaterial();
        this.plot = new Mesh(plotGeometry, plotShaderMaterial);

    }


    addToScene(scene){
        scene.add(this.plot);
    }


    compileMaterial(){
        //build shaders from our inputs
        let fragMain = this.colorFn +
            `
            vec3 fragColor(){
                return colorFn(vUv, vPosition);
            }`;

        this.vertex = createVertexCSM( );
        this.fragment = createFragmentCSM( '', '', fragMain );


        //make the custom material with the vertex shader, and using the fragment shader
        let customMatParameters = {
            baseMaterial: "MeshPhysicalMaterial",
            vShader: this.vertex,
            fShader: this.fragment,
            uniforms: {},
            passthrough: {
                side: DoubleSide,
                ...this.options
            },
        };

        //use Farazz's CustomShaderMaterial class
        return new CustomShaderMaterial( customMatParameters );
    }


    update(){
        this.plot.geometry.dispose();
        this.plot.geometry =  new ParametricGeometry(this.surface.parametricSurface,this.slices,this.stacks);
    }
}


export default PlotGPU;