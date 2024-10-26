

class TVec{
    constructor(pos,dir) {
        this.pos = pos;
        this.dir = dir;

        this.keepGoing = true;
    }

    add(tv){
        if(this.pos == tv.pos){
            this.dir.add(tv.dir);
        }
        return this;
    }

    sub(tv){
        if(this.pos == tv.pos){
            this.dir.sub(tv.dir);
        }
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
        normal.normalize();
        let proj = this.dir.dot(normal);
        this.dir.add(normal.multiplyScalar(-2.*proj));
        return this;
    }

    refractIn(normal,ior){
        return this;
    }



}

export default TVec;
