import LightRay from "./lightray/LightRay.js";
import TVec from "./TVec.js";

import {reflectIn} from "./interaction/scatter.js"

class Path {
    constructor(tv,N=50) {

        this.N = N;
        this.tv = tv;

        //some useful booleans
        this.hitLight = false;
        this.subsurface = false;

        //the current object in case we need it
        this.currentObject = undefined;

        this.traj = new LightRay(this.N);
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


    interact(diorama){

        //get the current object (if one exists) at the location
        this.currentObject = diorama.getObjectAt(this.tv.pos);
        if(this.currentObject === undefined){ this.tv.keepGoing = false; }
        //stop if we hit a light
        else if( this.currentObject.isLight ){
            this.tv.keepGoing = false;
            this.hitLight = true;
        }

        //otherwise, interact and get ready for next raymarch
        if(this.tv.keepGoing){

            //JUST DO A PURE REFLECTION
            let currentNormal = this.currentObject.getNormal(this.tv.pos);
            this.tv = reflectIn(this.tv,currentNormal);

            //move a little so you don't register as being on the object
            this.tv.pos.add(currentNormal.dir.multiplyScalar(0.002));
            this.tv.flow(0.002);
        }

    }


    sss(obj){
        //subsurface scattering through an object


    }


    stepForward(diorama){

        //raymarch to the next intersection
        this.raymarch(diorama);

        //add the point to the list!
        this.pts.push(this.tv.pos.clone());

        //interact with the location:
        this.interact(diorama);

        //if we need to subsurface scater, do it
        if(this.subsurface){
            this.sss(this.currentObject);
        }
    }

    trace(diorama){

        this.hitLight = false;

        this.pts = [];
        //add the starting point
        this.pts.push(this.tv.pos.clone());

        for(let i=0;i<this.N;i++){

            //step forward and save the new point
            //(or points, if we subsurface scatter)
            this.stepForward(diorama);

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
