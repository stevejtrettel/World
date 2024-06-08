
import {rotateR4} from "../../shaders/geometry/rotateR4.js";
import {projectR4} from "../../shaders/geometry/projectR4.js";

import ParametricSurface from "../../compute/parametric/ParametricSurface.js";




//------------------------------------------------------------------
// DEFAULT VALUES OF THE PARAMETERS
//-------------------------------------------------------------------


let defaultParams = {
        animate: true,
        vMin:0,
        vMax:2.*3.1416,
        uMin:-3.1416/4.,
        uMax:3.1416/4.,
        stripeFreq:0,
        angle:0,
        twist:1,
}


let surfaceOptions = {
    clearcoat:1,
    roughness:0.4,
    envMapIntensity: 2,
}






//------------------------------------------------------------------
// SETUP FOR PARAMETRIC SURFACE GPU
//-------------------------------------------------------------------


const coordGrid = `
float coordGrid(vec2 uv, float scale){
    float spacing = 3.1416*scale;
    float grid1 = (1.-pow(abs(sin(spacing*uv.x)*sin(10.*3.14*uv.y)),0.1))/10.;
    float grid2 = (1.-pow(abs(sin(5.*spacing*uv.x)*sin(50.*3.14*uv.y)),0.1))/25.;
    float grid3 = (1.-pow(abs(sin(10.*spacing *uv.x)*sin(100.*3.14*uv.y)),0.1))/50.;
    return grid1+grid2+grid3;
}`

const coordStripe=   `
float coordStripe(vec2 uv, vec3 xyz){
    return uv.x;
}`

//this is where we decide which cells to throw out, etc:
const colorFn = coordGrid + coordStripe + ` 
    vec3 colorFn(vec2 uv, vec3 xyz){
  
         float grid=coordGrid(uv, 10.);
        
         float hue = 1./2.*abs(uv.x-0.5);
         float sat = 0.8;
         vec3 base = hsb2rgb(vec3(hue,sat,0.5));
         
         float bdyDist = min(abs(uv.x),abs(1.-uv.x));
         float checkerVal = sin(3.1416*stripeFreq*uv.x)*sin(2.*3.1416*stripeFreq*uv.y);
         
         if(length(xyz)>20.){
            discard;
         }
         
         if(bdyDist<0.02){
            base = hsb2rgb(vec3(hue,1.,0.1));
         }
         
         if( stripeFreq>0. && abs(checkerVal)<0.05 && bdyDist>0.02){
            base = hsb2rgb(vec3(hue,1.,0.3));
         }
                  
         if(checkerVal<-0.02 && bdyDist>0.02){
            discard;
         }

         vec3 color = base + 2.*vec3(grid);
         return color;

     }`;


let glslEqn = rotateR4+projectR4+`
vec3 eqn( vec2 uv ){

    float u = uv.x;
    float v = uv.y;
    
    if(twist==1.){
        u *= 2.;
    }
    
    float tau = twist/2.;

    float x = cos(u)*cos(v);
    float y = cos(u)*sin(v);
    float z = sin(u)*cos(tau*v);
    float w = sin(u)*sin(tau*v);
    
    vec4 p = vec4(x,y,z,w);
    p=rotateR4(p,angle,2.*angle,0.);
    
    vec3 q = stereographicProjX(p);
    return q;

}`;










//------------------------------------------------------------------
// THE CLASS ITSELF
//-------------------------------------------------------------------

class SudaneseMobius{
    constructor( params = defaultParams ) {

        this.params = params;

        this.range = {
            u:{min:this.params.uMin, max: this.params.uMax},
            v:{min:this.params.vMin, max:this.params.vMax}
        };
        this.bdyRange = {min:0, max:6.29};

        this.uniforms = {
            twist: {type:'float',value:this.params.twist},
            angle: {type:'float',value:this.params.angle},
            stripeFreq: {type:'float',value:this.params.stripeFreq},
        };

        this.surface = new ParametricSurface(glslEqn,this.range,this.uniforms,colorFn,surfaceOptions);
    }

    addToScene(scene){
        this.surface.addToScene(scene);
    }

    addToUI(ui){

        let thisObj = this;

        if(this.params.animate) {

            ui.add(thisObj.params, 'animate').name('Animate');

            ui.add(thisObj.params,'angle',0,6.29,0.01).name('Rotation').onChange(function(value){
                thisObj.surface.update({angle:value});
            });

            ui.add(thisObj.params,'twist',{'1/2':1.,'3/2':3.,'5/2':5,'7/2':7}).name('Twists').onChange(function(value){
                thisObj.surface.update({twist:value});
            });

            ui.add(thisObj.params, 'stripeFreq', 0, 100, 1).name(' Checkers').onChange(function (value) {
                thisObj.surface.update({stripeFreq: value})
            });


        }
    }

    tick(time,dTime){

        this.surface.update({time:time});

        if(this.params.animate ){
            this.surface.update({angle:time/10.});
        }
    }
}


export default SudaneseMobius;
