import {Mesh, DoubleSide, MeshPhysicalMaterial, Vector3} from "../../../3party/three/build/three.module.js";
import ParametricCurveCPU from "../../compute/parametric/ParametricCurveCPU.js";
import {Rod} from "../basic-shapes/Rod.js";
import {ParametricGeometry} from "../../../3party/three/examples/jsm/geometries/ParametricGeometry.js";



let sliceMat = new MeshPhysicalMaterial({
    side:DoubleSide,
    color:0xde871d,
});


class PolarSlice{
    constructor(eqn,domain,slice,sliceVar) {
        this.eqn=eqn;
        this.domain=domain;
        this.slice=slice;
        this.sliceVar=sliceVar;

        this.createEqns();

        this.side1 = new Rod({
            end1:this.bottom1,
            end2:this.top1,
            radius:0.05,
            color:0xe3af12
        });
        this.side2 = new Rod({
            end1:this.bottom2,
            end2:this.top2,
            radius:0.05,
            color:0xe3af12
        });

        this.top = new ParametricCurveCPU(this.topCurve, this.currentDomain,{color:0xe3af12});
        this.bottom = new ParametricCurveCPU(this.bottomCurve, this.currentDomain,{color:0xe3af12});
        this.surface = new Mesh(this.sliceGeom,sliceMat);
    }

    addToScene(scene){
        this.bottom.addToScene(scene);
        this.side1.addToScene(scene);
        this.side2.addToScene(scene);
        this.top.addToScene(scene);
        scene.add(this.surface);
    }

    createEqns(){

        let domain=this.domain;
        let eqn = this.eqn;

        let rescaleR = function(r){
            return domain.r.min + r * (domain.r.max-domain.r.min);
        }
        let rescaleT = function(t){
            return domain.t.min + t * (domain.t.max-domain.t.min);
        }


        if(this.sliceVar=='t'){

            this.currentDomain = this.domain.t;
            let rescaleSlice = rescaleR(this.slice);

            this.topCurve = function(t,params={}){
                let x = rescaleSlice * Math.cos(t);
                let y = rescaleSlice *Math.sin(t);
                let z = eqn(rescaleSlice,t);
                return new Vector3(x,z,-y);
            }

            this.bottomCurve = function(t,params={}){
                let x = rescaleSlice * Math.cos(t);
                let y = rescaleSlice *Math.sin(t);
                return new Vector3(x,0,-y);
            }

            this.sliceEqn = function(t,s,dest){
                t = rescaleT(t);
                let z = eqn(rescaleSlice,t);
                let x = rescaleSlice * Math.cos(t);
                let y = rescaleSlice *Math.sin(t);
                dest.set(x,z*s,-y);
            }
        }

        if(this.sliceVar=='r'){

            this.currentDomain = this.domain.r;
            let rescaleSlice = rescaleT(this.slice);

            this.topCurve = function(r,params={}){
                let x =  r * Math.cos(rescaleSlice);
                let y =  r * Math.sin(rescaleSlice);
                let z = eqn(r,rescaleSlice);
                return new Vector3(x,z,-y);
            }

            this.bottomCurve = function(r,params={}){
                let x =  r * Math.cos(rescaleSlice);
                let y =  r * Math.sin(rescaleSlice);
                return new Vector3(x,0,-y);
            }

            this.sliceEqn = function(r,s,dest){
                r = rescaleR(r);
                let z = eqn(r,rescaleSlice);
                let x = r * Math.cos(rescaleSlice);
                let y = r * Math.sin(rescaleSlice);
                dest.set(x,z*s,-y);
            }

        }

        this.sliceGeom = new ParametricGeometry(this.sliceEqn,32,2);
        this.bottom1 = this.bottomCurve(this.currentDomain.min);
        this.bottom2 = this.bottomCurve(this.currentDomain.max);
        this.top1 = this.topCurve(this.currentDomain.min);
        this.top2 = this.topCurve(this.currentDomain.max);

    }

    updateGeometries(){

        let rad1=0.05;
        let rad2=0.05;

        if(this.sliceVar=='r'){
            rad1 *= this.domain.r.min;
            rad2 *= this.domain.r.max;
        }

        this.side1.resize(this.bottom1,this.top1,rad1);
        this.side2.resize(this.bottom2,this.top2,rad2);

        this.top.setCurve(this.topCurve);
        this.top.setDomain(this.currentDomain);
        this.top.update();

        this.bottom.setCurve(this.bottomCurve);
        this.bottom.setDomain(this.currentDomain);
        this.bottom.update();

        this.surface.geometry.dispose();
        this.surface.geometry = this.sliceGeom;
    }

    updateDomain(domain){
        this.domain=domain;
        this.createEqns();
        this.updateGeometries();
    }

    updateEqn(eqn){
        this.eqn=eqn;
        this.createEqns();
        this.updateGeometries();
    }

    updateSlice(slice){
        this.slice=slice;
        this.createEqns();
        this.updateGeometries();
    }

    setVisibility(value){
        this.side1.setVisibility(value);
        this.side2.setVisibility(value);
        this.top.setVisibility(value);
        this.bottom.setVisibility(value);
        this.surface.visible=value;
    }

    setSliceVar(variable){
        this.sliceVar=variable;
        this.createEqns();
        this.updateGeometries();
    }

}


export default PolarSlice;
