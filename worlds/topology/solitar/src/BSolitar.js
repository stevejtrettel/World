
import {rotateR4} from "../../../../code/shaders/geometry/rotateR4.js";
import {projectR4} from "../../../../code/shaders/geometry/projectR4.js";
import ParametricSurface from "../../../../code/compute/parametric/ParametricSurface.js";




//------------------------------------------------------------------
// DEFAULT VALUES OF THE PARAMETERS
//-------------------------------------------------------------------

let defaultParams = {
        enableUI: true,
        animate: true,
        vMin: 0,
        vMax: 2.*3.1416,
        uMin: 0,
        uMax: 3.1416,
        stripe:false,
        stripeFreq:0,
        angle:0,
        showSurf:0.5/4.,
        p:2,
        q:3
}


let surfaceOptions = {
    clearcoat:1,
    roughness:0.4,
}




//------------------------------------------------------------------
//  COLOR / DISCARD FOR GPU PARAMETRIC SURFACE
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
         float centerDist = abs(0.5-uv.x);
         float checkerVal = sin(3.1416*stripeFreq*uv.x)*sin(2.*3.1416*stripeFreq*uv.y);
         
         if(length(xyz)>20.){
            discard;
         }
         
         if(bdyDist<0.02){
            base = hsb2rgb(vec3(hue,1.,0.1));
         }
         
         if(centerDist<0.02){
            base = hsb2rgb(vec3(hue,1.,0.1));
         }
         
         if( centerDist>showSurf && bdyDist > showSurf){
            discard;
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




//------------------------------------------------------------------
// GPU PARAMETRIC SURFACE EQUATION
//-------------------------------------------------------------------

let glslEqn = rotateR4+projectR4+`
vec3 eqn( vec2 uv ){

    float u = uv.x;
    float v = uv.y;

    float R = cos(u);
    float r = sin(u);
    
    float x = R*cos(q*v);
    float y = R*sin(q*v);
    float z = r*cos(p*v);
    float w = r*sin(p*v);
    
    vec4 pos = vec4(x,y,z,w);
    pos=rotateR4(pos,angle,2.*angle,0.);
    
    vec3 newPos = stereographicProjX(pos);
    return newPos;

}`;



//------------------------------------------------------------------
// JS CONNECTING SURFACE
//-------------------------------------------------------------------

//should add in a surface connecting the two hopf circles:
//preimage of half a line of longitude (N to S pole) under hopf map
//then rotate same as GLSL pos=rotateR4(pos,angle,2.*angle,0.);
// then stereographic same as GLSL vec3 newPos = stereographicProjX(pos);
// then parametric surface CPU


//------------------------------------------------------------------
// THE ACTUAL CLASS
//-------------------------------------------------------------------

class BSolitar {
    constructor( params = defaultParams ) {

        this.params = params;

        this.range = {
            u:{min:this.params.uMin, max: this.params.uMax},
            v:{min:this.params.vMin, max:this.params.vMax}
        };

        this.uniforms = {
            twist: {type:'float',value:this.params.twist},
            angle: {type:'float',value:this.params.angle},
            stripe: {type:'bool',value:this.params.stripe},
            stripeFreq: {type:'float',value:this.params.stripeFreq},
            p: {type:'float',value:this.params.p},
            q: {type:'float',value:this.params.q},
            showSurf:{type:'float',value:this.params.showSurf}
        };

        this.surface = new ParametricSurface(glslEqn,this.range,this.uniforms,colorFn,surfaceOptions);

    }

    addToScene(scene){
        this.surface.addToScene(scene);

    }

    addToUI(ui){

        let thisObj = this;

        if(this.params.enableUI) {

            ui.add(thisObj.params, 'animate').name('Animate');

            ui.add(thisObj.params,'angle',0,6.29,0.01).name('Rotation').onChange(function(value){
                thisObj.surface.update({angle:value});
            });

            // ui.add(thisObj.params, 'stripeFreq', 0, 100, 1).name(' Checkers').onChange(function (value) {
            //     thisObj.surface.update({stripeFreq: value})
            // });

            ui.add(thisObj.params, 'p', 0, 10, 1).name(' P').onChange(function (value) {
                thisObj.surface.update({p: value})
            });

            ui.add(thisObj.params, 'q', 0, 10, 1).name(' Q').onChange(function (value) {
                thisObj.surface.update({q: value})
            });

            ui.add(thisObj.params, 'showSurf', 0, 1, 0.01).name('Visibility').onChange(function (value) {
                thisObj.surface.update({showSurf: value/4.})
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


export default BSolitar;
