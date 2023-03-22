import {getRange} from "../../utils/math/functions_singleVar.js";
import {ParametricGeometry} from "../../../3party/three/examples/jsm/geometries/ParametricGeometry.js";
import {DoubleSide, Mesh, MeshPhysicalMaterial} from "../../../3party/three/build/three.module.js";

let defaultParams = {
    wallMaterial:new MeshPhysicalMaterial({
        side:DoubleSide,
        transparent:true,
        opacity:0.5,
        clearcoat:1,
        color:0x3fd480,
    }),
    topMaterial:new MeshPhysicalMaterial({
        side:DoubleSide,
        transparent:true,
        transmission:0.5,
        ior:1.,
        clearcoat:1,
        color:0x3fd480,
    }),
    floorMaterial:new MeshPhysicalMaterial({
        side:DoubleSide,
        clearcoat:1,
        color:0x5d81d4,
    })
}

class PolarVolume{
    constructor(eqn,domain,parameters=defaultParams) {

        this.eqn = eqn;
        this.domain = domain;

        this.createEqns();
        this.createGeometries();

        let geos = this.createGeometries();
        this.floor = new Mesh(geos.floor,parameters.floorMaterial);
        this.top = new Mesh(geos.top,parameters.topMaterial);
        this.left = new Mesh(geos.left,parameters.wallMaterial);
        this.right = new Mesh(geos.right,parameters.wallMaterial);
        this.front = new Mesh(geos.front,parameters.wallMaterial);
        this.back = new Mesh(geos.back,parameters.wallMaterial);

    }

    createEqns(){

        //rescale r and t
        let domain = this.domain;
        let eqn = this.eqn;

        let rescaleT = function(t){
            return domain.t.min + t * (domain.t.max-domain.t.min);
        }

        let rescaleR = function(r){
            return domain.r.min + r * (domain.r.max-domain.r.min);
        }


        this.f = function(r,t,dest){
            r = rescaleR(r);
            t = rescaleT(t);
            let z = eqn(r,t);
            let x = r*Math.cos(t);
            let y = r*Math.sin(t);
            dest.set(x,z,-y);
        }

        this.floorEqn = function(r,t,dest){
            r = Math.max(0.01,domain.r.min + r * (domain.r.max-domain.r.min+1.)-0.5);
            t = domain.t.min + t * (domain.t.max-domain.t.min+1.)-0.5;
            let x = r*Math.cos(t);
            let y = r*Math.sin(t);
            dest.set(x,0,-y);
        }

        this.leftEqn = function(r,s,dest){
            r = rescaleR(r);
            let t = domain.t.min;
            let z = eqn(r,t);
            let x = r*Math.cos(t);
            let y = r*Math.sin(t);
            dest.set(x,z*s,-y);
        }

        this.rightEqn = function(r,s,dest){
            r = rescaleR(r);
            let t = domain.t.max;
            let z = eqn(r,t);
            let x = r*Math.cos(t);
            let y = r*Math.sin(t);
            dest.set(x,z*s,-y);
        }

        this.frontEqn = function(t,s,dest){
            t = rescaleT(t);
            let r = domain.r.min;
            let z = eqn(r,t);
            let x = r*Math.cos(t);
            let y = r*Math.sin(t);
            dest.set(x,z*s,-y);
        }

        this.backEqn = function(t,s,dest){
            t = rescaleT(t);
            let r = domain.r.max;
            let z = eqn(r,t);
            let x = r*Math.cos(t);
            let y = r*Math.sin(t);
            dest.set(x,z*s,-y);
        }

    }

    createGeometries(){

        let top = new ParametricGeometry(this.f,32,32);
        let left = new ParametricGeometry(this.leftEqn, 32,2);
        let right = new ParametricGeometry(this.rightEqn,32,2);
        let front = new ParametricGeometry(this.frontEqn, 32,2);
        let back = new ParametricGeometry(this.backEqn,32,2);
        let floor = new ParametricGeometry(this.floorEqn,32,32);

        return {
            top:top,
            left:left,
            right:right,
            front:front,
            back:back,
            floor:floor,
        };

    }

    updateGeometries(geos){
        this.top.geometry.dispose();
        this.top.geometry=geos.top;

        this.left.geometry.dispose();
        this.left.geometry=geos.left;

        this.right.geometry.dispose();
        this.right.geometry=geos.right;

        this.front.geometry.dispose();
        this.front.geometry=geos.front;

        this.back.geometry.dispose();
        this.back.geometry=geos.back;

        this.floor.geometry.dispose();
        this.floor.geometry = geos.floor;

    }


    addToScene(scene){
        scene.add(this.floor);
        scene.add(this.top);
        scene.add(this.left);
        scene.add(this.right);
        scene.add(this.front);
        scene.add(this.back);
    }

    updateEqn(eqn){
        this.eqn=eqn;
        this.createEqns();
        let geos = this.createGeometries();
        this.updateGeometries(geos);
    }

    updateDomain(dom){
        this.domain=dom;
        this.createEqns();
        let geos = this.createGeometries();
        this.updateGeometries(geos);
    }

}


export default PolarVolume;
