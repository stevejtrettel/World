import {Mesh, DoubleSide, MeshPhysicalMaterial, Vector3} from "../../../3party/three/build/three.module.js";
import ParametricCurveCPU from "../parametric/ParametricCurveCPU.js";
import {Rod} from "../basic-shapes/Rod.js";
import {ParametricGeometry} from "../../../3party/three/examples/jsm/geometries/ParametricGeometry.js";
import {getRange} from "../../utils/math/functions_singleVar.js";

const parser = math.parser();

let surfMat = new MeshPhysicalMaterial({
    side:DoubleSide,
    color:0x9d52bf,
});

class CartesianYIntegrate{
    constructor(eqn,domain,slice=0.5) {
        this.eqn=eqn;
        this.domain=domain;
        this.slice=slice;

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

        this.top = new ParametricCurveCPU(this.integralCurve,this.domain.x,{ color:0x7640a3});
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

        let rescaleX = function(x){
            return domain.x.min + x * (domain.x.max-domain.x.min);
        }
        let rescaleSlice = rescaleX(this.slice);

        let yMin = parser.evaluate('yMin(x)='.concat(domain.y.min));
        let yMax = parser.evaluate('yMax(x)='.concat(domain.y.max));
        this.yMin=yMin;
        this.yMax=yMax;

        let rescaleY = function(x,y){
            return yMin(x) + y * (yMax(x)-yMin(x));
        }
        let absMinY=getRange(yMin,domain.x).min;
        let absMaxY=getRange(yMax,domain.x).max;

        let integral = function(x){
           let z=0.;
           let N=10;
           let spread = yMax(x)-yMin(x);
           let dy = spread/N;
           for(let i=0;i<N;i++){
               let yi = rescaleY(x,i/N);
               let dz = eqn(x,yi)*dy;
               z = z + dz;
           }
           return z/2.;
        };

        this.integralCurve = function(x,params={}){
            return new Vector3(x, integral(x),-absMaxY-offset);
        }

        this.surfEqn = function(x,s,dest){
            x = rescaleX(x);
            let z = integral(x);
            dest.set(x,z*s,-absMaxY-offset);
        }
        this.surfGeometry = new ParametricGeometry(this.surfEqn,32,2);

        this.bottom1 = new Vector3(domain.x.min,0,-absMaxY-offset);
        this.bottom2 = new Vector3(domain.x.max,0,-absMaxY-offset);
        this.top1 = this.integralCurve(domain.x.min);
        this.top2 = this.integralCurve(domain.x.max);

        this.sliceBottom = new Vector3(rescaleSlice,0,-absMaxY-offset);
        this.sliceTop = new Vector3(rescaleSlice, integral(rescaleSlice),-absMaxY-offset);
    }

    updateGeometries(){
        this.bottom.resize(this.bottom1,this.bottom2);
        this.side1.resize(this.bottom1,this.top1);
        this.side2.resize(this.bottom2,this.top2);
        this.sliceRod.resize(this.sliceBottom,this.sliceTop);

        this.top.setCurve(this.integralCurve);
        this.top.setDomain(this.domain.x);
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

}


export default CartesianYIntegrate;