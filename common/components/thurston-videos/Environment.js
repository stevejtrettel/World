import {Vector3} from "../../../3party/three/build/three.module.js";
import {TVec} from "./Objects.js";


function reflectInNormal(dir, normal){
    return dir.clone().sub(normal.multiplyScalar(2.*dir.dot(normal)));
}

class Environment{
    constructor(objects){
        this.eps=0.01;
        this.objects = objects;
        this.maxSteps=5.;
    }
    dist(pos){
        let distance = 1000.;
        for(const [key, value] of Object.entries(this.objects)){
            distance = Math.min(distance, value.dist(pos));
        }
        return distance;
    }

    //march a given position, direction to the next position
    raymarch(tv){
        let dist = 1000.;
        for(let i=0; i<this.maxSteps; i++){
            dist = this.dist(tv.pos);
            if(dist<this.eps){
                break;
            }
        }
        //now we've reached an object: which one?
        //need to set the final position
        tv.pos.add(tv.dir.clone().multiplyScalar(dist));
        //and, reset the normal vector, bouncing off the object...
        let normalVec = new Vector3(1,0,0);
        tv.dir = reflectInNormal(tv.dir,normalVec);
    }
}


export default Environment;
