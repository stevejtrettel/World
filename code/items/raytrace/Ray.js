import RodBallChain from "../basic-shapes/RodBallChain.js";
import TVec from "./TVec.js";

class Ray{
    constructor(tv,N=50) {
        this.N = N;
        this.tv = tv;


        //initialize the trajectory with all points at tv.pos
        this.pts = [];
        for(let i=0;i<this.N;i++){
            this.pts.push(this.tv.pos);
        }

        this.traj = new RodBallChain(this.pts);
    }

    addToScene(scene){
        this.traj.addToScene(scene);
    }

    trace(diorama){
        //given our diorama, run a trace to get points
        this.pts = [];
        let tv = new TVec(this.tv.pos.clone(),this.tv.dir.clone());
        for(let i=0;i<this.N;i++){
            tv = diorama.stepForward(tv);
            this.pts.push(tv.pos);

            //if we left the scene
            if(tv.pos.length()>100.){
                break;
            }
        }

        this.traj.setPoints(this.pts);
    }

}

export default Ray;
