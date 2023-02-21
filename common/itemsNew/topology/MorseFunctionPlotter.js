import {
    DoubleSide,
    Mesh,
    MeshPhysicalMaterial,
    PlaneBufferGeometry,
} from "../../../3party/three/build/three.module.js";

import ParametricSurface from "../../components/parametric/ParametricSurface.js";

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
    },

    params: {
        animate: false,
        mobius:false,
        slice: 1,
        discardTop:true,
        xEqn: "(3.+a+cos(u/2.)*sin(v)-sin(u/2.)*sin(2.*v))*cos(u)",
        yEqn: "sin(u/2.)*sin(v)+cos(u/2.)*sin(2.*v)",
        zEqn: "(3.+a+cos(u/2.)*sin(v)-sin(u/2.)*sin(2.*v))*sin(u)",
        uMin:0.,
        uMax:6.29,
        vMin:-3.14/2,
        vMax:3.14/2,
        sliceMin:0,
        sliceMax:1.,
        sliceWidth:0.01,
        a:0,
        //b:0,
        //c:0,
    }
}

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
}


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

const defaultColor = ` vec3 colorFn(vec2 uv, vec3 xyz){
                float height = uv.x;
                
                
             float grid1 = (1.-pow(abs(sin(10.*3.14*uv.x)*sin(10.*3.14*uv.y)),0.1))/10.;
             float grid2 = (1.-pow(abs(sin(50.*3.14*uv.x)*sin(50.*3.14*uv.y)),0.1))/25.;
             float grid3 = (1.-pow(abs(sin(100.*3.14*uv.x)*sin(100.*3.14*uv.y)),0.1))/50.;
             float grid = grid1+grid2+grid3;
             
             vec3 base =  hsb2rgb(vec3(uv.x+2.*uv.x*(1.-uv.x)*uv.y,0.5,0.5));
             vec3 final = base + 2.*vec3(grid);
             
             
                          if(discardTop && height>slice){
                       discard;
             }
             
             return final;
             
             

                
        //              float grid1 = (1.-pow(abs(sin(3.14*height)),0.1))/10.;
        //              float grid2 = (1.-pow(abs(sin(3.*3.14*height)),0.1))/25.;
        //              float grid3 = (1.-pow(abs(sin(9.*3.14*height)),0.1))/50.;
        //              float grid = grid1+grid2+grid3;
        //        
        //           // if(abs(height-slice)< sliceWidth){
        //           //       return vec3(0);
        //           // }
        //          
        //           if(discardTop && height>slice){
        //                 discard;
        //            }
        //  vec3 colorCoords = vec3(2.*uv.x,uv.y,2.*uv.x);
        //  return 0.6 + 0.4*cos(2.*3.14*colorCoords+vec3(0,1,4))+5.*vec3(grid);
        // //
        //    // return hsb2rgb(vec3(1.3*height/sliceRange,0.6,0.5))+vec3(grid);
        //          
            }`;


class MorseFunctionPlotter{
    constructor( settings = defaultSettings ) {

        this.settings = settings;

        this.params = this.settings.params;

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

        this.surfaceColor=defaultColor;
        if(this.settings.config.landscapeColor){
            this.surfaceColor=landscapeColor;
        }

        this.surface = new ParametricSurface(this.buildEquation(),this.range,this.uniforms,this.surfaceColor,surfaceOptions);

        if(this.settings.scene.slice) {
            //making the apparatus for showing the slicing:
            let planeGeometry = new PlaneBufferGeometry(20, 20);

            this.slicePlane = new Mesh(planeGeometry, planeMaterial);
            this.slicePlane.rotateX(Math.PI / 2);

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