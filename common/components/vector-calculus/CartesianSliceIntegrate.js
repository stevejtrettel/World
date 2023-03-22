import {Mesh, DoubleSide, MeshPhysicalMaterial, Vector3} from "../../../3party/three/build/three.module.js";
import ParametricCurveCPU from "../parametric/ParametricCurveCPU.js";
import {Rod} from "../basic-shapes/Rod.js";
import {ParametricGeometry} from "../../../3party/three/examples/jsm/geometries/ParametricGeometry.js";



let surfMat = new MeshPhysicalMaterial({
    side:DoubleSide,
    color:0x9d52bf,
});

class CartesianSliceIntegrate{
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

        let offset = 3.;

        let domain=this.domain;
        let eqn = this.eqn;

        let rescaleX = function(x){
            return domain.x.min + x * (domain.x.max-domain.x.min);
        }
        let rescaleY = function(y){
            return domain.y.min + y * (domain.y.max-domain.y.min);
        }

        let integral,rescaleSlice;

        if(this.sliceVar=='y') {

            this.currentDomain=this.domain.x;
            rescaleSlice = rescaleX(this.slice);

            integral = function (x) {
                let z = 0.;
                let N = 30;
                let spread = (domain.y.max - domain.y.min);
                let dy = spread / N;
                for (let i = 0; i < N; i++) {
                    let yi = rescaleY(i / N);
                    let dz = eqn(x, yi) * dy;
                    z = z + dz;
                }
                return z / 2.;
            };

            this.integralCurve = function(x,params={}){
                return new Vector3(x, integral(x),-domain.y.max-offset);
            }

            this.surfEqn = function(x,s,dest){
                x = rescaleX(x);
                let z = integral(x);
                dest.set(x,z*s,-domain.y.max-offset);
            }

            this.surfGeometry = new ParametricGeometry(this.surfEqn,32,2);

            this.bottom1 = new Vector3(this.currentDomain.min,0,-domain.y.max-offset);
            this.bottom2 = new Vector3(this.currentDomain.max,0,-domain.y.max-offset);
            this.top1 = this.integralCurve(this.currentDomain.min);
            this.top2 = this.integralCurve(this.currentDomain.max);

            this.sliceBottom = new Vector3(rescaleSlice,0,-domain.y.max-offset);
            this.sliceTop = new Vector3(rescaleSlice, integral(rescaleSlice),-domain.y.max-offset);

        }

        else if(this.sliceVar=='x') {

            this.currentDomain=this.domain.y;

            rescaleSlice = rescaleY(this.slice);

            integral = function(y){
                let z=0.;
                let N=30;
                let spread = (domain.x.max-domain.x.min);
                let dx = spread/N;
                for(let i=0;i<N;i++){
                    let xi = rescaleX(i/N);
                    let dz = eqn(xi,y)*dx;
                    z = z + dz;
                }
                return z/2.;
            };

            this.integralCurve = function(y,params={}){
                return new Vector3(domain.x.min-offset, integral(y),-y);
            }

            this.surfEqn = function(y,s,dest){
                y = rescaleY(y);
                let z = integral(y);
                dest.set(domain.x.min-offset,z*s,-y);
            }

            this.surfGeometry = new ParametricGeometry(this.surfEqn,32,2);

            this.bottom1 = new Vector3(domain.x.min-offset,0,-this.currentDomain.min);
            this.bottom2 = new Vector3(domain.x.min-offset,0,-this.currentDomain.max);
            this.top1 = this.integralCurve(this.currentDomain.min);
            this.top2 = this.integralCurve(this.currentDomain.max);

            this.sliceBottom = new Vector3(domain.x.min-offset,0,-rescaleSlice);
            this.sliceTop = new Vector3(domain.x.min-offset, integral(rescaleSlice),-rescaleSlice);

        }


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


export default CartesianSliceIntegrate;