
class dState {
    constructor(vel,acc){
        this.vel=vel.clone();
        this.acc=acc.clone();
    }

    clone() {
        return  new dState(this.vel.clone(),this.acc.clone());
    }

    multiplyScalar ( k ) {
        this.vel.multiplyScalar( k );
        this.acc.multiplyScalar( k );
        return this;
    }

    add(dState) {
        this.vel.add(dState.vel);
        this.acc.add(dState.acc);
        return this;
    }

    sub( dState ) {
        this.vel.sub( dState.vel );
        this.acc.sub( dState.acc );
        return this;
    }

}


export default dState;