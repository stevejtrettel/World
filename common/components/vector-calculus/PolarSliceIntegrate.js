import {Mesh, DoubleSide, MeshPhysicalMaterial, Vector3} from "../../../3party/three/build/three.module.js";
import ParametricCurveCPU from "../parametric/ParametricCurveCPU.js";
import {Rod} from "../basic-shapes/Rod.js";
import {ParametricGeometry} from "../../../3party/three/examples/jsm/geometries/ParametricGeometry.js";



let surfMat = new MeshPhysicalMaterial({
    side:DoubleSide,
    color:0x9d52bf,
});

class PolarSliceIntegrate{
    constructor(eqn,domain,slice=0.5,sliceVar) {
        this.eqn=eqn;
        this.domain=domain;
        this.slice=slice;
        this.sliceVar=sliceVar;

        this.createEqns();
        this.bottom = new Rod({
            end1:this.bottom1,
            end2:this.bottom2,
            radius:0.05,
            color:0x7640a3,
        });
        this.side1 = new Rod({
            end1:this.bottom1,
            end2:this.top1,
            radius:0.05,
            color:0x7640a3,
        });
        this.side2 = new Rod({
            end1:this.bottom2,
            end2:this.top2,
            radius:0.05,
            color:0x7640a3,
        });
        this.sliceRod = new Rod({
            end1:this.sliceBottom,
            end2:this.sliceTop,
            radius:0.075,
            color:0xffe336,
        })

        this.top = new ParametricCurveCPU(this.integralCurve,this.currentDomain,{ color:0x7640a3});
        this.surface = new Mesh(this.surfGeometry,surfMat);
    }

    addToScene(scene){
        this.bottom.addToScene(scene);
        this.side1.addToScene(scene);
        this.side2.addToScene(scene);
        this.top.addToScene(scene);
        scene.add(this.surface);
        this.sliceRod.addToScene(scene);
    }

    createEqns(){

        let offset = 5.;

        let domain=this.domain;
        let eqn = this.eqn;

        let rescaleR = function(r){
            return domain.r.min + r * (domain.r.max-domain.r.min);
        }
        let rescaleT = function(t){
            return domain.t.min + t * (domain.t.max-domain.t.min);
        }

        let integral,rescaleSlice;

        if(this.sliceVar=='r') {

            this.currentDomain=this.domain.r;

            rescaleSlice = rescaleR(this.slice);

            integral = function (r) {
                let z = 0.;
                let N = 30;
                let spread = r * (domain.t.max - domain.t.min);
                let dt = spread / N;
                for (let i = 0; i < N; i++) {
                    let ti = rescaleT(i / N);
                    let dz = eqn(r, ti) * dt;
                    z = z + dz;
                }
                return z / 2.;
            };

            this.integralCurve = function (r, params = {}) {
                return new Vector3(r, integral(r), -domain.r.max - offset);
            }

            this.surfEqn = function (r, s, dest) {
                r = rescaleR(r);
                let z = integral(r);
                dest.set(r, z * s, -domain.r.max - offset);
            }

        }

        else if(this.sliceVar=='t') {

            this.currentDomain=this.domain.t;

            rescaleSlice = rescaleT(this.slice);

            integral = function(t){
                let z=0.;
                let N=30;
                let spread = (domain.r.max-domain.r.min);
                let dt = spread/N;
                for(let i=0;i<N;i++){
                    let ri = rescaleR(i/N);
                    let dz = ri*eqn(ri,t)*dt;
                    z = z + dz;
                }
                return z/2.;
            };

            this.integralCurve = function(t,params={}){
                return new Vector3(t, integral(t),-domain.r.max-offset);
            }

            this.surfEqn = function(t,s,dest){
                t = rescaleT(t);
                let z = integral(t);
                dest.set(t,z*s,-domain.r.max-offset);
            }

        }


        this.surfGeometry = new ParametricGeometry(this.surfEqn,32,2);

        this.bottom1 = new Vector3(this.currentDomain.min,0,-domain.r.max-offset);
        this.bottom2 = new Vector3(this.currentDomain.max,0,-domain.r.max-offset);
        this.top1 = this.integralCurve(this.currentDomain.min);
        this.top2 = this.integralCurve(this.currentDomain.max);

        this.sliceBottom = new Vector3(rescaleSlice,0,-domain.r.max-offset);
        this.sliceTop = new Vector3(rescaleSlice, integral(rescaleSlice),-domain.r.max-offset);


    }

    updateGeometries(){
        this.bottom.resize(this.bottom1,this.bottom2);
        this.side1.resize(this.bottom1,this.top1);
        this.side2.resize(this.bottom2,this.top2);
        this.sliceRod.resize(this.sliceBottom,this.sliceTop);

        this.top.setCurve(this.integralCurve);
        this.top.setDomain(this.currentDomain);
        this.top.update();

        this.surface.geometry.dispose();
        this.surface.geometry = this.surfGeometry;
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
        this.sliceRod.resize(this.sliceBottom,this.sliceTop);
    }

    setVisibility(value){
        this.sliceRod.setVisibility(value);
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


export default PolarSliceIntegrate;