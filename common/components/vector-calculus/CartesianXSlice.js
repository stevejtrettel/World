import {Mesh, DoubleSide, MeshPhysicalMaterial, Vector3} from "../../../3party/three/build/three.module.js";
import ParametricCurveCPU from "../parametric/ParametricCurveCPU.js";
import {Rod} from "../basic-shapes/Rod.js";
import {ParametricGeometry} from "../../../3party/three/examples/jsm/geometries/ParametricGeometry.js";
import {getRange} from "../../utils/math/functions_singleVar.js";


let sliceMat = new MeshPhysicalMaterial({
    side:DoubleSide,
    color:0xde871d,
});

const parser = math.parser();

class CartesianXSlice{
   constructor(eqn,domain,slice) {
       this.eqn=eqn;
       this.domain=domain;
       this.slice=slice;

       this.createEqns();
       this.bottom = new Rod({
           end1:this.bottom1,
           end2:this.bottom2,
           radius:0.05,
           color:0xe3af12
       });
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

       this.top = new ParametricCurveCPU(this.topCurve,this.sliceDomain,{color:0xe3af12});
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
       let rescaleSlice = rescaleX(this.slice);

       let yMin = parser.evaluate('yMin(x)='.concat(domain.y.min));
       let yMax = parser.evaluate('yMax(x)='.concat(domain.y.max));
       this.yMin=yMin;
       this.yMax=yMax;

       let rescaleY = function(x,y){
           return yMin(x) + y * (yMax(x)-yMin(x));
       }

       this.sliceDomain = {min:yMin(rescaleSlice),max:yMax(rescaleSlice)};

       this.topCurve = function(y,params={}){
           return new Vector3(rescaleSlice,eqn(rescaleSlice,y),-y);
       }

       this.sliceEqn = function(y,s,dest){
           y = rescaleY(rescaleSlice,y);
           let z = eqn(rescaleSlice,y);
           dest.set(rescaleSlice,z*s,-y);
       }
       this.sliceGeom = new ParametricGeometry(this.sliceEqn,32,2);

       this.bottom1 = new Vector3(rescaleSlice,0,-yMin(rescaleSlice));
       this.bottom2 = new Vector3(rescaleSlice,0,-yMax(rescaleSlice));
       this.top1 = this.topCurve(yMin(rescaleSlice));
       this.top2 = this.topCurve(yMax(rescaleSlice));
   }

   updateGeometries(){
       this.bottom.resize(this.bottom1,this.bottom2);
       this.side1.resize(this.bottom1,this.top1);
       this.side2.resize(this.bottom2,this.top2);

       this.top.setCurve(this.topCurve);
       this.top.setDomain(this.sliceDomain);
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

}


export default CartesianXSlice;