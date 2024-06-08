import {Mesh, DoubleSide, MeshPhysicalMaterial, Vector3} from "../../../3party/three/build/three.module.js";
import ParametricCurveCPU from "../../compute/parametric/ParametricCurveCPU.js";
import {Rod} from "../basic-shapes/Rod.js";
import {ParametricGeometry} from "../../../3party/three/examples/jsm/geometries/ParametricGeometry.js";


let sliceMat = new MeshPhysicalMaterial({
    side:DoubleSide,
    color:0xde871d,
});


class CartesianSlice{
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

        this.bottom = new Rod({
            end1:this.bottom1,
            end2:this.bottom2,
            radius:0.05,
            color:0xe3af12
        });

        this.top = new ParametricCurveCPU(this.topCurve, this.currentDomain,{color:0xe3af12});

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

        let rescaleX = function(x){
            return domain.x.min + x * (domain.x.max-domain.x.min);
        }
        let rescaleY = function(y){
            return domain.y.min + y * (domain.y.max-domain.y.min);
        }


        if(this.sliceVar=='y'){

            this.currentDomain = this.domain.y;
            let rescaleSlice = rescaleX(this.slice);

            this.topCurve = function(y,params={}){
                let x = rescaleSlice ;
                let z = eqn(rescaleSlice,y);
                return new Vector3(x,z,-y);
            }

            this.bottomCurve = function(y,params={}){
                let x =  rescaleSlice;
                return new Vector3(x,0,-y);
            }

            this.sliceEqn = function(y,s,dest){
                y = rescaleY(y);
                let z = eqn(rescaleSlice,y);
                let x = rescaleSlice;
                dest.set(x,z*s,-y);
            }
        }

        if(this.sliceVar=='x'){

            this.currentDomain = this.domain.x;
            let rescaleSlice = rescaleY(this.slice);

            this.topCurve = function(x,params={}){
                let y =  rescaleSlice;
                let z = eqn(x,rescaleSlice);
                return new Vector3(x,z,-y);
            }

            this.bottomCurve = function(x,params={}){
                let y =  rescaleSlice;
                return new Vector3(x,0,-y);
            }

            this.sliceEqn = function(x,s,dest){
                x = rescaleX(x);
                let y = rescaleSlice;
                let z = eqn(x,y);
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

        this.side1.resize(this.bottom1,this.top1);
        this.side2.resize(this.bottom2,this.top2);
        this.bottom.resize(this.bottom1,this.bottom2);

        this.top.setCurve(this.topCurve);
        this.top.setDomain(this.currentDomain);
        this.top.update();

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


export default CartesianSlice;
