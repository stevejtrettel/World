import LightRay from "./lightray/LightRay.js";


class PhongPath{
    constructor(tv,pointLight) {

        this.tv = tv;

        this.pointOrigin = this.tv.pos.clone();
        this.pointScene=this.tv.pos.clone();
        this.pointLight = pointLight;

        //initialize just from viewpoint direct to light. fix when traced
        this.traj = new LightRay(3);

    }


    trace(diorama){

        //raytrace to the intersection with the scene:
        let distToScene=0.;

        for(let i = 0; i < 100; i++){
            //this is the safe dist to move:
            distToScene = Math.abs(diorama.sdf(this.tv.pos));
            //move ahead this much
            this.tv.flow(distToScene);
            //did we hit something?
            if (distToScene< 0.0005){
                this.tv.keepGoing = true;
                //now we are at a point on the scene: save it
                break;
            }
            if(this.tv.pos.length()>20.){
                this.tv.keepGoing = false;
                break;
            }
        }

        //update the trajectory
        this.pointScene = this.tv.pos.clone();
        this.traj.setPoints([this.pointOrigin,this.pointScene, this.pointLight]);

    }

    addToScene(scene) {
        this.traj.addToScene(scene);
    }



}


export default PhongPath;
