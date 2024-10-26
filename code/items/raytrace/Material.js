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

        //tv = tv.reflectIn(normal);
        let dir = new Vector3(Math.random(),-1,Math.random()).normalize();
        return new TVec(tv.pos,dir);
      //  return tv;
    }

    makeDielectric(color){
        this.properties = {
            color: color,
            roughness:0.5,
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
