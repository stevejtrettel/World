import BallList from "../../../code/items/basic-shapes/BallList.js";
import {Vector3} from "../../../3party/three/build/three.module.js";


class OscillatorEigenmodes{
    constructor(N) {
        this. N = N;
        this.balls = new BallList(this.N);
        //right now all the balls are at the origin until we call update() on a set of positions
        //initialize the coordinates: zero at equalibrium positions
        this.pos = [];
        for(let i=0;i<this.N; i++){
            this.pos.push(0);
        }

        //set the eigenmode to be used:
        this.mode = 1;
        this.computeEigenStuff(this.mode);

    }

    computeEigenStuff(mode){
        //SET THIS IN EACH VERSION

        let eigenval = 1.;
        this.eigenval = eigenval;

        this.eigenfunc = function(time){
            //make sure this is actually right...
            return Math.sin(Math.sqrt(eigenval)*time);
        }

        this.eigenvec=[];


    }

    getEigenMode(time){
        //SET THIS IN EACH VERSION
        let pos = [];
        let amp = this.eigenfunc(time);

        for(let i=0;i<this.N;i++){
            pos.push(amp*this.eigenvec[i]);
        }

        return pos;
    }

    getBallPosition(){
        //SET THIS IN EACH VERSION
        //take the coordinates used in solving the ODE and convert them to actual Vec3 and return
        let pos = (index+1)+this.pos[index].x;
        return new Vector3(pos,0,-10);
    }

    getBallDensity(){
        //SET THIS IN EACH VERSION
        return 1;
    }

    addToScene(scene){
        this.balls.addToScene(scene);
    }

    addToUI(ui){}

    tick(time,dTime){

        //compute a timestep forwards
        this.pos = this.getEigenMode(time);

        //update the ball positions
        for(let i=0;i<this.N;i++){
            this.balls.updatePosition(i,this.getBallPosition(i));
            // this.balls.updateColor(i,'0x222222');
            this.balls.updateScale(i,this.getBallDensity(i));
        }

    }
}


export default OscillatorEigenmodes;
