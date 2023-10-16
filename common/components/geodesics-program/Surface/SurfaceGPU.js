
import {DoubleSide, Mesh, MeshPhysicalMaterial} from "../../../../3party/three/build/three.module.js";
import {CustomShaderMaterial} from "../../../../3party/three-csm.m.js";
import {ParametricGeometry} from "../../../../3party/three/examples/jsm/geometries/ParametricGeometry.js";


import {colorConversion} from "../../../shaders/colors/colorConversion.js";
import {createFragmentCSM,createVertexCSM} from "./shaders/createCSMShaders.js";


const colorFn = `
vec3 colorFn(vec2 uv,vec3 xyz){
        float u = uv.x;
        float v = uv.y;
        float x = xyz.x;
        float y = xyz.y;
        float z = xyz.z;
        
        return vec3(0.2,0.3,y);
    }
`;

class SurfaceGPU{
    constructor(compute){

        this.compute = compute;
        this.colorFn = colorFn;
        this.options = {
            clearcoat:1,
            roughness:0.5,
        }

        const plotGeometry = new ParametricGeometry(compute.parametricSurface,50,50);

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
        this.fragment = createFragmentCSM( '', colorConversion, fragMain );


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

    }
}


export default SurfaceGPU;