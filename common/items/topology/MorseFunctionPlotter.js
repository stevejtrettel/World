import {
    DoubleSide,
    Mesh,
    MeshPhysicalMaterial,
    PlaneBufferGeometry,
} from "../../../3party/three/build/three.module.js";

import ParametricSurface from "../../components/parametric/ParametricSurface.js";



//------------------------------------------------------------------
// DEFAULT VALUES OF THE PARAMETERS
//-------------------------------------------------------------------




let defaultSettings = {

    ui:{
        eqns:false,
        domain:false,
        params:false,
        slice:true,
        discardOption:false,
    },

    scene:{
        slice:false,
    },

    config:{
        functionGraph:false,
        landscapeColor:false,
    }
}


let defaultParams =  {
    animate: false,
        mobius:false,
        slice: 1.5,
        discardTop:true,
        xEqn: "1.5*(2.+cos(v))*cos(u)",
        yEqn: "1.5*(2.+cos(v))*sin(u)",
        zEqn: "1.5*sin(v)",
        uMin:0.,
        uMax:6.29,
        vMin:-3.14,
        vMax:3.14,
        sliceMin:-5,
        sliceMax:5.,
        sliceWidth:0.01,
        a:0,
    //b:0,
    //c:0,
}

// // OTHER OPTIONS FOR DEFAULT SURFACES
//boys surface
// xEqn: "sqrt(2.)*(cos(v)*cos(v)*cos(2.*u)+cos(u)*sin(2.*v))/(2.-sqrt(2.)*sin(3.*u)*sin(2.*v))",
//     yEqn: "(3.*cos(v)*cos(v))/(2.-sqrt(2.)*sin(3.*u)*sin(2.*v))-1.5",
//     zEqn: "sqrt(2.)*(cos(v)*cos(v)*sin(2.*u)-sin(u)*sin(2.*v))/(2.-sqrt(2.)*sin(3.*u)*sin(2.*v))",

//torus
// xEqn: "1.5*(2.+cos(v))*cos(u)",
//     yEqn: "1.5*(2.+cos(v))*sin(u)",
//     zEqn: "1.5*sin(v)",




let planeMaterial=new MeshPhysicalMaterial({
    side:DoubleSide,
    transparent:true,
    transmission:0.95,
    clearcoat:1,
    ior:1,
});

let surfaceOptions = {
    clearcoat:1,
    roughness:0.4,
    envMapIntensity:3,
}







//------------------------------------------------------------------
// COLOR / DISCARD FUNCTIONS FOR PARAMETRIC SURFACE GPU
//-------------------------------------------------------------------


const landscapeColor = `
            vec3 colorFn(vec2 uv, vec3 xyz){
            
                float height = xyz.y;
            
                 float grid1 = (1.-pow(abs(sin(3.14*height)),0.1))/10.;
                 float grid2 = (1.-pow(abs(sin(3.*3.14*height)),0.1))/25.;
                 float grid3 = (1.-pow(abs(sin(9.*3.14*height)),0.1))/50.;
                 float grid = grid1+grid2+grid3;
            
           
              if(abs(height-slice)< sliceWidth){
                    return vec3(0.8,0.8,0);
              }
              else if(height-slice<0.){
                return vec3(0.03,0.03,0.1)+vec3(grid);
              }
              if(discardTop){
                discard;
              }
              return vec3(0.03,0.1,0.03)+vec3(grid);
            }
`;




//------------------------------------------------------------------
// THE ACTUAL CLASS
//-------------------------------------------------------------------

class MorseFunctionPlotter{
    constructor( params = defaultParams, settings=defaultSettings ) {

        this.settings = settings;
        this.params = params;

        this.range = {
            u:{min:this.params.uMin, max:this.params.uMax},
            v:{min:this.params.vMin, max:this.params.vMax}
        };

        this.uniforms = {
            sliceRange:{type:'float', value:this.params.sliceMax-this.params.sliceMin},
            slice:{type:'float',value:this.params.slice},
            sliceWidth: {type:'float',value:this.params.sliceWidth},
            discardTop:{type:'bool',value:this.params.discardTop},
        };

        if("a" in this.params){
            this.uniforms.a={type:'float', value:this.params.a};
        }
        if("b" in this.params){
            this.uniforms.a={type:'float', value:this.params.b};
        }
        if("c" in this.params){
            this.uniforms.a={type:'float', value:this.params.c};
        }

        this.surfaceColor=landscapeColor;
        if(this.settings.config.landscapeColor){
            this.surfaceColor=landscapeColor;
        }

        this.surface = new ParametricSurface(this.buildEquation(),this.range,this.uniforms,this.surfaceColor,surfaceOptions);

        if(this.settings.scene.slice) {
            //making the apparatus for showing the slicing:
            let planeGeometry = new PlaneBufferGeometry(20, 20);

            this.slicePlane = new Mesh(planeGeometry, planeMaterial);
            this.slicePlane.rotateX(Math.PI / 2);
            this.slicePlane.position.set(0,params.slice,0);

        }



    }

    buildEquation(){

        return `vec3 eqn( vec2 uv ){
            float u = uv.x;
            float v = uv.y;
            
            float x = ${this.params.xEqn};
            float y = ${this.params.yEqn};
            float z = ${this.params.zEqn};
            
            return vec3(x,y,z);
       }`;
    }

    setSlice(slice){
        this.params.slice=slice;
        this.surface.update({slice:slice});
        if(this.settings.scene.slice){
            this.slicePlane.position.set(0,slice,0);
        }
    }


    addToScene(scene){
        this.surface.addToScene(scene);
        if(this.settings.scene.slice) {
            scene.add(this.slicePlane);
        }
    }

    addToUI(ui){

        let thisObj = this;

        if(this.settings.ui.eqns) {

            if(!this.settings.config.functionGraph) {

                ui.add(thisObj.params, 'xEqn').name('x(u,v)=').onFinishChange(function (val) {
                    thisObj.params.xEqn = val;
                    let newEqn = thisObj.buildEquation();
                    thisObj.surface.setFunction(newEqn);
                });

                ui.add(thisObj.params, 'zEqn').name('y(u,v)=').onFinishChange(function (val) {
                    thisObj.params.zEqn = val;
                    let newEqn = thisObj.buildEquation();
                    thisObj.surface.setFunction(newEqn);
                });



            }

            ui.add(thisObj.params, 'yEqn').name('z(u,v)=').onFinishChange(function (val) {
                thisObj.params.yEqn = val;
                let newEqn = thisObj.buildEquation();
                thisObj.surface.setFunction(newEqn);
            });

        }


        if(this.settings.ui.domain) {

            let dFolder = ui.addFolder('Domain');

            dFolder.add(thisObj.params, 'uMin', -10, 10, 0.01).onChange(function (val) {
                thisObj.range.u.min = val;
                thisObj.surface.setDomain(thisObj.range);
            });
            dFolder.add(thisObj.params, 'uMax', -10, 10, 0.01).onChange(function (val) {
                thisObj.range.u.max = val;
                thisObj.surface.setDomain(thisObj.range);
            });
            dFolder.add(thisObj.params, 'vMin', -10, 10, 0.01).onChange(function (val) {
                thisObj.range.v.min = val;
                thisObj.surface.setDomain(thisObj.range);
            });
            dFolder.add(thisObj.params, 'vMax', -10, 10, 0.01).onChange(function (val) {
                thisObj.range.v.max = val;
                thisObj.surface.setDomain(thisObj.range);
            });
        }

        if(this.settings.ui.params) {
            let pFolder = ui.addFolder('Parameters');
            if("a" in this.params) {
                pFolder.add(thisObj.params, 'a', -1, 1, 0.01).onChange(function (val) {
                    thisObj.surface.update({a: val});
                });
            }
            if("b" in this.params) {
                pFolder.add(thisObj.params, 'b', -1, 1, 0.01).onChange(function (val) {
                    thisObj.surface.update({b: val});
                });
            }
            if("c" in this.params) {
                pFolder.add(thisObj.params, 'c', -1, 1, 0.01).onChange(function (val) {
                    thisObj.surface.update({c: val});
                });
            }
        }


        if(this.settings.ui.slice) {

            ui.add(thisObj.params,'mobius').name('Mobius Strip').onChange(
                function(val){
                    if(val){
                        thisObj.range.v.min=-3.14/2.;
                        thisObj.range.v.max=3.14/2.;
                        thisObj.surface.setDomain(thisObj.range);
                    }
                    else{
                        thisObj.range.v.min=-3.14;
                        thisObj.range.v.max=3.14;
                        thisObj.surface.setDomain(thisObj.range);
                    }
                }
            )

            ui.add(thisObj.params, 'animate').name('Animate');

            ui.add(thisObj.params, 'slice', thisObj.params.sliceMin, thisObj.params.sliceMax, 0.01).name('Slice').onChange(function (val) {
                thisObj.setSlice(val);
            });



            if(this.settings.ui.discardOption) {
                ui.add(thisObj.params, 'discardTop').onChange(function (val) {
                    thisObj.surface.update({discardTop: val});
                });
            }
        }

    }

    tick(time,dTime){

        if(this.params.animate ){

            let s = (1+Math.sin(time / 3.))/2.;
            let val = this.params.sliceMin + (this.params.sliceMax-this.params.sliceMin)*s
            this.setSlice(val);
        }
    }
}


export default MorseFunctionPlotter;