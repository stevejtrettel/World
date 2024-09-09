import {
    Mesh,
    MeshPhysicalMaterial,
    SphereGeometry,
    Vector2,
    Vector3
} from "../../../../../3party/three/build/three.module.js";

import CoordArray from "../../../../../code/compute/cpu/components/CoordArray.js";
import {dState} from "../../../../../code/compute/cpu/components/State.js";

import OscillatorDynamics from "../../OscillatorDynamics.js";



class IntervalDynamics extends OscillatorDynamics{
    constructor(N) {
        super(N);

        ///some extra graphics:
        let sph = new SphereGeometry(0.25,32,16);
        let sphMat = new MeshPhysicalMaterial({color: 0x000000, clearcoat:true});

        this.startBall = new Mesh(sph,sphMat);
        this.startBall.position.set(-10,0,-10);
        this.endBall = new Mesh(sph,sphMat);
        this.endBall.position.set(10.5,0,-10);
    }

    setInitialCondition() {
        //initial velocity of one of the balls is nonzero
        this.states.vel[Math.floor(this.N/2)].x=2;
    }

    //no change to setMassesAndSprings: leave masses and springs =1

    derive(state){
        let N = state.pos.length;
        // note: N is fixed in this function, can't use "this"
        let vel=new CoordArray();
        let acc=new CoordArray();
        let currentForce;

        //special case: first ball tied to fixed end
        vel.push(state.vel[0].clone());
        currentForce = - 2.*state.pos[0].x + state.pos[1].x;
        acc.push(new Vector2(currentForce,0));

        //generic case:
        for(let i=1;i<N-1; i++){
            vel.push(state.vel[i].clone());
            currentForce = state.pos[i-1].x -2.*state.pos[i].x + state.pos[i+1].x;
            acc.push(new Vector2(currentForce,0));
        }

        //special case: last ball tied to fixed end
        vel.push(state.vel[N-1].clone());
        currentForce = state.pos[N-2].x - 2.*state.pos[N-1].x;
        acc.push(new Vector2(currentForce,0));

        return new dState(vel,acc);
    }


    getBallPosition(index) {
        //HARD CODED range
        let range = 20;

        let pos = (index+1)+this.states.pos[index].x;
        //let pos = (i+1);//for vertical
        pos = pos/this.N-0.5;
        pos *= range;

        return new Vector3(pos,0,-10);
    }


    getBallDensity(index) {
        let density;
        //the end cases
        if(index == 0){//the first ball
            density = -this.states.pos[0].x;
        }
        else if(index == this.N-1){//the last ball
            density =  this.states.pos[index].x;
        }
        else {
            //the deviation from standard density (zero) using neighboring balls:
            density = this.states.pos[index - 1].x - this.states.pos[index + 1].x;
        }
        let scale =2.;
        return 1 + scale * density;
    }

    addToScene(scene) {
        super.addToScene(scene);
        scene.add(this.startBall);
        scene.add(this.endBall);
    }

    // addToUI and tick are all unchanged from default

}

export default IntervalDynamics;
