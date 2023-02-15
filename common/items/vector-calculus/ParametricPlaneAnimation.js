
import {Vector3,Color} from "../../../3party/three/build/three.module.js";

import Vector from "../../components/basic-shapes/Vector.js";
import ParametricSurface from "../../components/parametric/ParametricSurface.js";
import DomainPlot from "../../components/vector-calculus/DomainPlot.js";

let surfaceOptions = {
    clearcoat:1,
    roughness:0.4,
}

//using GLOBAL object math.parser: this is from the 3rd party math file loaded in the html
const parser = math.parser();


class ParametricPlaneAnimation{
    constructor() {

        this.params = {
            ux:1,
            uy:0.5,
            uz:0.25,
            vx:0.5,
            vy:1,
            vz:-0.25,
            px:1,
            py:1,
            pz:1,
            uPos:0.5,
            vPos:0.5,
            showPos:true,
            animate:true,
        }

        this.range = {
            u:{min:-5,max:5},
            v:{min:-5,max:5},
        };

        this.uniforms = {
            ux:{type:'float',value:this.params.ux},
            uy:{type:'float',value:this.params.uy},
            uz:{type:'float',value:this.params.uz},
            vx:{type:'float',value:this.params.vx},
            vy:{type:'float',value:this.params.vy},
            vz:{type:'float',value:this.params.vz},
            px:{type:'float',value:this.params.px},
            py:{type:'float',value:this.params.py},
            pz:{type:'float',value:this.params.pz},
            uPos:{type:'float',value:this.params.uPos},
            vPos: {type:'float',value:this.params.vPos},
            showPos:{type:'bool',value:this.params.showPos},
        };

        let colorFnText = `
       
            float grid1 = (1.-pow(abs(sin(10.*3.14*uv.x)*sin(10.*3.14*uv.y)),0.1))/10.;
             float grid2 = (1.-pow(abs(sin(50.*3.14*uv.x)*sin(50.*3.14*uv.y)),0.1))/25.;
             float grid3 = (1.-pow(abs(sin(100.*3.14*uv.x)*sin(100.*3.14*uv.y)),0.1))/50.;
             float grid = grid1+grid2+grid3;
             
             vec3 base =  0.6 + 0.4*cos(2.*3.14*uv.xyx+vec3(0,2,4));
             vec3 final = base + 2.*vec3(grid);
             
             if(abs(uv.x-0.5)<0.002||abs(uv.y-0.5)<0.002){
                final = vec3(0);
             }
             
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

        this.planeColor= `
           vec3 colorFn(vec2 uv, vec3 xyz){
             ${colorFnText}
           }
        `;

        this.buildJSEquation();

        this.plane = new ParametricSurface(this.buildGLSLEquation(),this.range,this.uniforms,this.planeColor,surfaceOptions);

        this.domainPlot = new DomainPlot(this.params.eqn,this.range,this.uniforms,this.domainColor);
        this.domainPlot.setPosition(0,-10,0);


        this.u = new Vector(new Vector3(this.params.ux,this.params.uz, this.params.uy),new Color(0.1,0.05,0.7));
        this.v = new Vector(new Vector3(this.params.vx,this.params.vz, this.params.vy),new Color(0.7,0.05,0.1));
        this.u.setPos(new Vector3(this.params.px, this.params.py,this.params.pz));
        this.v.setPos(new Vector3(this.params.px, this.params.py,this.params.pz));
    }


    buildGLSLEquation(){

        return `vec3 eqn( vec2 uv ){
            vec3 u = vec3(ux,uy,uz);
            vec3 v = vec3 (vx,vy,vz);
            vec3 p = vec3 (px,py,pz);
            
            return p+uv.x*u+uv.y*v;
       }`;
    }

    //build a javascript analog of what is happening above
    buildJSEquation(){

        let xC = parser.evaluate('xEqn(u,v,ux,vx,px)=px+ux*u+vx*v');
        let yC = parser.evaluate('yEqn(u,v,uy,vy,py)=py+uy*u+vy*v');
        let zC = parser.evaluate('zEqn(u,v,uz,vz,pz)=pz+uz*u+vz*v');

        this.eqn = function(u,v, params={ux:1,uy:0,uz:0,vx:0,vy:1,vz:0,px:1,py:1,pz:1}){
            let x = xC(u,v,params.ux, params.vx,params.px);
            let y = yC(u,v,params.ux, params.vx,params.px);
            let z = zC(u,v,params.ux, params.vx,params.px);
            return new Vector3(x,y,z);
        }
    }


    addToScene(scene){
        this.plane.addToScene(scene);
        this.domainPlot.addToScene(scene);
        this.u.addToScene(scene);
        this.v.addToScene(scene);

    }


    addToUI(ui){

        let thisObj=this;

        //SWITCH Y AND Z SO THINGS LOOK MORE NORMAL TO CALC3 STUDENTS:

        let pFolder = ui.addFolder('Point p');
        pFolder.add(thisObj.params, 'px',-2,2,0.01).name("Px").onChange(function(val){
            thisObj.params.px=val;
            thisObj.plane.update({px:val});
            thisObj.u.setPos(new Vector3(thisObj.params.px, thisObj.params.py, thisObj.params.pz));
            thisObj.v.setPos(new Vector3(thisObj.params.px, thisObj.params.py, thisObj.params.pz));
        });
        pFolder.add(thisObj.params, 'pz',-2,2,0.01).name("Py").onChange(function(val){
            thisObj.params.pz=val;
            thisObj.plane.update({pz:val});
            thisObj.u.setPos(new Vector3(thisObj.params.px, thisObj.params.py, thisObj.params.pz));
            thisObj.v.setPos(new Vector3(thisObj.params.px, thisObj.params.py, thisObj.params.pz));
        });
        pFolder.add(thisObj.params, 'py',-2,2,0.01).name("Pz").onChange(function(val){
            thisObj.params.py=val;
            thisObj.plane.update({py:val});
            thisObj.u.setPos(new Vector3(thisObj.params.px, thisObj.params.py, thisObj.params.pz));
            thisObj.v.setPos(new Vector3(thisObj.params.px, thisObj.params.py, thisObj.params.pz));
        });

        let uFolder = ui.addFolder('Vector u');
        uFolder.add(thisObj.params, 'ux',-2,2,0.01).name("Ux").onChange(function(val){
            thisObj.plane.update({ux:val});
            thisObj.u.setDir(new Vector3(thisObj.params.ux, thisObj.params.uz, thisObj.params.uy));
        });
        uFolder.add(thisObj.params, 'uz',-2,2,0.01).name("Uy").onChange(function(val){
            thisObj.params.uz=val;
            thisObj.plane.update({uz:val});
            thisObj.u.setDir(new Vector3(thisObj.params.ux, thisObj.params.uy, thisObj.params.uz));
        });
        uFolder.add(thisObj.params, 'uy',-2,2,0.01).name("Uz").onChange(function(val){
            thisObj.params.uy=val;
            thisObj.plane.update({uy:val});
            thisObj.u.setDir(new Vector3(thisObj.params.ux, thisObj.params.uy, thisObj.params.uz));
        });

        let vFolder = ui.addFolder('Vector v');
        vFolder.add(thisObj.params, 'vx',-2,2,0.01).name("Vx").onChange(function(val){
            thisObj.params.vx=val;
            thisObj.plane.update({vx:val});
            thisObj.v.setDir(new Vector3(thisObj.params.vx, thisObj.params.vy, thisObj.params.vz));
        });
        vFolder.add(thisObj.params, 'vz',-2,2,0.01).name("Vy").onChange(function(val){
            thisObj.params.uz=val;
            thisObj.plane.update({vz:val});
            thisObj.v.setDir(new Vector3(thisObj.params.vx, thisObj.params.vy, thisObj.params.vz));
        });
        vFolder.add(thisObj.params, 'vy',-2,2,0.01).name("Vz").onChange(function(val){
            thisObj.params.vy=val;
            thisObj.plane.update({vy:val});
            thisObj.v.setDir(new Vector3(thisObj.params.vx, thisObj.params.vy, thisObj.params.vz));
        });

    }

    tick(time,dTime){

        if(this.params.animate ){

            let uSin = Math.sin(time);
            let vSin = Math.sin(time/3);

            this.params.uPos = (uSin+1)/2.;
            this.params.vPos = (vSin+1)/2.;

            let uVec = new Vector3(this.params.ux,this.params.uy, this.params.uz);
            uVec.multiplyScalar(this.range.u.max*uSin);
            this.u.setDir(uVec);

            let vVec = new Vector3(this.params.vx,this.params.vy, this.params.vz);
            vVec.multiplyScalar(this.range.v.max*vSin);
            this.v.setDir(vVec);

            this.plane.update({uPos:this.params.uPos, vPos:this.params.vPos});
            this.domainPlot.update({uPos:this.params.uPos, vPos:this.params.vPos});

        }
    }
}


let ex = new ParametricPlaneAnimation();

export default {ex};