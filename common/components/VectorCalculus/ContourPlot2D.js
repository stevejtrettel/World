import { globals } from "../../../template/src/globals.js";
import {
    DoubleSide,
    LinearFilter,
    MeshPhysicalMaterial,
    PlaneBufferGeometry,
    ShaderMaterial
} from "../../../3party/three/build/three.module";
import { ComputeShader } from "../../gpu/components/ComputeShader.js";
import { colorConversion } from "../../shaders/colors/colorConversion.js";

//USES THE GLOBALS.RENDERER object





let createGLSLFunction = function(fnText){
    return `
    float f( vec2 coords ){
        float x = coords.x;
        float y = coords.y;
        return`
    + fnText
    + `;}`
}

//points in the square (0,1)x(0,1)
const toUV = `
    vec2 toUV(vec2 pixelCoords){
        return (vec2(pixelCoords.x/res.x,pixelCoords.y/res.y);
    }
    `;

const toCoords = `
    vec2 toCoords( vec2 uv ){
        float spreadX = (xMax-xMin);
        float spreadY = (yMax-yMin);
        float x = spreadX*uv.x + xMin;
        float y = spreadY*uv.y + yMin;
        return vec2(x,y);
    }
`;


const mainShaderFn = `
    void main(){
    
        //get coordinates from fragCoord:
        vec2 uv = toUV( gl_FragCoord.xy );
        vec2 coords = toCoords(uv);
        
        //get function value at this point:
        let z = f(coords);
        
        //map z to a color value:
        //using hsb2rgb from color conversion at the moment:
        vec3 color = hsb2rgb(vec3(z,0.5,0.5));
    
        //return this to the shader
        gl_FragColor = vec4(color,1);
     }
`;





class ContourPlot2D{
    constructor(fnText, uniforms, domain){
        this.res = [256,256];
        this.domain = domain;
        this.uniforms = uniforms;
        this.f = fnText;

        //setup the shader for drawing the base geometry.
        //WHAT ABOUT THE UNIFORMS?!
        let contourFn = createGLSLFunction(fnText);
        let shader = colorConversion+toUV+toCoords+contourFn+mainShaderFn;


        //most settings are defualt in ComputeRTs.js: just making sure its our chosen
        //resolution and the linear filter to not be pixelated.
        let rtSettings = {
            res:this.res,
            filter:LinearFilter,
        };
        this.compute= new ComputeShader(shader, uniforms, rtSettings, globals.renderer);
        this.compute.initialize();//not actually needed as we didn't pass it an initialization shader: so this just runs the zero shader.
        this.compute.run();

        //main thing here is that we have a map for the texture!
        //it comes from this.compute
        let planeMat = new MeshPhysicalMaterial({
            side:DoubleSide,
            clearcoat:1,
        });
        planeMat.map = null;


        let planeGeom = new PlaneBufferGeometry(1,1);
        this.plane = new MeshPhysicalMaterial(planeGeom,planeMat);
    }

    addToScene(scene){
        scene.add(this.plane);
    }

    setDomain(domain){
        this.domain=domain;

        //get data about the plane:
        let avgX =  (this.domain.x.max+this.domain.x.min)/2;
        let avgY =  (this.domain.y.max+this.domain.y.min)/2;
        let spreadX = (this.domain.x.max-this.domain.x.min);
        let spreadY = (this.domain.y.max-this.domain.y.min);

        //set the scale of the plane based on spread:
        this.plane.scale.set(spreadX,1,spreadY);
        //set the center of the plane to be the averages:
        this.plane.position.set(avgX, 0, avgY);
    }

    update(){
        //run the computation
        this.compute.run();
        //update the texture
        this.plane.material.map = this.compute.getData();
    }

    replaceFn(fnText){
        //setup the shader for drawing the base geometry.
        //WHAT ABOUT THE UNIFORMS?!
        let contourFn = createGLSLFunction(fnText);
        let shader = colorConversion+toUV+toCoords+contourFn+mainShaderFn;
        //send this shader to the computer, and recompile it
        this.compute.buildShaders=shader;
        this.compute.recompile()
    }

}


export default ContourPlot2D;