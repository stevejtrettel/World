

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

    flow(ep){
        this.pos.add(this.vel.clone().multiplyScalar(ep));
        return this;
    }

    //move a state by a velocity and acceleration
    //this does not flow by the velocity in the initial state:
    //it ONLY moves using the dState
    nudge(dState, ep){
        this.pos.add(dState.vel.clone().multiplyScalar(ep));
        this.vel.add(dState.acc.clone().multiplyScalar(ep));
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

    scale(ep) {
        this.vel.multiplyScalar(ep);
        this.acc.multiplyScalar(ep);
        return this;
    }

    add(dState) {
        this.vel.add(dState.vel);
        this.acc.add(dState.acc);
        return this;
    }

}



export { State, dState };
