import { globals } from "../../../template/src/globals.js";
import {
    DoubleSide,
    LinearFilter,
    MeshPhysicalMaterial,
    PlaneBufferGeometry,
    BoxBufferGeometry,
    Mesh,
} from "../../../3party/three/build/three.module.js";
import { colorConversion } from "../../shaders/colors/colorConversion.js";
import TextureShader from "../../gpu/components/TextureShader.js";


//USES THE GLOBALS.RENDERER object



let createGLSLFunction = function(fnText){
    return `
    float f( vec2 coords ){
        float x = coords.x;
        float y = coords.y;
        return`
    + " " + fnText
    + `;}`
}

//points in the square (0,1)x(0,1)
const toUV = `
    vec2 toUV(vec2 pixelCoords){
    
        //FLIP THE X COORDINATE:
        //TO MATCH WITH THE GRADIENT VECTOR FIELD: THINK I NEED TO REFLECT SOMEWHERE ELSE?
        return vec2(pixelCoords.x/res.x,pixelCoords.y/res.y);
    }
    `;

const toCoords = `
    vec2 toCoords( vec2 uv ){
    
        float spreadX = (xMax-xMin);
        float spreadY = (yMax-yMin);
        float x = spreadX*uv.x + xMin;
        float y = spreadY*uv.y + yMin;
        
        //FLIP THE X COORDINATE
        //TO LINE UP WITH THE GRADIENT FIELD
        //THINK I NEED A REFLECTION SOMEWHERE
        //NEED TO TRACK THIS DOWN: HACK!!! :(
        return vec2(-x,y);
    }
`;


const mainShaderFn = `
    void main(){
    
        //get coordinates from fragCoord:
        vec2 uv = toUV( gl_FragCoord.xy );
        vec2 coords = toCoords(uv);
        
        //get function value at this point:
        float z = f(coords);
        
        //map z to a color value:
        //using hsb2rgb from color conversion at the moment:

        float large = pow(abs(sin(z)),70.);
        vec3 color =vec3(large,0,0);
    
        //return this to the shader
        gl_FragColor = vec4(color,1);
     }
`;





class ContourPlot2D{
    constructor(fnText, uniforms, uniformString, range){
        this.res = [1024,1024];
        this.range = range;
        this.uniforms = uniforms;
        this.f = fnText;

        this.uniformString=uniformString;
        this.constantString = `
        float xMin = -10.;
        float xMax = 10.;
        float yMin = -10.;
        float yMax = 10.;
        vec2 res = vec2(1024,1024);
        `;

        //setup the shader for drawing the base geometry.
        let contourFn = createGLSLFunction(fnText);
        let shader = this.constantString + colorConversion + toUV+toCoords + contourFn + mainShaderFn;

        //most settings are defualt in ComputeRTs.js: just making sure its our chosen
        //resolution and the linear filter to not be pixelated.
        let rtSettings = {
            res:this.res,
            filter:LinearFilter,
        };
        this.texShader = new TextureShader(shader, this.uniforms, this.uniformString, rtSettings, globals.renderer );

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
        let spreadX = this.range.x.max-this.range.x.min;
        let spreadY = this.range.y.max-this.range.y.min;
        this.plane.scale.set(spreadX,spreadY,1);

        //now rotate it to lie horizontally
        this.plane.rotateX(-Math.PI/2);
        this.plane.rotateZ(Math.PI);
    }

    setPosition(x,y,z){
        this.plane.position.set(x,y,z);
    }


    addToScene(scene){
        scene.add(this.plane);
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
        //setup the shader for drawing the base geometry.
        let contourFn = createGLSLFunction(fnText);
        let shader = this.constantString + colorConversion + toUV+toCoords + contourFn + mainShaderFn;
        //send this shader to the computer, and recompile it
        this.texShader.recompile(shader);
    }

}


export default ContourPlot2D;