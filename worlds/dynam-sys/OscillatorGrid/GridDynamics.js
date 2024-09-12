
import BallGrid from "../../../code/items/basic-shapes/BallGrid.js";
import {RungeKutta} from "../../../code/compute/cpu/RungeKutta.js";
import {dState, State} from "../../../code/compute/cpu/components/State.js";
import {Vector2, Vector3 } from "../../../3party/three/build/three.module.js";
import CoordArray from "../../../code/compute/cpu/components/CoordArray.js";

//a 2 dimensional system coupled harmonic oscillators
// they are in the plane, stored as (x,y) coordinates

class GridDynamics {
    constructor(N,M) {
        this. N = N;
        this.M = M;

        this.balls = new BallGrid(this.N,this.M);
        //right now all the balls are at the origin until we call update() on a set of positions

        //initialize the coordinates: zero at equalibrium positions
        let pos = new CoordArray();
        let vel = new CoordArray();
        for(let i=0; i<this.N; i++) {
            pos.push(new CoordArray());
            vel.push(new CoordArray());
        }
        for(let i=0;i< this.N;i++){
            for(let j=0; j<this.M;j++) {
                pos[i].push(new Vector2(0, 0));
                vel[i].push(new Vector2(0, 0));
            }
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
        this.mass = 1;
        this.springK = 1;
        this.equalib = 0.;
    }

    derive(state) {
        //SET THIS IN EACH VERSION
        //THE DEFAULT VERSION DOES NOTHING
        let vel = new CoordArray();
        let acc = new CoordArray();
        for (let i = 0; i < this.N; i++) {
            for (let j = 0; j < this.M; j++){
                vel[i].push(new Vector2(0, 0));
                acc[i].push(new Vector2(0, 0));
        }
    }
        return new dState(vel,acc);
    }

    getBallPosition(index){
        //index is an array [i,j]
        //SET THIS IN EACH VERSION
        let posX = (index[0]+1)+this.states.pos[index].x;
        let posY = (index[1]+1)+this.states.pos[index].y;
        return new Vector3(posX,0,posY-10);
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
            for(let j=0;j<this.M;j++) {
                this.balls.updatePosition([i,j], this.getBallPosition([i,j]));
                // this.balls.updateColor(i,'0x222222');
                this.balls.updateScale([i,j], this.getBallDensity([i,j]));
            }
        }
    }
}


export default GridDynamics;
