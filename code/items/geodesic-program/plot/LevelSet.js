import zStripes from "./shaders/zStripes.js";
import {ParametricGeometry} from "../../../../3party/three/examples/jsm/geometries/ParametricGeometry.js";
import {DoubleSide, Mesh, Vector2} from "../../../../3party/three/build/three.module.js";
import {createFragmentCSM, createVertexCSM} from "./shaders/utils/createCSMShaders.js";
import {CustomShaderMaterial} from "../../../../3party/three-csm.m.js";


//needs some work:
//before was getting level set color from z coordinate of surface.
//but if we set z coordinate to zero, doesn't work!

class LevelSet{
    constructor(surface,res=20){

        this.surface = surface;
        this.colorFn = zStripes;

        this.options = {
            clearcoat:1,
            roughness:0.35,
        }

        let uDom = this.surface.domain.u;
        let vDom = this.surface.domain.v;

        this.slices = Math.floor(res*(uDom.max-uDom.min));
        this.stacks = Math.floor(res*(vDom.max-vDom.min));

        const plotGeometry = new ParametricGeometry(this.surface.parametricDomain,this.slices,this.stacks);

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


    updateSurface(){
        this.plot.geometry.dispose();
        this.plot.geometry =  new ParametricGeometry(this.surface.parametricSurface,this.slices,this.stacks);
    }
}



export default LevelSet;
