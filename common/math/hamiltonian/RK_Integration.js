
//perform Runge Kutta integration of a vector field defined on state space
//vecField is a function taking state to vState
class RK4 {

    constructor(vecField,ep){
        this.vecField=vecField;
        this.ep=ep;

    }

    //step forwards one timestep
    step(state){

        let k1,k2,k3,k4;
        let temp;

        //find the tangent vector at the starting location: call it k1
        k1 = this.vecField(state);
        k1.multiplyScalar(this.ep);

        //flow the original state along this tangent vector for time 1/2.
        //this gives a new state called temp
        temp=k1.flow(0.5);
        //find the vector in vecField that's based at this point:
        k2=this.vecField(temp);
        k2.multiplyScalar(this.ep);

        //because distances are small, we think of this vector as in a "very nearby" tangent space to the original
        //thus we can treat it as a vector at state, so it has the same basepoint as k1:
        k2.state=state.clone();
        k2.normalize();

        //now, we can repeat the procedure: we flow along k2 to get a new point temp, for time step 1/2
        temp=k2.flow(0.5);
        //we again find the vector field which is based at this point:
        k3=this.vecField(temp);
        k3.multiplyScalar(this.ep);
        //and treat k3 as tho its actually based at the original state:
        k3.state=state.clone();
        k3.normalize();

        //we repeat the procedure one final time, now flowing along this direction for time step 1 (NOT 1/2)
        temp=k3.flow(1.);
        k4=this.vecField(temp);
        k4.multiplyScalar(this.ep);
        k4.state=state.clone();
        k4.normalize();

        //add up results: all tangent vectors are based at state, so
        //(modulo us moving them there in the first place) this makes sense
        let total = k1;//scale factor 1
        total.add(k2.multiplyScalar(2));
        total.add(k3.multiplyScalar(2));
        total.add(k4);//scale factor 1
        total.multiplyScalar(1/6);


        //now we FINALLY have the actual tangent vector at state that we should be flowing along:
        //so, flow in this direction, and we are done.
        let nextState = total.flow(1.);
        return nextState;
    }

}


export { RK4 };
