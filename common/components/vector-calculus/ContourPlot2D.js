import {
    BoxBufferGeometry,
    DoubleSide,
    LinearFilter,
    Mesh,
    MeshPhysicalMaterial
} from "../../../3party/three/build/three.module.js";
import {colorConversion} from "../../shaders/colors/colorConversion.js";
import TextureShader from "../../compute/gpu/components/TextureShader.js";


//need to make a function vec3 fragColor();
//have available as varyings vPosition, vUv and vNormal
const defaultColorFn = `
    vec3 colorFn(float z){
      if(abs(z)<0.1){
        return vec3(1,0,0);
      }
      return vec3(0.03);
    }
`;

const toUV = `
    vec2 toUV(vec2 pixelCoords){
        return vec2(pixelCoords.x/res.x,pixelCoords.y/res.y);
    }
    `;

const rescaleUV = `
            vec2 rescaleUV( vec2 uv ){
                float uSpread = uMax-uMin;
                float u = uSpread*uv.x+uMin;
                
                float vSpread = vMax-vMin;
                float v = vSpread*uv.y + vMin;
                
                return vec2(u,v);
            }  
`;

const mainShaderFn = `
    void main(){
    
        //get coordinates from fragCoord:
        vec2 uv = toUV( gl_FragCoord.xy );
        vec2 coords = rescaleUV(uv);
        
        //get function value at this point:
        float z = eqn(coords);
        
        //use the color function
        vec3 color = colorFn(z);
    
        //return this to the shader
        gl_FragColor = vec4(color,1);
     }
`;


const defaultMatOptions = {};


class ContourPlot2D{
    constructor(renderer, eqn, domain, uniforms, colorFn=defaultColorFn, options = defaultMatOptions) {

        this.eqn = eqn;
        this.domain = domain;
        this.colorFn = colorFn;
        this.res = [1024,1024];
        this.renderer = renderer;

        //make uniforms for the display shaders
        this.uniformString = ``;
        this.uniforms = {};

        this.createUniform('res','vec2',this.res);
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

        //setup the shader for drawing the base geometry.
        let shader = this.buildShader();

        //most settings are defualt in ComputeRTs.js: just making sure its our chosen
        //resolution and the linear filter to not be pixelated.
        let rtSettings = {
            res:this.res,
            filter:LinearFilter,
        };
        this.texShader = new TextureShader(shader, this.uniforms, this.uniformString, rtSettings, this.renderer );

        //main thing here is that we have a map for the texture!
        //it comes from this.compute
        let planeMat = new MeshPhysicalMaterial({
            side:DoubleSide,
            clearcoat:1,
        });
        planeMat.map = null;


        let planeGeom = new BoxBufferGeometry(1,1,0.1);

        this.plane = new Mesh(planeGeom,planeMat);

        //position the plane correctly:
        //first, stretch it out to match the range of the plot
        let spreadU = this.domain.u.max-this.domain.u.min;
        let spreadV = this.domain.v.max-this.domain.v.min;
        this.plane.scale.set(spreadU,spreadV,1);

        //now rotate it to lie horizontally
        this.plane.rotateX(-Math.PI/2);
        //this.plane.rotateZ(Math.PI);

        //run the shader!
        this.update();
    }

    buildShader(){
        let eqnGLSL = `
            float eqn( vec2 uv ){
                float u = uv.x;
                float v = uv.y;
                return ${this.eqn};
            }
            `;
        return colorConversion + toUV + rescaleUV + eqnGLSL + this.colorFn + mainShaderFn;
    }

    update(newUniforms){
        //update the uniforms that are coming in to us
        this.texShader.updateUniforms(newUniforms);
        //run the computation
        this.texShader.run();
        //update the texture
        this.plane.material.map = this.texShader.getData();
    }

    setFunction(fnText){
        this.eqn = fnText;
        let shader = this.buildShader();
        //send this shader to the computer, and recompile it
        this.texShader.recompile(shader);
    }

    //only to be used during construction:
    createUniform(variable, type, value) {
        this.uniforms[ variable ] = {value: value };
        this.uniformString += `uniform ${type} ${variable}; \n`;
    }

    setPosition(x,y,z){
        this.plane.position.set(x,y,z);
    }


    addToScene(scene){
        scene.add(this.plane);
    }

}


export default ContourPlot2D;
