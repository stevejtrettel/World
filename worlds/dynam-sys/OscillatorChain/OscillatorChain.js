import BallChain from "../../../code/items/basic-shapes/BallChain.js";
import CoordArray from "../../../code/compute/cpu/components/CoordArray.js";
import {Vector2} from "../../../3party/three/build/three.module.js";
import {State} from "../../../code/compute/cpu/components/State.js";


class OscillatorChain{
    constructor(N) {
        this.N = N;
        this.initialize();

    }

    initialize(){
        this.balls = new BallChain(this.N);

        let pos = new CoordArray();
        let vel = new CoordArray();
        for(let i=0; i<this.N; i++){
            //ridiculous: this system is 1D but everything more generally is built for vectors,
            //so will use a vec2 and only care about the x coordinate
            pos.push(new Vector2(0,0));
            vel.push(new Vector2(0,0));
        }
        //zeoed out states
        this.states = new State(pos,vel);

        //CUSTOM FUNCTION TO BE DEFINED FOR EACH
        this.buildDynamics();

        //specify the startball and endball:


    }

    buildDynamics(){
        //CUSTOM
        //set an initial condition, add an integrator, etc

    }

    getBallPositions(){
        //CUSTOM

    }


    addToScene(scene){
        this.balls.addToScene(scene);
        scene.add(this.startBall);
        scene.add(this.endBall);
    }

    addToUI(ui){

    }

    tick(time,dTime){
        //evolve state one timestep into the future

        //compute a timestep forwards
        this.states = this.integrator.step(this.states);

        //update the ball positions
        this.balls.update( this.getBallPositions() );
    }

}


export default OscillatorChain;
