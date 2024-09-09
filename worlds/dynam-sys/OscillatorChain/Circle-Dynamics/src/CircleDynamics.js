import {Vector2, Vector3} from "../../../../../3party/three/build/three.module.js";

import CoordArray from "../../../../../code/compute/cpu/components/CoordArray.js";
import {dState} from "../../../../../code/compute/cpu/components/State.js";

import OscillatorDynamics from "../../OscillatorDynamics.js";




class CircleDynamics extends OscillatorDynamics{
    constructor(N) {
        super(N);
    }

    setInitialCondition() {
        //initial velocity of one of the balls is nonzero
        this.states.vel[0].x=2;
    }

    //no change to setMassesAndSprings: leave masses and springs =1

    derive(state){
        let N = state.pos.length;
        // note: N is fixed in this function, can't use "this"
        let vel=new CoordArray();
        let acc=new CoordArray();
        let currentForce;

        //special case: first ball: wraps around to last
        vel.push(state.vel[0].clone());
        currentForce = state.pos[N-1].x - 2.*state.pos[0].x + state.pos[1].x;
        acc.push(new Vector2(currentForce,0));

        //generic case:
        for(let i=1;i<N-1; i++){
            vel.push(state.vel[i].clone());
            currentForce = state.pos[i-1].x -2.*state.pos[i].x + state.pos[i+1].x;
            acc.push(new Vector2(currentForce,0));
        }

        //special case: last ball: wraps around to first
        vel.push(state.vel[N-1].clone());
        currentForce = state.pos[N-2].x - 2.*state.pos[N-1].x + state.pos[0].x;
        acc.push(new Vector2(currentForce,0));

        return new dState(vel,acc);
    }


    getBallPosition(index) {
        //HARD CODED radius
        let rad = 10;

        let pos = (index+1)+this.states.pos[index].x;
        //this is now on the interval [1,N]:
        pos = 2.*Math.PI* pos/this.N;

        return new Vector3(rad*Math.sin(pos),0,rad*Math.cos(pos)-20);
    }

    getBallDensity(index) {
        let density;
        //the end cases
        if(index == 0){
            density = this.states.pos[this.N-1].x-this.states.pos[0].x;
        }
        else if(index == this.N-1){
            density =  this.states.pos[index].x-this.states.pos[0].x;
        }
        else {
            //the deviation from standard density (zero) using neighboring balls:
            density = this.states.pos[index - 1].x - this.states.pos[index + 1].x;
        }
        let scale =2.;
        return 1 + scale * density;
    }

    //addtoScene, addToUI, and tick are all unchanged from default

}

export default CircleDynamics;
