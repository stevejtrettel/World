import { Integrator } from "./Integrator.js";

//derive is a function taking a state to dState
// this version of the algorithm takes a function derive that also allows a set of parameters:
// //this way you can change the integrator live using a UI, etc...

//items fed into RungeKutta need to have the following methods available:
//.add, .multiplyScalar, .clone


class RungeKuttaParams extends Integrator{

    //slope is a function taking in x,y,time and spitting out a real number yPrime:
    constructor(derive,ep){
        super(derive, ep);
    }

    //step forwards one timestep
    //the step function also takes parameters here! So they need to be fed in in the implementation using this
    step(pos,params){

        let k1,k2,k3,k4;
        let temp;

        //get the derivative
        k1 =  this.derive(pos,params);
        k1.multiplyScalar(this.ep);

        //get k2
        temp=pos.clone().add(k1.clone().multiplyScalar(0.5));
        k2 =  this.derive(temp,params);
        k2.multiplyScalar(this.ep);

        //get k3
        temp=pos.clone().add(k2.clone().multiplyScalar(0.5));
        k3 =  this.derive(temp,params);
        k3.multiplyScalar(this.ep);

        //get k4
        temp=pos.clone().add(k3.multiplyScalar(1.));
        k4 =  this.derive(temp,params);
        k4.multiplyScalar(this.ep);

        //add up results:
        let total = k1;//scale factor 1
        total.add(k2.multiplyScalar(2));
        total.add(k3.multiplyScalar(2));
        total.add(k4);//scale factor 1
        total.multiplyScalar(1/6);

        //move ahead one step
        let nextPos = pos.clone().add(total);

        return nextPos;
    }

    setDerive(eqn){
        this.derive=eqn;
    }
}


export default RungeKuttaParams;