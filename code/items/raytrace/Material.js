import {Vector3} from "../../../3party/three/build/three.module.js";
import TVec from "./TVec.js";

//raymarching material: list of properties, with a method "interact"
class Material{

    constructor() {
        this.properties = {};
    }

    interact(tv,normal){
        //take in a tangent vector, return a new tangent vector
        // let pos = tv.pos;
        // let dir = tv.dir;

        tv = tv.reflectIn(normal);
        return tv;
    }

    makeDielectric(color){
        this.properties = {
            color: color,
            roughness:0.5,
            clearcoat:true,
        }
    }

    makeMetal(color){
        this.properties ={
            color: color,
            roughness:0.5,
        }
    }

    makeGlass(color){
        this.properties = {
            color: color,
            roughness:0,
        }
    }

}

export default Material;
