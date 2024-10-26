import LightRay from "./lightray/LightRay.js";
import TVec from "./TVec.js";

import reflectIn from "./interaction/reflect.js";

class Path {
    constructor(tv,N=50) {

        this.N = N;
        this.tv = tv;
        this.hitLight = false;

        //initialize the trajectory with all points at tv.pos
        this.pts = [];
        for(let i=0;i<this.N;i++){
            this.pts.push(this.tv.pos);
        }

        this.traj = new LightRay(this.pts);
    }


    addToScene(scene){
        this.traj.addToScene(scene);
    }


    raymarch(diorama){
        //march to next intersection in the scene:
        let distToScene=0.;

        for(let i = 0; i < 100; i++){

            //this is the safe dist to move:
            distToScene = Math.abs(diorama.sdf(this.tv.pos));

            //move ahead this much
            this.tv.flow(distToScene);

            //did we hit something?
            if (distToScene< 0.0005){
                this.tv.keepGoing = true;
                break;
            }

            if(this.tv.pos.length()>20.){
                this.tv.keepGoing = false;
                break;
            }

        }
    }


    stepForward(diorama){

        //raymarch to the next intersection
        this.raymarch(diorama);

        //get the current object (if one exists) at the location
        let currentObject = diorama.getObjectAt(this.tv.pos);
        if(currentObject === undefined){ this.tv.keepGoing = false; }
        //stop if we hit a light
        else if( currentObject.isLight ){
            this.tv.keepGoing = false;
            this.hitLight = true;
        }

        //otherwise, interact and get ready for next raymarch
        if(this.tv.keepGoing){
                let currentNormal = currentObject.getNormal(this.tv.pos);
                this.tv = reflectIn(this.tv,currentNormal);

                //move a little so you don't register as being on the object
                this.tv.pos.add(currentNormal.dir.multiplyScalar(0.002));
                this.tv.flow(0.002);
        }

    }

    trace(diorama){

        this.hitLight = false;

        this.pts = [];
        //add the starting point
        this.pts.push(this.tv.pos.clone());

        for(let i=0;i<this.N;i++){

            //step forward and save the new point
            this.stepForward(diorama);
            this.pts.push(this.tv.pos.clone());

            //stop if we are told to
            if(!this.tv.keepGoing){
                break;
            }
        }

        //draw this trajectory
        this.traj.setPoints(this.pts);
        this.traj.hitLight(this.hitLight);

    }


    showBounces(N){
        //only show first N bounces
        //take into account how many points there *actually* are in the list
        let showN = Math.min(N,this.pts.length-2);
        this.traj.showBounces(showN);
    }


}

export default Path;
