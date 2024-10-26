import {Vector3} from "../../../3party/three/build/three.module.js";

import TVec from "./TVec.js";
import Material from "./Material.js";

//base class for an object
//needs an sdf and a material
//and optionally an *inside* function
class Object {
    constructor(){
        this.mat = new Material().makeDielectric('0xffffff');
        this.isLight = false;
    }

    sdf(pos){
        return 1.;
    }

    //the rest of these dont need to be redefined for each object, they're built from the sdf;

    getNormal(pos){

        let ep = 0.0001;
        let scale = 0.5773;
        let v1 = new Vector3(1,-1,-1).multiplyScalar(scale);
        let v2 = new Vector3(-1,-1,1).multiplyScalar(scale);
        let v3 = new Vector3(-1,1,-1).multiplyScalar(scale);
        let v4 = new Vector3(1,1,1).multiplyScalar(scale);

        let d1 = this.sdf(pos.clone().add(v1.clone().multiplyScalar(ep)));
        let d2 = this.sdf(pos.clone().add(v2.clone().multiplyScalar(ep)));
        let d3 = this.sdf(pos.clone().add(v3.clone().multiplyScalar(ep)));
        let d4 = this.sdf(pos.clone().add(v4.clone().multiplyScalar(ep)));

        let dir = v1.multiplyScalar(d1);
        dir.add(v2.multiplyScalar(d2));
        dir.add(v3.multiplyScalar(d3));
        dir.add(v4.multiplyScalar(d4));
        dir.normalize();

        return new TVec(pos,dir);

    }

    at(pos){
        let dist = this.sdf(pos);
        return (Math.abs(dist)<0.001);
    }

    inside(pos){
        let dist = this.sdf(pos);
        return dist<0.;
    }

    addToScene(scene){
        scene.add(this.mesh);
    }

    setVisibility(bool){
        this.mesh.visible=bool;
    }
}


export default  Object;
