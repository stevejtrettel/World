import {
    Mesh,
    MeshPhysicalMaterial,
    SphereGeometry,
    Vector2,
    Vector3
} from "../../../../../3party/three/build/three.module.js";

import CoordArray from "../../../../../code/compute/cpu/components/CoordArray.js";
import {dState} from "../../../../../code/compute/cpu/components/State.js";

import GridDynamics from "../../GridDynamics.js";



class Square3D extends GridDynamics{
    constructor(N) {
        super(N,N);

        //its a square so N and M are the same!
        //we will just use this.N for everything

    }

    setInitialCondition() {

        //set the overall size:
        this.size = 20;

        //position all the balls in space:
        //what is the spring equalib length? range*1/N and range*1/M
        for(let i=0;i<this.N;i++) {
            for (let j = 0; j < this.N; j++) {
                let x = this.size * (i / this.N - 0.5);
                let y = this.size * (j / this.N - 0.5);
                this.states.pos[i][j] = new Vector3(x, 0, y);
                this.states.vel[i][j] = new Vector3(0, 0, 0);
            }
        }

        //initial velocity of one of the balls is nonzero
        //this.states.vel[5][5].y=20;
    }

    //no change to setMassesAndSprings: leave masses and springs =1
    // setMassesAndSprings() {
    //     this.equalib = this.size / this.N;
    //     this.springK = 3.;
    // }

    derive(state){

        let N = state.pos.length;

        let vel=new CoordArray();
        let acc=new CoordArray();
        let force;

        //fill it with zeroes
        for(let i=0;i<N;i++){
            vel.push(new CoordArray());
            acc.push(new CoordArray());
        }
        for(let i=0; i<N;i++){
            for(let j=0;j<N;j++){
                vel[i].push(new Vector3(0,0,0));
                acc[i].push(new Vector3(0,0,0));
            }
        }

        //leave zeroes for the boundary terms.
        //on the inside, coupled oscillators

        let equalib = 20./N;

        for(let i=1;i<N-1; i++) {
            for (let j = 1; j < N - 1; j++) {
                vel[i][j]= state.vel[i][j].clone();

                let k =100;
                let p = state.pos[i][j].clone();

                let d1 = state.pos[i][j-1].clone().sub(p);
                let m1 = d1.length()-equalib;
                let f1 = d1.normalize().multiplyScalar(k*m1);

                let d2 = state.pos[i][j+1].clone().sub(p);
                let m2 = d2.length() - equalib;
                let f2 = d2.normalize().multiplyScalar(k*m2);

                let d3 = state.pos[i-1][j].clone().sub(p);
                let m3 = d3.length() - equalib;
                let f3 = d3.normalize().multiplyScalar(k*m3);

                let d4 = state.pos[i+1][j].clone().sub(p);
                let m4 = d4.length() - equalib;
                let f4 = d4.normalize().multiplyScalar(k*m4);

                let force = f1.add(f2).add(f3).add(f4);
                force.add(new Vector3(0,-0.1,0));

                acc[i][j] = force;
            }
        }

        return new dState(vel,acc);
    }


    getBallPosition(index) {

        let pos = this.states.pos[index[0]][index[1]];
        return pos.clone();

    }


    getBallDensity(index) {
       return 1;
    }

    // addToScene, addToUI and tick are all unchanged from default

}

export default Square3D;
