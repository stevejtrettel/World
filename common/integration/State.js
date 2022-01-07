

//states have two components: a position and velocity
//they should be any form of Vector2, Vector3, Vector4
class State {

    constructor(pos, vel){
        this.pos=pos.clone();
        this.vel=vel.clone();
    }

    clone(){
        return  new State(this.pos.clone(), this.vel.clone());
    }


    //add a dState to State:
    add( dState ) {
       this.pos.add(dState.vel);
       this.vel.add(dState.acc);
       return this;
    }

    sub( state ){
        this.vel.sub(state.vel);
        return this;
    }

    multiplyScalar( k ) {
        this.vel.multiplyScalar(k);
        return this;
    }


    //a new possibility not inherited from vec
    flow(ep){
        this.pos.add(this.vel.clone().multiplyScalar(ep));
        return this;
    }

}


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



export { State, dState };
