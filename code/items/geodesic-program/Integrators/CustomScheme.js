
const defaultStop = function(state){
    return false;
}


//scheme is a function state->state giving directly the new output

class CustomSchemeIntegrator{
    constructor(scheme, ep=0.1, stop=defaultStop) {
        this.scheme = scheme;
        this.ep = ep;
        this.stop = stop;
    }

    step(state){
        if(this.stop(state)){
            return state;
        }
        else {
            let newState = this.scheme(state, this.ep);
            return newState;
        }
    }
}

export default CustomSchemeIntegrator;
