import{ State, vState, dState } from "./stateSpace.js";


//the hamiltonian is going to be a function defined on state space
//it takes in a state (q, p) and outputs a real number.

//to get started we need to be able to take partial derivatives of functions on state space
//that means, given a function f and a tangent vector (state, vq,vp) based at state, we need to compute
//the partial of f at this point state, in the given direction
//the result is a real number, as f is real-valued
function partialDerivative(f,vState){

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

//from any such a function we can produce its total derivative, which is a 1 form and thus lives in the space dState
//thus, the result should be a function state -> dState
function totalDerivative(f, state){

        //choose a basis for the tangent bundle
        let basis = state.getTangentBasis();

        //use this to compute all the necessary directional derivatives
        let derivCoefs=[];
        let deriv;
        for(let i=0;i<basis.length;i++){
            deriv=partialDerivative(f,basis[i]);
            derivCoefs.push(deriv);
        }

        //this is just the list of partial derivatives! This is nothing intrinsic....... :(
        //how do I get the corresponding cotangent vectors to add them up against?
        return derivCoefs;

}




//the symplectic form provides an isomorphism from dState to vState.
//apply that here: this is a function taking 1-form fields to vector fields
function symplecticRotate(dState){

    let state=dState.state;
    //figure out how to apply the symplectic form at state to this 1-form,

    //if nothing is weird, then its just a switching of q and p with a minus:
    let vq=dState.dp;
    let vp=-dState.dq;

    let vS = new vState(state, vq, vp);
    return vS;

}



function hamiltonianFlow(){

}




export{}
