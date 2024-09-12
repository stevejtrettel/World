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



class RectangleDynamics extends GridDynamics{
    constructor(N,M) {
        super(N,M);
    }

    setInitialCondition() {
        //initial velocity of one of the balls is nonzero
        this.states.vel[5][5].y=3;
    }

    //no change to setMassesAndSprings: leave masses and springs =1

    derive(state){
        let N = state.pos.length;
        let M = state.pos[0].length;

        let vel=new CoordArray();
        let acc=new CoordArray();
        let force;

        //fill it with zeroes
        for(let i=0;i<N;i++){
            vel.push(new CoordArray());
            acc.push(new CoordArray());
        }
        for(let i=0; i<N;i++){
            for(let j=0;j<M;j++){
                vel[i].push(new Vector2(0,0));
                acc[i].push(new Vector2(0,0));
            }
        }

        //leave zeroes for the boundary terms.
        //on the inside, coupled oscillators
        for(let i=1;i<N-1; i++) {
            for (let j = 1; j < M - 1; j++) {
                vel[i][j]= state.vel[i][j].clone();

                force = state.pos[i][j-1].clone();
                force.add(state.pos[i][j+1]);
                force.add(state.pos[i+1][j]);
                force.add(state.pos[i-1][j]);
                force.add(state.pos[i][j].clone().multiplyScalar(-4));
                //xsforce.add(new Vector2(0.2,0));
                acc[i][j] = force;
            }
        }

        return new dState(vel,acc);
    }


    getBallPosition(index) {

        //HARD CODED range
        let range = 20;

        //let displacement = 5.*this.states.pos[index[0]][index[1]].length();

        //index is an array [i,j]
        //SET THIS IN EACH VERSION
        let posX = (index[0]+1)+this.states.pos[index[0]][index[1]].x;
        let posY = (index[1]+1)+this.states.pos[index[0]][index[1]].y;
        posX = posX/this.N-0.5;
        posX *= range;
        posY = posY/this.M-0.5;
        posY *= range;

        return new Vector3(posX, 0,posY-10);

    }


    getBallDensity(index) {

        let densityX,densityY;
        let i = index[0];
        let j=index[1];

        //the end cases
        if(i==0 || i== this.N-1 || j==0 || j== this.M-1){
            return 1;
        }

        //the deviation from standard density (zero) using neighboring balls:
        densityX = this.states.pos[i-1][j].clone().sub( this.states.pos[i+1][j]);
        densityY = this.states.pos[i][j-1].clone().sub( this.states.pos[i][j+1]);

        let scale =3.;
        return 1 + scale * Math.sqrt(densityX.lengthSq()+ densityY.lengthSq());
    }

    // addToScene, addToUI and tick are all unchanged from default

}

export default RectangleDynamics;
