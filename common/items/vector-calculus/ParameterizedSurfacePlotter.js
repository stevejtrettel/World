import {
    MeshPhysicalMaterial,
    DoubleSide,
} from "../../../3party/three/build/three.module.js";


import DomainPlot from "../../components/vector-calculus/DomainPlot.js";
import ParametricSurface from "../../components/parametric/ParametricSurface.js";



let surfaceOptions = {
    clearcoat:1,
    roughness:0.4,
}


class ParameterizedSurfacePlotter{
    constructor() {

        this.params = {
            uMin:0,
            uMax:6.29,
            vMin:0,
            vMax:6.29,
            animate:true,
            slice: 0,
            xEqn: "(1.25 *(1.-v/(2.*3.14159))*cos(2.*v)*(1.+cos(u))+cos(2.*v))",
            yEqn: "(10.*v/(2.*3.14159)+(1.-v/(2.*3.14159))*sin(u))-5.",
            zEqn: "-(1.25 *(1.-v/(2.*3.14159))*sin(2.*v)*(1.+cos(u))+sin(2.*v))",
            a:0,
            b:0,
            c:0,
        }

        this.range = {
            u:{min:this.params.uMin, max:this.params.uMax},
            v:{min:this.params.vMin, max:this.params.vMax}
        };

        this.uniforms = {
            slice:{type:'float',value:this.params.slice},
            a:{type:'float',value:this.params.a},
            b:{type:'float',value:this.params.b},
            c:{type:'float',value:this.params.c},
        };

        this.domainColor = `
             vec3 colorFn(vec2 uv){
             
             float grid1 = (1.-pow(abs(sin(10.*3.14*uv.x)*sin(10.*3.14*uv.y)),0.1))/10.;
             float grid2 = (1.-pow(abs(sin(50.*3.14*uv.x)*sin(50.*3.14*uv.y)),0.1))/25.;
             float grid3 = (1.-pow(abs(sin(100.*3.14*uv.x)*sin(100.*3.14*uv.y)),0.1))/50.;
             float grid = grid1+grid2+grid3;
             
             vec3 base =  0.6 + 0.4*cos(2.*3.14*uv.xyx+vec3(0,2,4));
             
             return base + 2.*vec3(grid);
            }
        `;

        this.surfaceColor= `
              vec3 colorFn(vec2 uv, vec3 xyz){
             
             float grid1 = (1.-pow(abs(sin(10.*3.14*uv.x)*sin(10.*3.14*uv.y)),0.1))/10.;
             float grid2 = (1.-pow(abs(sin(50.*3.14*uv.x)*sin(50.*3.14*uv.y)),0.1))/25.;
             float grid3 = (1.-pow(abs(sin(100.*3.14*uv.x)*sin(100.*3.14*uv.y)),0.1))/50.;
             float grid = grid1+grid2+grid3;
             
             vec3 base =  0.6 + 0.4*cos(2.*3.14*uv.xyx+vec3(0,2,4));
             
             return base + 2.*vec3(grid);
            }
        `;

        this.surface = new ParametricSurface(this.buildEquation(),this.range,this.uniforms,this.surfaceColor,surfaceOptions);

        this.domainPlot = new DomainPlot(this.params.eqn,this.range,this.uniforms,this.domainColor);
        this.domainPlot.setPosition(0,-10,0);

    }

    buildEquation(){

        return `vec3 eqn( vec2 uv ){
        
            float u = uv.x;
            float v = uv.y;
            
            float x = ${this.params.xEqn};
            float y = ${this.params.yEqn};
            float z = ${this.params.zEqn};
           
            vec3 start = vec3(u,0,v);
            vec3 end = vec3(x,y,z);
           
            return end;
            
       }`;
    }


    setSlice(slice){

        this.params.slice=slice;

        //update uniforms to highlight the slice:
        this.domainPlot.update({slice:slice});
        this.surface.update({slice:slice});
    }


    addToScene(scene){

        this.surface.addToScene(scene);
        this.domainPlot.addToScene(scene);

    }

    addToUI(ui){

        let thisObj = this;

        ui.add(thisObj.params,'xEqn').name('x(u,v)=').onFinishChange(function(val){
            thisObj.params.xEqn = val;
            let newEqn = thisObj.buildEquation();
            thisObj.surface.setFunction(newEqn);
        });

        ui.add(thisObj.params,'yEqn').name('y(u,v)=').onFinishChange(function(val){
            thisObj.params.yEqn = val;
            let newEqn = thisObj.buildEquation();
            thisObj.surface.setFunction(newEqn);
        });

        ui.add(thisObj.params,'zEqn').name('z(u,v)=').onFinishChange(function(val){
            thisObj.params.zEqn = val
            let newEqn = thisObj.buildEquation();
            thisObj.surface.setFunction(newEqn);
        });

        let dFolder = ui.addFolder('Domain');

        dFolder.add(thisObj.params, 'uMin',-10,10,0.01).onChange(function(val){
            thisObj.range.u.min=val;
            thisObj.surface.setDomain(thisObj.range);
            thisObj.domainPlot.setDomain(thisObj.range);
        });
        dFolder.add(thisObj.params, 'uMax',-10,10,0.01).onChange(function(val){
            thisObj.range.u.max=val;
            thisObj.surface.setDomain(thisObj.range);
            thisObj.domainPlot.setDomain(thisObj.range);
        });
        dFolder.add(thisObj.params, 'vMin',-10,10,0.01).onChange(function(val){
            thisObj.range.v.min=val;
            thisObj.surface.setDomain(thisObj.range);
            thisObj.domainPlot.setDomain(thisObj.range);
        });
        dFolder.add(thisObj.params, 'vMax',-10,10,0.01).onChange(function(val){
            thisObj.range.v.max=val;
            thisObj.surface.setDomain(thisObj.range);
            thisObj.domainPlot.setDomain(thisObj.range);
        });


        let pFolder = ui.addFolder('Parameters');

        pFolder.add(thisObj.params, 'a',-1,1,0.01).onChange(function(val){
            thisObj.surface.update({a:val});
        });
        pFolder.add(thisObj.params, 'b',-1,1,0.01).onChange(function(val){
            thisObj.surface.update({b:val});
        });
        pFolder.add(thisObj.params, 'c',-1,1,0.01).onChange(function(val){
            thisObj.surface.update({c:val});
        });

        let hFolder = ui.addFolder('Homotopy');

        hFolder.add(thisObj.params, 'animate').name('Animate');

        ui.add(thisObj.params, 'slice',-5,5,0.01).name('Slice').onChange(function(val){
            thisObj.setSlice(val);
        });



    }

    tick(time,dTime){
        if(this.params.animate ){
            let val = 5. * Math.sin(time / 3.);
            this.setSlice(val);
        }
    }
}




let ex = new ParameterizedSurfacePlotter();

export default {ex};