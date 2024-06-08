
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

class CartesianVolume{
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

        let rescaleX = function(x){
            return domain.x.min + x * (domain.x.max-domain.x.min);
        }

        let rescaleY = function(y){
            return domain.y.min + y * (domain.y.max-domain.y.min);
        }


        this.f = function(x,y,dest){
            x = rescaleX(x);
            y = rescaleY(y);
            let z = eqn(x,y);
            dest.set(x,z,-y);
        }

        this.floorEqn = function(x,y,dest){
            x = domain.x.min + x * (domain.x.max-domain.x.min+2.)-1;
            y = domain.y.min + y * (domain.y.max-domain.y.min+2.)-1;
            dest.set(x,0,-y);
        }

        this.leftEqn = function(x,s,dest){
            x = rescaleX(x);
            let y = domain.y.min;
            let z = eqn(x,y);
            dest.set(x,z*s,-y);
        }

        this.rightEqn = function(x,s,dest){
            x = rescaleX(x);
            let y = domain.y.max;
            let z = eqn(x,y);
            dest.set(x,z*s,-y);
        }

        this.frontEqn = function(y,s,dest){
            y = rescaleY(y);
            let x = domain.x.min;
            let z = eqn(x,y);
            dest.set(x,z*s,-y);
        }

        this.backEqn = function(y,s,dest){
            y = rescaleY(y);
            let x = domain.x.max;
            let z = eqn(x,y);
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


export default CartesianVolume;
