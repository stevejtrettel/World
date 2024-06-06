import {createFragmentCSM, createVertexCSM} from "../../compute/materials/createCSMShaders.js";
import UnitSquare from "../../compute/gpu/components/UnitSquare.js";
import {DoubleSide, Mesh} from "../../../3party/three/build/three.module.js";
import {CustomShaderMaterial} from "../../../3party/three-csm.m.js";
import {colorConversion} from "../../shaders/colors/colorConversion.js";



const frenetFrame = `
    void frenetFrame(in float s, out vec3 T, out vec3 N, out vec3 B){
        float eps = 0.005;
        vec3 pos0 = eqn(s);
        vec3 pos1 = eqn(s+eps);
        vec3 pos2 = eqn(s+2.*eps);
        
        T = normalize(pos1-pos0);
        N = normalize(pos2-2.*pos1+pos0);
        B = cross(T,N);

    }
`;

const defaultEqn = `
    vec3 eqn( float s ){
        return vec3(s,s*s,s*s*s);
    }
`;

//need to make a function vec3 fragColor();
//have available as varyings vPosition, vUv and vNormal
const defaultColorFn = `
    vec3 colorFn(float s,vec3 xyz){
        
        float x = xyz.x;
        float y = xyz.y;
        float z = xyz.z;
        
        return vec3(0.2,0.3,y);
    }
`;



const defaultMatOptions = {};


class ParametricCurve {
    constructor(eqn, domain, uniforms, colorFn=defaultColorFn, options = defaultMatOptions,rad=0.1) {

        this.eqn = eqn;
        this.domain = domain;
        this.colorFn = colorFn;
        this.res = [2048,64];
        this.rad=rad;

        //get the desired material properties
        this.options = options;


        //make uniforms for the display shaders
        this.uniformString = ``;
        this.uniforms = {};

        this.createUniform('frameNumber' ,'float', 0);
        this.createUniform('time' ,'float', 0);
        this.createUniform('dTime' ,'float', 0);
        this.createUniform('sMin','float', this.domain.min);
        this.createUniform('sMax','float', this.domain.max);
        this.createUniform('rad','float', this.rad);
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
        return  this.eqn + frenetFrame + `
            float rescaleS( float s ){
                float spread = sMax-sMin;
                float S = spread*s+sMin;
                return S;
            }    
            vec3 displace( vec2 uv ){
                
                float s = rescaleS(uv.x);
                float theta = 2.*3.14159*uv.y;
                
                vec3 T,N,B;
                //get the frenetFrame at this point
                frenetFrame(s,T,N,B);
                
                //compute the parameterization
                vec3 pos = eqn(s);
                vec3 circ = N*cos(theta)+B*sin(theta);
                
                return pos+rad*circ;
              
            }
            `;
    }


    //build the frag shader from the color function color(uv, xyz);
    createFragMain(){
        return this.eqn + this.colorFn +
            `
            vec3 fragColor(){
                return colorFn(vUv.x, vPosition);
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

    setFunction(eqn){
        this.eqn = eqn;
        this.surface.material.dispose();
        this.surface.material = this.compileMaterial();
    }

    setDomain(domain){
        this.domain=domain;
        this.update({
            sMin:this.domain.min,
            sMax:this.domain.max,
        });
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


export default ParametricCurve;