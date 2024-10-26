import {Vector3} from "../../../3party/three/build/three.module.js";

// a diorama is a collection of objects
//this implements stepForward

class Diorama{
    constructor() {
        this.objList = [];
    }

    sdf(pos){
        let dist = 10000.;

        for(let i=0; i<this.objList.length; i++){

            dist = Math.min(dist, this.objList[i].sdf(pos));
        }
        return dist;
    }


    addObject(obj){
        this.objList.push(obj);
    }

    addToScene(scene){
        for(let i=0; i<this.objList.length; i++){
            this.objList[i].addToScene(scene);
        }
    }
}

export default Diorama;
