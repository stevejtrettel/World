import {
    DoubleSide,
    Mesh,
    MeshPhysicalMaterial,
    PlaneBufferGeometry, Vector3,
} from "../../../3party/three/build/three.module.js";

import ParametricSurface from "../../components/parametric/ParametricSurface.js";
import ParametricSurfaceCPU from "../../components/parametric/ParametricSurfaceCPU.js";


import Item from "../Item.js";


let defaultSettings = {

    ui:{
        slice:true,
    },

    params: {
        animate: false,
        slice: 1,
        strip:1,
        cutSlice:true,
        cutStrip:true,
        xEqn: "(3.+cos(u/2.)*sin(v)-sin(u/2.)*sin(2.*v))*cos(u)",
        yEqn: "sin(u/2.)*sin(v)+cos(u/2.)*sin(2.*v)",
        zEqn: "(3.+cos(u/2.)*sin(v)-sin(u/2.)*sin(2.*v))*sin(u)",
        uMin:-3.1416,
        uMax:3.1416,
        vMin:-3.1416,
        vMax:3.1416,
    }
}



let glassOptions= {
    side: DoubleSide,
    transparent: true,
    transmission: 0.99,
    clearcoat: 1,
    ior: 1,
    envMapIntensity: 2,
    uRes:50,
    vRes:50,
};

let surfaceOptions = {
    clearcoat:1,
    roughness:0.4,
}

const surfaceColor = ` 
    vec3 colorFn(vec2 uv, vec3 xyz){
    
         float height = uv.x;
         float width = 2.*abs(uv.y-0.5);
              
         float grid1 = (1.-pow(abs(sin(10.*3.14*uv.x)*sin(10.*3.14*uv.y)),0.1))/10.;
         float grid2 = (1.-pow(abs(sin(50.*3.14*uv.x)*sin(50.*3.14*uv.y)),0.1))/25.;
         float grid3 = (1.-pow(abs(sin(100.*3.14*uv.x)*sin(100.*3.14*uv.y)),0.1))/50.;
         float grid = grid1+grid2+grid3;
         
         float hue=0.7*width;
         //uv.x+2.*uv.x*(1.-uv.x)*uv.y;
         vec3 base =  hsb2rgb(vec3(hue,0.6,0.5));
         vec3 final = base + 2.*vec3(grid);
         
         if(cutSlice && height>slice){
              discard;
         }
         
         //if you want BOTH mobius strips:
         // if(cutStrip && width>strip/2. && 1.-width>strip/2.){
          if(cutStrip && width>strip){
              discard;
         }
              
             return final;
     }`;


class KleinBottleFig8 extends Item{
    constructor( settings = defaultSettings ) {

        super(settings);

        this.range = {
            u:{min:this.params.uMin, max: this.params.uMax},
            v:{min:this.params.vMin, max:this.params.vMax}
        };

        this.uniforms = {

            slice:{type:'float',value:this.params.slice},
            strip:{type:'float',value:this.params.strip},

            cutSlice: {type:'bool',value:this.params.cutSlice},
            cutStrip: {type:'bool',value:this.params.cutStrip},

        };

        this.jsEquation = function(u,v){

            let x = (3.+Math.cos(u/2.)*Math.sin(v)-Math.sin(u/2.)*Math.sin(2.*v))*Math.cos(u);
            let y = Math.sin(u/2.)*Math.sin(v)+Math.cos(u/2.)*Math.sin(2.*v);
            let z = (3.+Math.cos(u/2.)*Math.sin(v)-Math.sin(u/2.)*Math.sin(2.*v))*Math.sin(u);

            return new Vector3(x,y,z);

        };

        this.glslEquation = `
            vec3 eqn( vec2 uv ){
                float u = uv.x;
                float v = uv.y;
                
                float x=(3.+cos(u/2.)*sin(v)-sin(u/2.)*sin(2.*v))*cos(u);
                float y=sin(u/2.)*sin(v)+cos(u/2.)*sin(2.*v);
                float z=(3.+cos(u/2.)*sin(v)-sin(u/2.)*sin(2.*v))*sin(u);
                
                return vec3(x,y,z);

            }`;


        this.surface = new ParametricSurface(this.glslEquation,this.range,this.uniforms,surfaceColor,surfaceOptions);
        this.glassSurface = new ParametricSurfaceCPU(this.jsEquation,this.range, glassOptions)
    }


    addToScene(scene){
        this.surface.addToScene(scene);
        this.glassSurface.addToScene(scene);
    }

    addToUI(ui){

        let thisObj = this;

        if(this.settings.ui.slice) {

            ui.add(thisObj.params, 'animate').name('Animate');

            ui.add(thisObj.params, 'slice', 0,1, 0.01).name('Slice').onChange(function(value){
                thisObj.surface.update({slice:value});
            });

            ui.add(thisObj.params, 'strip', 0,1, 0.01).name('Strip').onChange(function(value){
                thisObj.surface.update({strip:value});
            })
        }
    }

    tick(time,dTime){

        if(this.params.animate ){
            let s = (1+Math.sin(time / 3.))/2.;
            this.params.slice=s;
            this.surface.update({slice:s});
        }
    }
}


export default KleinBottleFig8;