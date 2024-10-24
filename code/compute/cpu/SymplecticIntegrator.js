import Integrator from "./Integrator.js";

//derive is a function taking a state to dState
//items fed into RungeKutta need to have the following methods available:
//.add, .multiplyScalar, .clone
class SymplecticIntegrator extends Integrator {

    constructor(derive,ep){
        super(derive,ep);
    }

    //step forwards one timestep
    step(state){

        let pos,vel,acc;
        let dt = this.ep;

        // //cube root of 2;
        // let cubrt = 1.25992104989;
        // let coef = 1/(2-cubrt);
        //
        // let a1 = 1/2*coef;
        // let a2 = (1-cubrt)/2*coef;
        // let a3 = (1-cubrt)/2*coef;
        // let a4 = 1/2*coef;
        //
        //
        // let b1 = 1*coef;
        // let b2 = -cubrt*coef;
        // let b3 = 1*coef;
        // let b4 = 0;


        let a1 = 1;
        let a2 = -2/3;
        let a3 = 2/3;
        let b1 = -1/24;
        let b2 = 3/4;
        let b3 = 7/24;


        //step 1:
        acc = this.derive(state).acc;
        vel = state.vel.clone().add(acc.clone().multiplyScalar(b1*dt));
        pos = state.pos.clone().add(vel.clone().multiplyScalar(a1*dt));
        state.pos=pos;
        state.vel=vel;

        //step 2:
        acc = this.derive(state).acc;
        vel = state.vel.clone().add(acc.clone().multiplyScalar(b2*dt));
        pos = state.pos.clone().add(vel.clone().multiplyScalar(a2*dt));
        state.pos=pos;
        state.vel=vel;

        //step 3:
        acc = this.derive(state).acc;
        vel = state.vel.clone().add(acc.clone().multiplyScalar(b3*dt));
        pos = state.pos.clone().add(vel.clone().multiplyScalar(a3*dt));
        state.pos=pos;
        state.vel=vel;

        //step 4:
        // acc = this.derive(state).acc;
        // vel = state.vel.clone().add(acc.clone().multiplyScalar(b4*dt));
        // pos = state.pos.clone().add(vel.clone().multiplyScalar(a4*dt));
        // state.pos=pos;
        // state.vel=vel;

        return state;

    }

}


export default SymplecticIntegrator;
