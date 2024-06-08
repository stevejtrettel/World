import {CustomShaderMaterial} from "../../../3party/three-csm.m.js";
import {createVertexCSM,createFragmentCSM} from "../../compute/materials/createCSMShaders.js";
import {complex} from "../../shaders/math/complex.js";
import UnitSquare from "../../compute/gpu/components/UnitSquare.js";
import {DoubleSide, Mesh} from "../../../3party/three/build/three.module.js";

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


//all the auxillary functions that we will use
let fragAux = complex + toUV + toCoords;



let createFn = function(fnText){
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





const fragColorFn = `
    vec3 fragColor(){
    
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
        return color;
     }
`;





class NewtonFractal{
    constructor(fn, uniforms, uniformString, range){

        //save the incoming data:
        this.fn = fn;
        this.uniforms = uniforms;
        this.uniformString = uniformString;
        this.range = range;

        let constantString = `
        float xMin = -10.;
        float xMax = 10.;
        float yMin = -10.;
        float yMax = 10.;
        vec2 res = vec2(4096,4096);
        `;
        this.uniformString = constantString + uniformString;


        //build the vertex shader:
        //this isn't complicated as we are drawing a plane! Just need to size it correctly and place it in space
        //using the "range" input.
        //MORE STUFF HERE!!!
        let vertAux=``;
        let vertDisplace = `
        vec3 displace( vec2 uv ){
                return vec3(uv,0);
        }
        `;
        let nVec = ` vec3 nvec(vec2 uv){
            return vec3(0,0,1);
            }`;

        this.vertex = createVertexCSM( this.uniformString, vertAux, vertDisplace, nVec );

        //build the fragment shader:
        //this is using the input complex function, and some stuff defining newton's method
        //MORE STUFF HERE!!!
        let fragColor = createFn(this.fn)+newtonMethodFunction+fragColorFn;
        this.fragment = createFragmentCSM( this.uniformString, fragAux, fragColor );

        //create the mesh by adding vertices at points in a (0,1)x(0,1) square
        //don't need much resolution, its a flat square!
        //all the resolution thats required comes from the fragment shader directly
        this.geometry = new UnitSquare(10,10);

        //give the desired material properties
        let options={};

        //make the custom material with the vertex shader, and using the fragment shader
        this.customMatParameters = {
            baseMaterial: "MeshPhysicalMaterial",
            vShader: {
                defines: this.vertex.defines,
                header: this.vertex.header,
                main: this.vertex.main,
            },

            fShader: {
                defines: this.fragment.defines,
                header: this.fragment.header,
                main: this.fragment.main,
            },
            uniforms: this.uniforms,
            passthrough: {
                side: DoubleSide,
                ...options
            },
        };

        //use Farazz's CustomShaderMaterial class
        this.material = new CustomShaderMaterial( this.customMatParameters );

        //the complex plane
        this.plane = new Mesh(this.geometry, this.material);

    }



    addToScene(scene){
        scene.add(this.plane);
    }

    setFunction(fnText){
        //recompile shader after a function has been changed
        //build the main function once again
        let fragColor = createFn(this.fn)+newtonMethodFunction+fragColorFn;
        this.fragment = createFragmentCSM( this.uniformString, fragAux, fragColor );
        //reset the main shader function
        this.plane.material.dispose();
        //assuming this.customMatParameters has been updated by nature of depending on this.fragment.....
        this.plane.material = new CustomShaderMaterial( this.customMatParameters );
    }

    update(newUniforms={}) {
            //go thru list of uniforms: if it exists in the input data, update it's value
            //(if it is in the list of things that have been updated only, of course)
            for (const [key, val] of Object.entries(this.uniforms)) {
                if (Object.hasOwn(newUniforms, key)) {
                    this.uniforms[key].value = newUniforms[key];
                }
            }
        }
}




export default NewtonFractal;
