


class pointState{
    constructor(q,p,m){
        this.q=q.clone();
        this.p=p.clone();
        this.mass=m;
    }

    setM(m){
        this.m=m;
    }

    getKinetic(){
        return this.p*this.p/(2*this.mass);
    }

    clone(){
        return  new pointState(this.q.clone(), this.p.clone());
    }

    add( state ){
        this.p.add(state.p);
        return this;
    }

    sub( state ){
        this.p.sub(state.p);
        return this;
    }

    multiplyScalar( s ) {
        this.p.multiplyScalar( s );
        return this;
    }

}



class State {

    constructor(state1, state2){
        this.state1=state1;
        this.state2=state2;
    }

    clone(){
        return new State(this.state1, this.state2);
    }

    add( state ){
        this.state1.add(state.state1);
        this.state2.add(state.state2);
        return this;
    }

    sub( state ){
        this.state1.sub(state.state1);
        this.state2.sub(state.state2);
        return this;
    }

    multiplyScalar( s ) {
        this.state1.multiplyScalar( s );
        this.state2.multiplyScalar( s );
        return this;
    }

    getKinetic(){
        return this.state1.getKinetic()+this.state2.getKinetic();
    }

}










class Spring{
    constructor(k, rest, initialState){
        this.k=k;
        this.rest=rest;
        this.state=initialState;
    }

    setK(k){
        this.k=k;
    }

    setRest(rest){
        this.rest=rest;
    }

    setState(state){
        this.state=state;
    }

    getKinetic(){
        return this.state.getKinetic();
    }

    getPotential(){
        let dist = (this.state.state1.q.clone().sub(this.state.state2.q)).length();
        let delta = (dist-this.rest);
        let pE = 0.5*this.k*delta*delta;
        return pE;
    }


}


function Hamiltonian(spring){
    return spring.getPotential()+spring.getKinetic();
}



function dHdq(spring){

    //get two points
    const ep=0.001;
    let state0=vState.state;
    let state1=vState.flow(ep);

    //evaluate function at these points
    let val0=f(state0);
    let val1=f(state1);

    //get slope of secant
    let deriv = (val1-val0)/ep;
    return deriv;

}
