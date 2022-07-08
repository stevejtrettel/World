//Abstract classes for the various spaaces involved


//States are elements of the cotangent bundle to some configuration space
//The configuration space itself is parameterized by q, and p is a cotangent vector at q.

//requirements of the structure playing role of p:
//needs to have implemented add, sub, clone, multiplyScalar

//States have vector space methods inherited for two states at the same location, which act on the cotangent space only
//If the configuration space q is curved, we may wish to normalize a proposed state, projecting it onto the cotangent bundle.

class State {

    constructor(q,p){
        this.q=q.clone();
        this.p=p.clone();
    }

    clone(){
        return  new State(this.q.clone(), this.p.clone());
    }

    add( state ){
        this.p.add(state.p);
        return this;
    }

    sub( state ){
        this.p.sub(state.p);
        return this;
    }

    multiplyScalar( k ) {
        this.p.multiplyScalar(k);
        return this;
    }

    normalize(){
        this.q.normalize();
        //do something to this.p, depending on the context
        return this;
    }


    //the following are some methods that need to be implemented geometrically:
    //first, given a state, we can produce a basis for the cotangent space at that point
    //this is a list of elements of dState, all based at state, with number equal to the dimension of state:
    getCotangentBasis(){
        let basis;
        return basis;
    }

    //similarly, given a state, we can produce a basis for the tangent space at that point
    //this is a list of elements of vState, all based at state, with number equal to the dimension of state:
    getTangentBasis(){
        let basis;
        return basis;
    }

}







//dState is the cotangent bundle to state space: that is, its the cotangent bundle to the cotangent bundle of configuration space!
//its parameters are a point (q,p) in state space, and a 1-form (dq,dp) based at (q,p);

//requirements of the objects playing the roles of vq, vp:
//must have clone, add, sub, multiplyScalar

//standard vector space operations apply to any two elements of dState based at the same (q,p);
//we also need a normalization, depending on the situation

class dState {
    constructor(state, dq, dp){
        this.state=state.clone();
        this.dq=dq.clone();
        this.dp=dp.clone();
    }

    clone() {
        return  new dState(this.state, this.dq, this.dq);
    }

    add(dState) {
        this.dq.add(dState.dq);
        this.dp.add(dState.dp);
        return this;
    }

    sub( dState ) {
        this.dq.sub( dState.dq );
        this.dp.sub( dState.dp );
        return this;
    }

    multiplyScalar ( k ) {
        this.dq.multiplyScalar( k );
        this.dp.multiplyScalar( k );
        return this;
    }

    normalize(){
        this.state.normalize();
        //do something to dq;
        //do something to dp;
        return this;
    }

}




//vState is the TANGENT bundle to state space: that is Tangent(Cotangent(Config))
//its parameters are a point (q,p) in state space, and a tangent vector (vq,vp) based at (q,p);

//requirements of the objects playing the roles of vq, vp:
//must have clone, add, sub, multiplyScalar

//standard vector space operations apply to any two elements of vState based at the same (q,p);
//we also need a normalization, depending on the situation


class vState {
    constructor(state, vq, vp){
        this.state=state.clone();
        this.vq=vq.clone();
        this.vp=vp.clone();
    }

    clone() {
        return  new vState(this.state, this.dq, this.dq);
    }

    add(vState) {
        this.vq.add(vState.vq);
        this.vp.add(vState.vp);
        return this;
    }

    sub( vState ) {
        this.vq.sub( vState.vq );
        this.vp.sub( vState.vp );
        return this;
    }

    multiplyScalar ( k ) {
        this.vq.multiplyScalar( k );
        this.vp.multiplyScalar( k );
        return this;
    }

    normalize(){
        this.state.normalize();
        //do something to dq;
        //do something to dp;
        return this;
    }


    //the tangent bundle inherits a Riemannian metric from the state space:

    //there is a new possibility here, as we are on the tangent bundle to state space:
//it makes sense to FLOW a state along a tangent direction
//the result of this flow is simply a STATE, the endpoint

    flow(ep){
        this.state.q.add(this.vq.clone().multiplyScalar(ep));
        this.state.p.add(this.vp.clone().multiplyScalar(ep));
        this.normalize();
        return this.state;
    }


}


export{ State, vState, dState };
