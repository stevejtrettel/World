
import {DoubleSide, Mesh, MeshPhysicalMaterial} from "../../../../3party/three/build/three.module.js";
import {ParametricGeometry} from "../../../../3party/three/examples/jsm/geometries/ParametricGeometry.js";
import {CustomShaderMaterial} from "../../../../3party/three-csm.m.js";

import inDomain from "./shaders/utils/inDomain.js";
import zStripes from "./shaders/zStripes.js";
import polarGrid from "./shaders/polarGrid.js";
import zHeight from "./shaders/zHeight.js";
import {createFragmentCSM,createVertexCSM} from "./shaders/utils/createCSMShaders.js";


//res is dots per inch
class PlotGPU {
    constructor(surface,res=10){

        this.surface = surface;
        this.colorFn = inDomain + zStripes;

        this.options = {
            clearcoat:1,
            roughness:0.35,
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
        console.log(this.surface.domain.v.min);
        this.domainVariables = `
                float uMin = ${this.surface.domain.u.min};
                float uMax = ${this.surface.domain.u.max};
                float vMin = ${this.surface.domain.v.min};
                float vMax = ${this.surface.domain.v.max};
                float edge = ${this.surface.domainParams.edge};`;

        let fragMain = this.domainVariables + this.colorFn +
            `
            vec3 fragColor(){
                if(inDomain(vUv, vPosition)){
                    return vec3(1,1,1);
                }
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
        //only need to do this first line if we are changing the shader
        //right now, only relevant if we change the domain.
        this.compileMaterial();
        //this is for changing the geometry itself:
        this.plot.geometry.dispose();
        this.plot.geometry =  new ParametricGeometry(this.surface.parametricSurface,this.slices,this.stacks);
    }
}


export default PlotGPU;