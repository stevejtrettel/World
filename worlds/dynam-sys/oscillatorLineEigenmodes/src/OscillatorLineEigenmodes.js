
import BallChain from "../../../../code/items/basic-shapes/BallString.js";
import {RungeKutta} from "../../../../code/compute/cpu/RungeKutta.js";
import {dState, State} from "../../../../code/compute/cpu/components/State.js";
import {MeshPhysicalMaterial, SphereGeometry, Vector2, Vector3, Mesh} from "../../../../3party/three/build/three.module.js";
import CoordArray from "../../../../code/compute/cpu/components/CoordArray.js";

//a 1 dimensional line of coupled harmonic oscillators

class OscillatorLineEigenmodes {
    constructor(N) {

        this. N = N;
        //Need a way to set the initial condition!

        this.balls = new BallChain(this.N);
        //right now all the balls are at the origin until we call update() on a set of positions

        //an array of NUMBERS: for the displacement of each ball
        this.pos = [];
        //initialize to all zero:
        for(let i=0;i<this.N;i++){
            this.pos.push(0);
        }

        //the eigenvalues and eigenvectors for parameter N: this sets this.eigenvectors and this.eigenvalues
        this.computeEigenStuff();
        this.eigenstate = 1; //the eigenstate to display

        ///some extra graphics:
        let sph = new SphereGeometry(0.25,32,16);
        let sphMat = new MeshPhysicalMaterial({color: 0x000000, clearcoat:true});

        this.startBall = new Mesh(sph,sphMat);
        this.startBall.position.set(-10,0,-10);
        this.endBall = new Mesh(sph,sphMat);
        this.endBall.position.set(10.5,0,-10);

    }

    computeEigenStuff(){
        this.eigenvalues = [];
        this.eigenvectors = [];
    }

    computeStandingWave(time){
        let evector = this.eigenvectors[this.eigenstate];
        let evalue = this.eigenvalues[this.eigenstate];

        let amp = Math.sin(evalue*time);
        this.pos = [];
        for(let i=0;i<this.N;i++){
            this.pos.push(evector[i]*amp);
        }
    }


    getBallPositions(){
        //take the coordinates used in solving the ODE and convert them to actual positions along a line
        //then convert these to Vec3 and return an array of them

        //HARD CODED MAX/MIN:
        let range = 20;

        let posArray = [];
        for(let i=0;i<this.N;i++){

            let pos = (i+1)+this.pos[i];
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
    }

    addToUI(ui){

    }

    tick(time,dTime){

        //compute a timestep forwards
        this.computeStandingWave(time);

        //update the ball positions
       this.balls.update( this.getBallPositions() );
    }
}


export default OscillatorLineEigenmodes;
