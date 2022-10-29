
//The class "dState" stores a differential of a
// tangent vector to configuration space
//in practice, this will the configuration space of a single ball system,
//meaning that state.vel will be the ball's velocity and state.acc will be
//covariant derivative with respect to the metric on the ambient space
//so long as they implement the following methods:


// .vel and .acc need to implement
// .clone(), as well as the  vector space operations:
// .add(), .sub() . multiplyScalar(), .applyMatrix3()




class dState {

    //build a dState from the input of an object storing velocity data
    //and an object storing acceleration data
    constructor(vel,acc){
        this.vel=vel.clone();
        this.acc=acc.clone();
    }

    //make a copy of a given dState (not just reference it in memory)
    //and return the copy
    clone() {
        return  new dState(this.vel.clone(),this.acc.clone());
    }


    //add the velocity AND of a given state to the current
    add(dState) {
        this.vel.add(dState.vel);
        this.acc.add(dState.acc);
        return this;
    }

    //subtract the velocity AND acceleration of a given state from the current
    sub( dState ) {
        this.vel.sub( dState.vel );
        this.acc.sub( dState.acc );
        return this;
    }


    //scale the velocity AND acceleration of the current state by a factor
    multiplyScalar ( k ) {
        this.vel.multiplyScalar( k );
        this.acc.multiplyScalar( k );
        return this;
    }
}



export { dState };
