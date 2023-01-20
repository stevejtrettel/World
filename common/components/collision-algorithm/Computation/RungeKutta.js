
// a class for integrating equations of motion called "integrator" and one specific implementation, Runge Kutta
//derive is a function taking a state to state (now storing velocity and acceleration instead of position and velocity)
//items fed into RungeKutta need to have the following methods available:
//.add, .multiplyScalar, .clone

//implementing the Rk4 Scheme for arbitrary classes that have clone add and multiplyScalar
//will use this possibly on individual states, or on entire DataLists!
class RungeKutta {

    constructor (derive, ep){
        this.derive=derive;
        this.ep=ep;
    }

    //step forwards one timestep
    step(state){

        let k1,k2,k3,k4;
        let temp;

        //get the derivative
        k1 = this.derive(state);
        k1.multiplyScalar(this.ep);

        //get k2
        temp=state.clone().add(k1.clone().multiplyScalar(0.5));
        k2=this.derive(temp);
        k2.multiplyScalar(this.ep);

        //get k3
        temp=state.clone().add(k2.clone().multiplyScalar(0.5));
        k3=this.derive(temp);
        k3.multiplyScalar(this.ep);

        //get k4
        temp=state.clone().add(k3.multiplyScalar(1.));
        k4=this.derive(temp);
        k4.multiplyScalar(this.ep);

        //add up results:
        let total = k1;//scale factor 1
        total.add(k2.multiplyScalar(2));
        total.add(k3.multiplyScalar(2));
        total.add(k4);//scale factor 1
        total.multiplyScalar(1/6);

        //move ahead one step
        return state.clone().updateBy(total);
    }

}


export { RungeKutta };