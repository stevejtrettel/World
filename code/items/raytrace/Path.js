import RodBallChain from "../basic-shapes/RodBallChain.js";
import TVec from "./TVec.js";

class Path {
    constructor(tv,N=50) {
        this.N = N;
        this.tv = tv;
        this.totalDist =0.;

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



    stepForward(diorama){

        let currentMat;
        let currentNormal;

        //take to the next point in the diorama
        let totalDist=0.;
        let distToScene=0.;

        for(let i = 0; i < 100; i++){

            distToScene = Math.abs(diorama.sdf(this.tv.pos));

            //move ahead this much
            this.tv.flow(distToScene);
            totalDist += distToScene;


            //did we hit something?
            if (distToScene< 0.001){
                totalDist = totalDist+distToScene;
                //we are at some object! Let's figure out which one:

                for(let i=0; i< diorama.objList.length; i++){

                    if(diorama.objList[i].at(this.tv.pos)){
                        // console.log('got it!:');
                        // console.log(i);
                        // console.log(this.objList[i]);
                        if(diorama.objList[i].isLight){
                            this.tv.keepGoing=false;
                        }

                        currentMat = diorama.objList[i].mat;
                        currentNormal = diorama.objList[i].getNormal(this.tv.pos);

                        //get out of the object-search-loop
                        break;
                    }
                }


                //REFLECT IN THE SURFACE
                //IDK WHY THIS ISNT WORKING AS A METHOD ON TVEC
                let proj = this.tv.dir.dot(currentNormal.dir);
                let dir = this.tv.dir.sub(currentNormal.dir.clone().multiplyScalar(2.*proj));
                this.tv.dir = dir;

                //this.tv = currentMat.interact(this.tv.clone(), currentNormal);
                //move a little so you don't register as being on the object
                this.tv.flow(0.05);

                //now get out of the whole for loop
                break;
            }

            if(this.tv.pos.length()>20.){
                this.tv.keepGoing = false;
                break;
            }

        }

        //accumulate the distance traveled
        this.totalDist += totalDist;

    }

    trace(diorama){

        this.totalDist=0.;

        //given our diorama, run a trace to get points
        this.pts = [];
        //add the starting point
        this.pts.push(this.tv.pos.clone());

        for(let i=0;i<this.N;i++){

            this.stepForward(diorama);

            this.pts.push(this.tv.pos.clone());

            //if we are told to stop
            if(!this.tv.keepGoing){
                break;
            }

        }

        this.traj.setPoints(this.pts);
    }


}

export default Path;
