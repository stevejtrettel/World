import {
    Vector2,
    DoubleSide,
    Mesh,
    MeshPhysicalMaterial,
    PlaneBufferGeometry, Vector3,
} from "../../../3party/three/build/three.module.js";

import {complex} from "../../shaders/math/complex.js";
import ParametricSurface from "../../components/parametric/ParametricSurface.js";
import ParametricSurfaceCPU from "../../components/parametric/ParametricSurfaceCPU.js";





//------------------------------------------------------------------
// DEFAULT VALUES OF THE PARAMETERS
//-------------------------------------------------------------------
let defaultParams = {
        enableUI: true,
        animate: true,
        slice: 1,
        uMin:0,
        uMax:1,
        vMin:0,
        vMax:2.*3.1416,
        sliceMin:-1.9,
        sliceMax:3.1,
        sliceWidth:1,
        sliceType:1,
        blackBarWidth:0.01,
        stripe:false,
        stripeFreq:10,
}


let glassOptions= {
    side: DoubleSide,
    transparent: true,
    transmission: 0.99,
    clearcoat: 1,
    ior: 1,
    envMapIntensity: 2,
    uRes:64,
    vRes:128,
};

let surfaceOptions = {
    clearcoat:1,
    roughness:0.4,
    envmapIntensity:2,
}





//------------------------------------------------------------------
// STUFF FOR THE PARAMETRIC SURFACE GPU COLORING FUNCTION
//-------------------------------------------------------------------

const boySlice = `
    float sliceAt(vec2 uv, vec3 xyz){
        //slice by z-height
        if(sliceType==1){
            return 1.-uv.x;
        }
        //slice by parameter radius in the unit disk, from center:
        else if(sliceType==2){
            return uv.x;
        
        }
        //slice by paraemter radius in unit disk, from outside:
        else if(sliceType==3){
            float height = xyz.y;
            float percent = (height + 1.9)/(3.1+1.9);
            return percent;
        }
        //by angle
        else if(sliceType==4){
            return uv.y;
        }
    
    }
`;

const coordGrid = `
float coordGrid(vec2 uv, float scale){
    float spacing = 3.1416*scale;
    float grid1 = (1.-pow(abs(sin(spacing*uv.x)*sin(10.*3.14*uv.y)),0.1))/10.;
    float grid2 = (1.-pow(abs(sin(5.*spacing*uv.x)*sin(50.*3.14*uv.y)),0.1))/25.;
    float grid3 = (1.-pow(abs(sin(10.*spacing *uv.x)*sin(100.*3.14*uv.y)),0.1))/50.;
    return grid1+grid2+grid3;
}`

const chooseColor = coordGrid+`
    vec3 chooseColor(vec2 uv, vec3 xyz, float height){
    
         float grid=coordGrid(uv, 10.);
    
         float hue = height/sliceRange+2.*uv.y;
         float sat = 0.75*sqrt(uv.x);
         vec3 base = hsb2rgb(vec3(hue,sat,0.5));
          
        if(abs(height-slice)< blackBarWidth || abs(height-slice+sliceWidth)< blackBarWidth ){ 
             base = hsb2rgb(vec3(hue,0.8,0.1));
        }
                 
        if(sliceType==4){
            //if we are in the angle case:
            if(height<blackBarWidth || 1.-uv.x<3.*blackBarWidth){
                 base = hsb2rgb(vec3(hue,0.8,0.1));
            } 
        }
                  
        vec3 final = base + 2.*vec3(grid);
        return final;
    }
`


//this is where we decide which cells to throw out, etc:
const colorFn = complex + boySlice + chooseColor + ` 
    vec3 colorFn(vec2 uv, vec3 xyz){
   
         float height = sliceAt(uv,xyz);
         
         vec3 color = chooseColor(uv,xyz,height);

          if(slice-sliceWidth < height && height < slice){
          if(stripe){
            if(sin(stripeFreq*3.1416*height)<0.){
                return color;
            }
          }
          else{
            return color;
          }
          }
         

         
         discard;

     }`;








//------------------------------------------------------------------
// STUFF FOR THE PARAMETRIC SURFACE GPU
//-------------------------------------------------------------------


let boyGLSL = complex + `
            vec3 eqn( vec2 uv ){
                vec2 z = uv.x*vec2(cos(uv.y),sin(uv.y));
                
                vec2 z3 = cmult(z,z,z);
                vec2 z4 = cmult(z,z3);
                vec2 z6 = cmult(z3,z3);
                
                vec2 denom = z6+sqrt(5.)*z3-vec2(1,0);
                vec2 G1 = -3./2.* cdiv(cmult(z,vec2(1,0)-z4),denom);
                vec2 G2 = -3./2.* cdiv(cmult(z,vec2(1,0)+z4),denom);
                vec2 G3 = cdiv(vec2(1,0)+z6,denom);
                
                float g1 = G1.y;
                float g2 = G2.x;
                float g3 = G3.y-0.5;
                float g = g1*g1+g2*g2+g3*g3;
         
                float x = g1/g;
                float y = g2/g;
                float zed = -g3/g;
                

                return 2.*vec3(x,zed-0.5,y);

            }`;




//------------------------------------------------------------------
// STUFF FOR THE PARAMETRIC SURFACE CPU
//-------------------------------------------------------------------


function cmult(z,w){
    let re = z.x*w.x-z.y*w.y;
    let im = z.x*w.y + z.y*w.x;
    return new Vector2(re,im);
}

function cdiv(z,w){
    let mag2 = w.x*w.x+w.y*w.y;
    let re = z.x*w.x+z.y*w.y;
    let im =  z.y*w.x - z.x*w.y;
    return new Vector2(re/mag2, im/mag2);
}

let boyJS = function(u,v){

    let z = new Vector2(Math.cos(v),Math.sin(v)).multiplyScalar(u+0.0001);

    let z2 = cmult(z,z);
    let z3 = cmult(z2,z);
    let z4 = cmult(z,z3);
    let z6 = cmult(z3,z3);

    let denom = z6.clone();
    denom.add(z3.clone().multiplyScalar(Math.sqrt(5)));
    denom.sub(new Vector2(1,0));


    let num1 = cmult(z, new Vector2(1.,0).sub(z4));
    let num2 = cmult(z, new Vector2(1.,0).add(z4));
    let num3 = new Vector2(1,0).add(z6);

    let G1 = cdiv(num1,denom);
    G1.multiplyScalar(-3/2);
    let G2 = cdiv(num2,denom);
    G2.multiplyScalar(-3/2);
    let G3 = cdiv(num3, denom);

    let g1 = G1.y;
    let g2 = G2.x;
    let g3 = G3.y-0.5;
    let g = g1*g1+g2*g2+g3*g3;

    let x = g1/g;
    let y = g2/g;
    let zed = -g3/g;

    return new Vector3(x,zed-0.5,y).multiplyScalar(2);

};







class BoysSurface{
    constructor( params = defaultParams ) {

        this.params = defaultParams;

        this.range = {
            u:{min:this.params.uMin+0.0001, max: this.params.uMax},
            v:{min:this.params.vMin, max:this.params.vMax}
        };

        this.uniforms = {
            slice:{type:'float',value:this.params.slice},
            sliceRange:{type:'float', value:this.params.sliceMax-this.params.sliceMin},
            sliceType:{type:'int',value:this.params.sliceType},
            sliceWidth: {type:'float',value:this.params.sliceWidth},
            blackBarWidth: {type:'float',value:this.params.blackBarWidth},
            stripe: {type:'bool',value:this.params.stripe},
            stripeFreq: {type:'float',value:this.params.stripeFreq},
        };

        this.jsEquation = boyJS;
        this.glslEquation = boyGLSL;

        this.surface = new ParametricSurface(this.glslEquation,this.range,this.uniforms,colorFn,surfaceOptions);
        this.glassSurface = new ParametricSurfaceCPU(this.jsEquation,this.range, glassOptions)
    }

    addToScene(scene){
        this.surface.addToScene(scene);
        this.glassSurface.addToScene(scene);
    }

    addToUI(ui){

        let thisObj = this;

        if(this.params.enableUI) {

            ui.add(thisObj.params, 'sliceWidth', 0., 1., 0.01).name('Width').onChange(function (value) {
                thisObj.surface.update({sliceWidth: value * value + 0.03});
            });

            ui.add(thisObj.params, 'sliceType', {
                'from Mobius': 1,
                'from Disk': 2,
                'by Height': 3,
                'by Angle': 4
            }).onChange(function (value) {
                thisObj.surface.update({sliceType: value});
            });

            let aFolder = ui.addFolder('Animation');
            aFolder.add(thisObj.params, 'animate').name('Animate');

            aFolder.add(thisObj.params, 'slice', 0., 1., 0.01).name('Slices').onChange(function (value) {
                thisObj.surface.update({slice: value});
            });

            let sFolder = ui.addFolder('Stripes');
            sFolder.add(thisObj.params, 'stripe').name('Stripes').onChange(function (value) {
                thisObj.surface.update({stripe: value});
            });
            sFolder.add(thisObj.params, 'stripeFreq', 0, 100, 1).name('Frequency').onChange(function (value) {
                thisObj.surface.update({stripeFreq: value})
            });
        }
    }

    tick(time,dTime){

        this.surface.update({time:time});

        if(this.params.animate ){
            let s = (1-Math.cos(time / 3.))/2.;
            this.params.slice=s;
            this.surface.update({slice:s});
        }
    }
}


export default BoysSurface;