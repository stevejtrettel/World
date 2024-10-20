const defaultStop = function(state){
    return false;
}



class EulerIntegrator{
    constructor (derive, ep=0.1, stop=defaultStop){
        this.derive=derive;
        this.ep=ep;
        this.stop=stop;
    }

    step(state){
        let ds = this.derive(state);
        let newState = state.clone().add(ds.multiplyScalar(this.ep));
        return newState;
    }
}


export default EulerIntegrator;
