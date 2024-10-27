import LightRay from "./lightray/LightRay.js";
import TVec from "./TVec.js";

//draws a line from viewer to scene
//then finds direction to lightsource and traces along it:

class PhongShadowPath{
    constructor(tv,pointLight) {

        this.tv = tv;
        this.pointLight = pointLight;
        this.lightRadius = 0.5;

        this.pointOrigin = this.tv.pos.clone();
        this.pointScene=this.tv.pos.clone();
        this.pointFinish = this.pointLight;


        //initialize just from viewpoint direct to light. fix when traced
        this.traj = new LightRay(3);

    }

    raymarch(diorama){
        //march to intersection and return distance
        //raytrace to the intersection with the scene:
        let distToScene=0.;
        let totalDist = 0.;

        for(let i = 0; i < 100; i++){
            //this is the safe dist to move:
            distToScene = Math.abs(diorama.sdf(this.tv.pos));
            //move ahead this much
            this.tv.flow(distToScene);
            totalDist += distToScene;

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

        return totalDist;
    }


    trace(diorama){

        //raytrace to the intersection with the scene:
        this.raymarch(diorama);
        this.pointScene = this.tv.pos.clone();

        //reset TVec to point towards light:
        let dir = this.pointLight.clone().sub(this.pointScene);
        // measure the distance to the light source
        let distToLight = dir.length();

        //reset tv
        dir.normalize();
        this.tv = new TVec(this.pointScene,dir);
        //move a little bit so we don't get stuck
        this.tv.flow(0.003);


        //raymarch along this new ray, see how long it takes
        let marchDist = this.raymarch(diorama);
        this.pointFinish = this.tv.pos.clone();

        //update the trajectory
        this.traj.setPoints([this.pointOrigin,this.pointScene, this.pointFinish]);

        //figure out if we hit a light
        let hitLight = distToLight-this.lightRadius -0.1 < marchDist;
        this.traj.hitLight(hitLight);

    }


    addToScene(scene) {
        this.traj.addToScene(scene);
    }


}


export default PhongShadowPath;
