import {Vector3} from "../../../3party/three/build/three.module.js";

class TVec{
    constructor(pos=new Vector3(0,0,0),dir=new Vector3(1,0,0)) {
        this.pos = pos.clone();
        this.dir = dir.clone();

        this.keepGoing = true;
    }

    clone(){
        let pos = this.pos.clone();
        let dir = this.dir.clone();
        return new TVec(pos,dir);
    }

    add(tv){
        this.dir.add(tv.dir);
        return this;
    }

    sub(tv){
        this.dir.sub(tv.dir);
        return this;
    }

    multiplyScalar(k){
        this.dir.multiplyScalar(k);
        return this;
    }

    normalize(){
        this.dir.normalize();
    }

    dot(tv) {
        return this.dir.dot(tv.dir);
    }

    cosAng(tv){
        //make sure the vectors are unit length
        let v1 = this.dir.clone().normalize();
        let v2 = tv.dir.clone().normalize();
        return v1.dot(v2);
    }

    flow(t){
        this.pos.add(this.dir.clone().multiplyScalar(t));
        return this;
    }



    //perhaps don't need these, as we'll do material calculations elsewhere?

    reflectIn(normal){
        normal.clone().normalize();
        let proj = this.dir.dot(normal.clone());
        this.dir.add(normal.multiplyScalar(-2.*proj));
        return this;
    }

    refractIn(normal,ior){
        return this;
    }


}

export default TVec;
