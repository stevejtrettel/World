import {Vector3} from "../../../3party/three/build/three.module.js";

// a diorama is a collection of objects
//this implements stepForward

class Diorama{
    constructor() {
        this.objList = [];
    }

    sdf(pos){
        let dist = 10000.;

        for(let i=0; i<this.objList.length; i++){

            dist = Math.min(dist, this.objList[i].sdf(pos));
        }
        return dist;
    }

    raymarch(tv){
        //take the tv to the next intersection with the diorama

        //FILL THIS IN
        let totalDist=0.;
        let distToScene=0.;

        for(let i = 0; i < 100; i++){

            distToScene = Math.abs(this.sdf(tv.pos));

            if (distToScene< 0.001){
                totalDist = totalDist+distToScene;
                break;
            }

            totalDist += distToScene;

            //otherwise keep going
            tv.flow(distToScene);

            if(totalDist>100.){
                tv.keepGoing = false;
                break;
            }

        }

        return tv;

    }



    stepForward(path){

        let currentMat;
        let currentNormal;


        //take to the next point in the diorama

        path.tv = this.raymarch(path.tv);

        if(path.tv.keepGoing) {

        //figure out where you are at,

        for(let i=0; i< this.objList.length; i++){

            if(this.objList[i].at(path.tv.pos)){
                console.log(path.tv.pos);
                currentMat = this.objList[i].mat;
                currentNormal = this.objList[i].getNormal(path.tv.pos);
                break;
            }
        }

            // interact with that material
            // and set yourself up for the next round
           path.tv.dir=new Vector3(Math.random(),Math.random(),Math.random()).normalize();
            //path.tv = currentMat.interact(path.tv, currentNormal);

            //move a little so you don't register as being on the object
            path.tv.flow(0.05);

        }

    }

    addObject(obj){
        this.objList.push(obj);
    }

    addToScene(scene){
        for(let i=0; i<this.objList.length; i++){
            this.objList[i].addToScene(scene);
        }
    }
}

export default Diorama;
