import {
    DoubleSide,
     Vector3,
} from "../../../3party/three/build/three.module.js";

import ParametricSurface from "../../components/parametric/ParametricSurface.js";
import ParametricSurfaceCPU from "../../components/parametric/ParametricSurfaceCPU.js";


//------------------------------------------------------------------
// DEFAULT VALUES OF THE PARAMETERS
//-------------------------------------------------------------------


let defaultParams = {
        animate: true,
        slice: 1,
        uMin:0,
        uMax:2.*3.1416,
        vMin:0,
        vMax:4.*3.1416,
        sliceMin:-1.9,
        sliceMax:3.1,
        sliceType:1,
        blackBarWidth:0.01,
        stripe:false,
        stripeFreq:50,
        drawGlass:true,
        enableUI: true,
}


let glassOptions= {
    side: DoubleSide,
    transparent: true,
    transmission: 0.99,
    clearcoat: 1,
    ior: 1,
    envMapIntensity: 2,
    uRes:64,
    vRes:64,
};

let surfaceOptions = {
    clearcoat:1,
    roughness:0.4,
    envMapIntensity:2,
}


//------------------------------------------------------------------
// COLOR FUNCTION / SLICING FOR PARAMETRIC MATERIAL
//-------------------------------------------------------------------

const sliceAt = `
    float sliceAt(vec2 uv, vec3 xyz){
    
        //slice by the mobius strip direction
        if(sliceType==1 || sliceType==2){
            return 2.*abs(uv.x-0.5);
        }
        
        //by parameter (sweepout)
        else if(sliceType==3){
            return mod(1.25-uv.y,1.);
        }

        //slice height
        else if(sliceType==4){
            float height = xyz.y;
            float percent = (height + 2.75)/(3.5+2.75);
            return percent;
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
        
         float hue = 3./2.*abs(uv.x-0.5);
         float sat = 0.8;
         vec3 base = hsb2rgb(vec3(hue,sat,0.5));
         
         if(sliceType==1){ 
            if(abs(height-slice/2.)< blackBarWidth || abs(1.-height-slice/2.)<blackBarWidth ){ 
                 base = hsb2rgb(vec3(hue,0.8,0.1));
            }
        }
        
        if(sliceType==2){ 
            if(abs(height-slice)< blackBarWidth ){ 
                 base = hsb2rgb(vec3(hue,0.8,0.1));
            }
        }
        
        if(sliceType==3){ 
            if(abs(height-slice)< blackBarWidth/2. || abs(height)<blackBarWidth/2. ){ 
                 base = hsb2rgb(vec3(hue,0.8,0.1));
            }
        }
        
        if(sliceType==4){ 
            if(abs(height-slice)< blackBarWidth ){ 
                 base = hsb2rgb(vec3(hue,0.8,0.1));
            }
        }
                  
        vec3 final = base + 2.*vec3(grid);
        return final;
    }
`


//this is where we decide which cells to throw out, etc:
const colorFn = sliceAt + chooseColor + ` 
    vec3 colorFn(vec2 uv, vec3 xyz){
   
         float height = sliceAt(uv,xyz);
         
         vec3 color = chooseColor(uv,xyz,height);

        if(sliceType==1){
              if(height < slice/2. || 1.-height < slice/2.){
                if(!stripe || cos(stripeFreq*PI*height)>0.){
                    return color;
                }
              }  
          }
          
          else{
              if(height < slice){
                if(!stripe || cos(stripeFreq*PI*height)>0.){
                    return color;
                }
              }
          }
          
         discard;

     }`;




//------------------------------------------------------------------
// JS AND GLSL PARAMETRIC EQUATIONS
// THIS IS THE ONLY PART THAT DIFFERS FROM THE OTHER KLEIN BOTTLE CLASS
//-------------------------------------------------------------------

let jsEqn = function(U,V){
    //SWITCH THE USUAL ROLE (to match the slicing functions for the other klein bottle)
    let u = V;
    let v = U;

    let x = (3.+Math.cos(u/2.)*Math.sin(v)-Math.sin(u/2.)*Math.sin(2.*v))*Math.cos(u);
    let y = Math.sin(u/2.)*Math.sin(v)+Math.cos(u/2.)*Math.sin(2.*v);
    let z = (3.+Math.cos(u/2.)*Math.sin(v)-Math.sin(u/2.)*Math.sin(2.*v))*Math.sin(u);

    return new Vector3(x,y,z);

};

let glslEqn = `
            vec3 eqn( vec2 uv ){
                //SWITCH THE USUAL ROLE (to match the slicing functions for the other klein bottle)
                float v = uv.x;
                float u = uv.y;
                
                float x=(3.+cos(u/2.)*sin(v)-sin(u/2.)*sin(2.*v))*cos(u);
                float y=sin(u/2.)*sin(v)+cos(u/2.)*sin(2.*v);
                float z=(3.+cos(u/2.)*sin(v)-sin(u/2.)*sin(2.*v))*sin(u);
                
                return vec3(x,y,z);

            }`;



//------------------------------------------------------------------
// THE ACTUAL CLASS
//-------------------------------------------------------------------

class KleinBottleFig8{
    constructor( params = defaultParams ) {

        this.params = params;

        this.range = {
            u:{min:this.params.uMin+0.0001, max: this.params.uMax},
            v:{min:this.params.vMin, max:this.params.vMax}
        };

        this.uniforms = {
            slice:{type:'float',value:this.params.slice},
            sliceRange:{type:'float', value:this.params.sliceMax-this.params.sliceMin},
            sliceType:{type:'int',value:this.params.sliceType},
            blackBarWidth: {type:'float',value:this.params.blackBarWidth},
            stripe: {type:'bool',value:this.params.stripe},
            stripeFreq: {type:'float',value:this.params.stripeFreq},
        };

        this.surface = new ParametricSurface(glslEqn,this.range,this.uniforms,colorFn,surfaceOptions);
        if(this.params.drawGlass) {
            this.glassSurface = new ParametricSurfaceCPU(jsEqn, this.range, glassOptions);
        }
    }

    addToScene(scene){
        this.surface.addToScene(scene);
        if(this.params.drawGlass) {
            this.glassSurface.addToScene(scene);
        }
    }

    addToUI(ui){

        let thisObj = this;

        if(this.params.enableUI) {

            ui.add(thisObj.params, 'sliceType', {
                '2 Mobius': 1,
                '1 Mobius': 2,
                'Sweepout': 3,
                'by Height': 4
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
            sFolder.add(thisObj.params, 'stripeFreq', 0, 100, 1).name(' Number').onChange(function (value) {
                thisObj.surface.update({stripeFreq: value})
            });
        }
    }f

    tick(time,dTime){

        this.surface.update({time:time});

        if(this.params.animate ){
            let s = (1-Math.cos(time / 3.))/2.;
            s=0.95*s+0.05;
            this.params.slice=s;
            this.surface.update({slice:s});
        }
    }
}


export default KleinBottleFig8;