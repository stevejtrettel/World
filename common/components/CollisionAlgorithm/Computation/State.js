
//The class "State" stores a tangent vector to configuration space
//in practice, this will the configuration space of a single ball system,
//meaning that state.pos will be the ball's center and state.vel will be
//the balls velocity.  But the attributes can be anything,
//so long as they implement the following methods:


// .pos and .vel need to implement
// .clone()
// .vel needs to implement vector space operations:
// .add(), .sub() . multiplyScalar(), .applyMatrix3()


class State {

    //build a state from the input of an object storing position data
    //and an object storing velocity data
    constructor(pos, vel){
        this.pos=pos.clone();
        this.vel=vel.clone();
    }

    //make a copy of a given state (not just reference it in memory)
    //and return the copy
    clone(){
        return  new State(this.pos.clone(), this.vel.clone());
    }


    //add the velocity of a given state to the current
    add( state ) {
        this.vel.add(state.vel);
        return this;
    }

    //subtract the velocity of a given state from the current
    sub( state ){
        this.vel.sub(state.vel);
        return this;
    }

    //scale the velocity of the current state by a factor
    multiplyScalar( k ) {
        this.vel.multiplyScalar(k);
        return this;
    }

    //take the directional derivative of a function fn
    // at pos in direction vel:
    differentiate(fn){

        let eps = 0.00001;
        let pos1 = this.pos.clone().add(this.vel.clone().multiplyScalar(-eps/2));
        let pos2 = this.pos.clone().add(this.vel.clone().multiplyScalar(eps/2));

        let dval = fn(pos2)-fn(pos1);
        return  dval/eps;
    }



    //move a state infintesimally along its tangent direction
    flow(ep){
        this.pos.add(this.vel.clone().multiplyScalar(ep));
        return this;
    }

    //update a state (a tangent vector) by infinitesimally flowing along a
    //differential to the state: a pair dState of a velocity and acceleration
    updateBy( dState ) {
        this.pos.add(dState.vel);
        this.vel.add(dState.acc);
        return this;
    }

}



export { State };