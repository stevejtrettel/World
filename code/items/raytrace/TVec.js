

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
    }

    normalize(){
        this.dir.normalize();
    }

    reflectIn(normal){
        normal.normalize();
        let proj = this.dir.dot(normal);
        this.dir.add(normal.multiplyScalar(2.*proj));
    }



}

export default TVec;
