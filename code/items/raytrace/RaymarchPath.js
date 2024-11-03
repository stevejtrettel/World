import LightRay from "./lightray/LightRay.js";
import SphereSeq from "./lightray/SphereSeq.js";

class RaymarchPath{
    constructor(tv) {

        this.maxN = 100;
        this.tv = tv;

        //initialize just from viewpoint direct to light. fix when traced
        this.ray = new LightRay(this.maxN);
        this.ray.balls.mat.color.set(0x000000);

        this.sph = new SphereSeq(this.maxN);

    }

    trace(diorama){

        let distToScene = 0.;
        let rad = [];
        let pts = [];

        //raymarch to the intersection with the scene:
        for(let i = 0; i < 100; i++){

            //this is the safe dist to move:
            distToScene = Math.abs(diorama.sdf(this.tv.pos));

            //store sphere data and
            rad.push(distToScene);
            pts.push(this.tv.pos.clone());

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
        this.ray.setPoints(pts);
        this.sph.setData(pts,rad);

    }


    addToScene(scene) {
        this.ray.addToScene(scene);
        this.sph.addToScene(scene);
    }


    showBounces(N){
        //only show first N bounces
        //take into account how many points there *actually* are in the list
        let showN = Math.min(N,this.ray.pts.length-2);
        this.ray.showBounces(showN);
        this.sph.setVisibility(showN+1);
    }


}

export default RaymarchPath;
