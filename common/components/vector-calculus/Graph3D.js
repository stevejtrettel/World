import {createFragmentCSM, createVertexCSM} from "../../compute/materials/createCSMShaders.js";
import {UnitSquare} from "../../compute/gpu/components/UnitSquare.js";
import {DoubleSide, Mesh} from "../../../3party/three/build/three.module.js";
import {CustomShaderMaterial} from "../../../3party/three-csm.m.js";
import {colorConversion} from "../../shaders/colors/colorConversion.js";



const defaultEqn = `
    vec3 eqn( vec2 uv ){
        float u = uv.x;
        float v = uv.y;
        return vec3(u,v,u*u+v*v);
    }
`;

//need to make a function vec3 fragColor();
//have available as varyings vPosition, vUv and vNormal
const defaultColorFn = `
    vec3 colorFn(vec2 uv,vec3 xyz){
        float u = uv.x;
        float v = uv.y;
        float x = xyz.x;
        float y = xyz.y;
        float z = xyz.z;
        
        return vec3(0.2,0.3,y);
    }
`;



const defaultMatOptions = {};


class Graph3D {
    constructor(eqn, domain, uniforms, colorFn=defaultColorFn, options = defaultMatOptions) {

        this.eqn = eqn;
        this.domain = domain;
        this.colorFn = colorFn;
        this.res = [1024,1024];

        //get the desired material properties
        this.options = options;


        //make uniforms for the display shaders
        this.uniformString = ``;
        this.uniforms = {};

        this.createUniform('frameNumber' ,'float', 0);
        this.createUniform('time' ,'float', 0);
        this.createUniform('dTime' ,'float', 0);
        this.createUniform('uMin','float', this.domain.u.min);
        this.createUniform('uMax','float', this.domain.u.max);
        this.createUniform('vMin','float', this.domain.v.min);
        this.createUniform('vMax','float', this.domain.v.max);
        for( let variable of Object.keys(uniforms)){
            this.createUniform(variable, uniforms[variable].type, uniforms[variable].value);
        }

        //create the mesh by adding vertices at points in a (0,1)x(0,1) square
        //resolution is given by options
        this.geometry = new UnitSquare(this.res[0],this.res[1]);
        this.surface = new Mesh(this.geometry, this.compileMaterial());

    }


    compileMaterial(){
        //build shaders from our inputs
        let vertexAux = ``;
        let vertexMain = this.createVertexMain();
        let fragMain = this.createFragMain();
        this.vertex = createVertexCSM( this.uniformString, vertexAux, vertexMain );
        this.fragment = createFragmentCSM( this.uniformString, colorConversion, fragMain );


        //make the custom material with the vertex shader, and using the fragment shader
        let customMatParameters = {
            baseMaterial: "MeshPhysicalMaterial",
            vShader: this.vertex,
            fShader: this.fragment,
            uniforms: this.uniforms,
            passthrough: {
                side: DoubleSide,
                ...this.options
            },
        };

        //use Farazz's CustomShaderMaterial class
       return new CustomShaderMaterial( customMatParameters );
    }

    //build the main shader component given a function eqn(u,v, params);
    createVertexMain(){
            return  `
            vec2 rescaleUV( vec2 uv ){
                float uSpread = uMax-uMin;
                float u = uSpread*uv.x+uMin;
                
                float vSpread = vMax-vMin;
                float v = vSpread*uv.y + vMin;
                
                return vec2(u,v);
            }    
            vec3 displace( vec2 uv ){
                uv = rescaleUV(uv);
                float u = uv.x;
                float v = uv.y;
                float res = ${this.eqn};
                return vec3(u,res,-v);
            }
            `;
    }


    //build the frag shader from the color function color(uv, xyz);
    createFragMain(){
            return this.colorFn +
                `
            vec3 fragColor(){
                return colorFn(vUv, vPosition);
            }`;
    }


    //only to be used during construction:
    createUniform(variable, type, value) {
        this.uniforms[ variable ] = {value: value };
        this.uniformString += `uniform ${type} ${variable}; \n`;
    }

    setPosition(x,y,z){
        this.surface.position.set(x,y,z);
    }


    addToScene(scene){
        scene.add(this.surface);
    }

    setFunction(fnText){
        this.eqn = fnText;
        this.surface.material.dispose();
        this.surface.material = this.compileMaterial();
    }

    update(uniforms){
        //range over all the uniforms that were added in update
        for( let variable of Object.keys(uniforms)){
            if(this.surface.material.uniforms != undefined && this.surface.material.uniforms.hasOwnProperty(variable)) {
                this.surface.material.uniforms[variable].value = uniforms[variable];
            }
        }
    }
}


export default Graph3D;