

//states have two components: a position and velocity
//they should be any form of Vector2, Vector3, Vector4
//can solve systems of vector valued ODEs by having objects of State be Mat4 or Mat3...
//SO LONG AS WE IMPLEMENT THE METHODS ADD AND SUB ON MATRICES:
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



export default State;
