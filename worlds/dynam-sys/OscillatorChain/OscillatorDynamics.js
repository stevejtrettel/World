
import BallChain from "../../../code/items/basic-shapes/BallChain.js";
import {RungeKutta} from "../../../code/compute/cpu/RungeKutta.js";
import {dState, State} from "../../../code/compute/cpu/components/State.js";
import {Vector2, Vector3 } from "../../../3party/three/build/three.module.js";
import CoordArray from "../../../code/compute/cpu/components/CoordArray.js";

//a 1 dimensional system coupled harmonic oscillators

class OscillatorDynamics {
    constructor(N) {
        this. N = N;

        this.balls = new BallChain(this.N);
        //right now all the balls are at the origin until we call update() on a set of positions

        //initialize the coordinates: zero at equalibrium positions
        let pos = new CoordArray();
        let vel = new CoordArray();
        for(let i=0; i<this.N; i++){
            //ridiculous hack: my numerical integrators are all built for vectors, so will put vectors here even tho
            //i only need a number
            pos.push(new Vector2(0,0));
            vel.push(new Vector2(0,0));
        }
        this.states = new State(pos,vel);

        this.setMassesAndSprings();
        this.setInitialCondition();
        this.integrator = new RungeKutta(this.derive, 0.05);

    }

    setInitialCondition(){
        //SET THIS IN EACH VERSION
    }

    setMassesAndSprings(){
        this.masses=[];
        this.springs=[];
        //default: all are 1
        for(let i=0;i<this.N;i++){
            this.masses.push(1);
            this.springs.push(1);
        }
    }

    derive(state){
        //SET THIS IN EACH VERSION
        //THE DEFAULT VERSION DOES NOTHING
        let N = state.pos.length;
        let vel=new CoordArray();
        let acc=new CoordArray();
        for(let i=1;i<N-1; i++) {
            vel.push(new Vector2(0,0));
            acc.push(new Vector2(0,0));
        }
        return new dState(vel,acc);
    }

    getBallPosition(index){
        //SET THIS IN EACH VERSION
        //take the coordinates used in solving the ODE and convert them to actual Vec3 and return
        let pos = (index+1)+this.states.pos[index].x;
        return new Vector3(pos,0,-10);
    }

    getBallDensity(index){
        //SET THIS IN EACH VERSION
        return 1;
    }

    addToScene(scene){
        //rewrite if scene has extra stuff in it
        this.balls.addToScene(scene);
    }

    addToUI(ui){
    }

    tick(time,dTime){

        //compute a timestep forwards
        this.states = this.integrator.step(this.states);

        //update the ball positions
        for(let i=0;i<this.N;i++){
            this.balls.updatePosition(i,this.getBallPosition(i));
            // this.balls.updateColor(i,'0x222222');
            this.balls.updateScale(i,this.getBallDensity(i));
        }
    }
}


export default OscillatorDynamics;
