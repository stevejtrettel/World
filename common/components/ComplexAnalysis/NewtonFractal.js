import { globals } from "../../../template/src/globals.js";
import {
    DoubleSide,
    LinearFilter,
    MeshPhysicalMaterial,
    BoxBufferGeometry,
    Mesh, NearestFilter,
} from "../../../3party/three/build/three.module.js";


import {complex} from "../../shaders/math/complex.js";
import { colorConversion } from "../../shaders/colors/colorConversion.js";
import TextureShader from "../../gpu/components/TextureShader.js";


//USES THE GLOBALS.RENDERER object





//points in the square (0,1)x(0,1)
const toUV = `
    vec2 toUV(vec2 pixelCoords){
        return vec2(pixelCoords.x/res.x,pixelCoords.y/res.y);
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







let createGLSLFunction = function(fnText){
    return `
    vec2 f( vec2 z ){
        return`
        + " " + fnText
        + `;}`
}



//these functions depend on the function f defined above in
//createGLSLFunction()
const newtonMethodFunction = `
vec2 fPrime( vec2 z ){
    float eps = 0.0001;
    
    //if the function is complex differentiable the limit exists and
    //is equal along all directions approaching zero: so, approach along real axis!
    vec2 df = f(z+vec2(eps/2.,0))-f(z-vec2(eps/2.,0));
    
    return df/eps;
}

vec2 newton( vec2 z ){
    vec2 val = f(z);
    vec2 deriv = fPrime(z);
    vec2 adjust = cdiv(val,deriv);
    
    vec2 z1 = z - adjust;
    return z1;
}

vec2 newtonIteration( vec2 z, int n ){

    for(int i=0; i<n; i++){
        z = newton(z);
    }
    
    return z;
   
}
`;





const mainShaderFn = `
    void main(){
    
        //get coordinates from fragCoord:
        vec2 uv = toUV( gl_FragCoord.xy );
        vec2 z = toCoords(uv);
        
        //run newton's iteration at z:
        vec2 w = newtonIteration(z, 20);
        
        //map w to a color value:
        //check if we have converged, by applying newton one more time
        vec3 color;
        vec2 v = newton(w);
        if(length(v-w)>0.0001){
            color = vec3(0);
        }
        else{
            //the system has converged: choose a color based on w:
            color = vec3(w.x,w.y,0);
        }
    
        //return this to the shader
        gl_FragColor = vec4(color,1);
     }
`;





class NewtonFractal{
    constructor(fnText, uniforms, uniformString, range){
        this.res = [4096,4096];
        this.range = range;
        this.uniforms = uniforms;
        this.f = fnText;

        this.uniformString=uniformString;
        this.constantString = `
        float xMin = -10.;
        float xMax = 10.;
        float yMin = -10.;
        float yMax = 10.;
        vec2 res = vec2(4096,4096);
        `;

        //setup the shader for drawing the base geometry.
        let cplxFn = createGLSLFunction(fnText);
        let shader = this.constantString + complex + toUV+toCoords + cplxFn + newtonMethodFunction + mainShaderFn;

        //most settings are defualt in ComputeRTs.js: just making sure its our chosen
        //resolution and the linear filter to not be pixelated.
        let rtSettings = {
            res:this.res,
            filter:NearestFilter,
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
        let cplxFn = createGLSLFunction(fnText);
        let shader = this.constantString + complex + toUV+toCoords + cplxFn + newtonMethodFunction + mainShaderFn;
        //send this shader to the computer, and recompile it
        this.texShader.recompile(shader);
    }

}


export default NewtonFractal;