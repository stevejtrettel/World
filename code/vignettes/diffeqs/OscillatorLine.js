
import BallString from "../../items/basic-shapes/BallString.js";
import {RungeKutta} from "../../compute/cpu/RungeKutta.js";
import {dState, State} from "../../compute/cpu/components/State.js";
import {MeshPhysicalMaterial, SphereGeometry, Vector2, Vector3, Mesh} from "../../../3party/three/build/three.module.js";
import CoordArray from "../../compute/cpu/components/CoordArray.js";

//a 1 dimensional line of coupled harmonic oscillators

class OscillatorLine{
    constructor(N) {

        this. N = N;
        //Need a way to set the initial condition!

        this.balls = new BallString(this.N);
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
        vel[30].x=2;

        this.states = new State(pos,vel);

        //the integrator do do calculations: need to write a derive() function

        let derive = function(state){
            // note: N is fixed in this function, can't use "this"
            let vel=new CoordArray();
            let acc=new CoordArray();
            let currentForce;

            //special case: first ball:
            vel.push(state.vel[0].clone());
            currentForce = - 2.*state.pos[0].x + state.pos[1].x;
            acc.push(new Vector2(currentForce,0));

            //generic case:
            for(let i=1;i<N-1; i++){
                vel.push(state.vel[i].clone());
                currentForce = state.pos[i-1].x -2.*state.pos[i].x+state.pos[i+1].x;
                acc.push(new Vector2(currentForce,0));
            }

            //special case: last ball
            vel.push(state.vel[N-1].clone());
            currentForce = state.pos[N-2].x - 2.*state.pos[N-1].x;
            acc.push(new Vector2(currentForce,0));


            return new dState(vel,acc);
        }

        this.integrator = new RungeKutta(derive, 0.05);




        ///some extra graphics:
        let sph = new SphereGeometry(0.25,32,16);
        let sphMat = new MeshPhysicalMaterial({color: 0x000000, clearcoat:true});

        this.startBall = new Mesh(sph,sphMat);
        this.startBall.position.set(-10,0,-10);
        this.endBall = new Mesh(sph,sphMat);
        this.endBall.position.set(10.5,0,-10);
        // this.spring;

    }


    getBallPositions(){
        //take the coordinates used in solving the ODE and convert them to actual positions along a line
        //then convert these to Vec3 and return an array of them

        //HARD CODED MAX/MIN:
        let range = 20;

        let posArray = [];
        for(let i=0;i<this.N;i++){

            let pos = (i+1)+this.states.pos[i].x;
            //let pos = (i+1);//for vertical
            pos = pos/this.N-0.5;
            pos *= range;
            posArray.push(new Vector3(pos,0,-10));
            //posArray.push(new Vector3(pos,this.states.pos[i].x,-10));//for vertical
        }
        return posArray;
    }


    addToScene(scene){
        this.balls.addToScene(scene);
        scene.add(this.startBall);
        scene.add(this.endBall);
        scene.add(this.spring);
    }

    addToUI(ui){

    }

    tick(time,dTime){

        //compute a timestep forwards
        this.states = this.integrator.step(this.states);

        //update the ball positions
       this.balls.update( this.getBallPositions() );
    }
}


export default OscillatorLine;
