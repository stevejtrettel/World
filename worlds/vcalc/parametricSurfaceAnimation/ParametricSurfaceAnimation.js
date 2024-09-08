import {
    MeshPhysicalMaterial,
    DoubleSide,
} from "../../../3party/three/build/three.module.js";


import DomainPlot from "../../../code/items/vector-calculus/DomainPlot.js";
import ParametricSurface from "../../../code/compute/parametric/ParametricSurface.js";


let surfaceOptions = {
    clearcoat:1,
    roughness:0.4,
}


const defaultSetup = {
    showPos:true,
    animate:true,
    xEqn: "(2.+sin(v))*cos(u)",
    yEqn: "v",
    zEqn: "(2.+sin(v))*sin(u)",
    range: {
        u: {min: 0, max: 6.29 },
        v: {min:-6.75, max:3.75}
    },
}

class ParametricSurfaceAnimation {
    constructor(renderer, setup = defaultSetup) {

        this.renderer = renderer;
        this.range = setup.range;

        this.params = {
            uMin:this.range.u.min,
            uMax:this.range.u.max,
            vMin:this.range.v.min,
            vMax:this.range.v.max,
            showPos:setup.showPos,
            uPos:0.5,
            vPos:0.5,
            animate:setup.animate,
            xEqn: "(2.+sin(v))*cos(u)",
            yEqn: "v",
            zEqn: "(2.+sin(v))*sin(u)",
            a:0,
            b:0,
            c:0,
        }

        this.uniforms = {
            showPos:{type:'bool',value:this.params.showPos},
            uPos:{type:'float', value:this.params.uPos},
            vPos:{type:'float', value:this.params.vPos},
            a:{type:'float',value:this.params.a},
            b:{type:'float',value:this.params.b},
            c:{type:'float',value:this.params.c},
        };


        let colorFnText = `
        
         float grid1 = (1.-pow(abs(sin(10.*3.14*uv.x)*sin(10.*3.14*uv.y)),0.1))/10.;
             float grid2 = (1.-pow(abs(sin(50.*3.14*uv.x)*sin(50.*3.14*uv.y)),0.1))/25.;
             float grid3 = (1.-pow(abs(sin(100.*3.14*uv.x)*sin(100.*3.14*uv.y)),0.1))/50.;
             float grid = grid1+grid2+grid3;
             
             vec3 base =  0.6 + 0.4*cos(2.*3.14*uv.xyx+vec3(0,2,4));
             vec3 final = base + 2.*vec3(grid);
             
             
             if(showPos){
                if(abs(uv.x-uPos)<0.01){
                    final=vec3(0.7,0.05,0.1);
                }
                if(abs(uv.y-vPos)<0.01){
                    final=vec3(0.1,0.05,0.7);
                }
                if(length(uv-vec2(uPos,vPos))<0.02){
                    final=vec3(0);
                }
             }
             
             return final;
        
        `;

        this.domainColor = `
           vec3 colorFn(vec2 uv){
             ${colorFnText}
           }
        `;

        this.surfaceColor= `
           vec3 colorFn(vec2 uv, vec3 xyz){
             ${colorFnText}
           }
        `;

        this.surface = new ParametricSurface(this.buildEquation(),this.range,this.uniforms,this.surfaceColor,surfaceOptions);

        this.domainPlot = new DomainPlot(this.renderer,this.params.eqn,this.range,this.uniforms,this.domainColor);
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


        // RENAMING Y AND Z BECAUSE VECTOR CALC

        ui.add(thisObj.params,'zEqn').name('y(u,v)=').onFinishChange(function(val){
            thisObj.params.zEqn = val
            let newEqn = thisObj.buildEquation();
            thisObj.surface.setFunction(newEqn);
        });

        ui.add(thisObj.params,'yEqn').name('z(u,v)=').onFinishChange(function(val){
            thisObj.params.yEqn = val;
            let newEqn = thisObj.buildEquation();
            thisObj.surface.setFunction(newEqn);
        });

        let posFolder = ui.addFolder('Position');
        posFolder.add(thisObj.params,'showPos').name('Position Marker').onChange(function(val){
            thisObj.params.showPos=val;
            thisObj.surface.update({showPos:val});
            thisObj.domainPlot.update({showPos:val});
        });
        posFolder.add(thisObj.params, 'uPos',0,1,0.01).name("u").onChange(function(val){
            thisObj.params.uPos=val;
            thisObj.surface.update({uPos:val});
            thisObj.domainPlot.update({uPos:val});
        });
        posFolder.add(thisObj.params, 'vPos',0,1,0.01).name("v").onChange(function(val){
            thisObj.params.vPos=val;
            thisObj.surface.update({vPos:val});
            thisObj.domainPlot.update({vPos:val});
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


        ui.add(thisObj.params, 'animate');

    }

    tick(time,dTime){
        if(this.params.animate ){
            this.params.uPos = (Math.sin(time)+1)/2.;
            this.params.vPos = (Math.sin(time/3)+1)/2.;
            this.surface.update({uPos:this.params.uPos, vPos:this.params.vPos});
            this.domainPlot.update({uPos:this.params.uPos, vPos:this.params.vPos});
        }
    }
}



export default ParametricSurfaceAnimation;
