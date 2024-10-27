import {Vector3} from "../../../3party/three/build/three.module.js";
import TVec from "./TVec.js";
import {reflectIn, refractIn,TIR,FresnelReflectAmount,mix,bisect} from "./interaction/scatter.js";
import LightRay from "./lightray/LightRay.js";
import {randomVec3Sphere,randomExponential} from "./interaction/random.js";






class OneBounce {
    constructor(tv,maxN=100) {

        this.tv = tv;
        this.maxN = maxN;
        this.traj = new LightRay(maxN);

        //the current object
        this.currentObject = undefined;

    }

    addToScene(scene){
        this.traj.addToScene(scene);
    }

    trace(diorama){

        //add the origin point
        this.pts = [];
        this.pts.push(this.tv.pos.clone());

        //raymarch to the next intersection,and save its location
        this.raymarch(diorama);
        this.pts.push(this.tv.pos.clone());

        //interact with the location:
        //this leaves us at the objects surface, ready to continue
        this.interact(diorama);

        //raytrace to next location
        this.raymarch(diorama);
        this.pts.push(this.tv.pos.clone());

        //done! set the points
        this.traj.setPoints(this.pts);

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
        }

        //otherwise, interact and get ready for next raymarch
        if(this.tv.keepGoing){

            //outward normal
            let normal = this.currentObject.getNormal(this.tv.pos);
            //uniform vector on sphere
            let randomVec = new TVec(this.tv.pos.clone(),new randomVec3Sphere());

            //decide which we are doing:
            let random = Math.random();
            let dC = this.currentObject.mat.diffuseChance;
            let sC = this.currentObject.mat.specularChance;
            let rC = this.currentObject.mat.refractChance;
            let sssC = this.currentObject.mat.subsurfaceChance;

            //update probabilities using Fresnel, if something is specular and refracting
            if(sC>0. && rC >0.){
                let n = 1/this.currentObject.mat.ior;//current over entering
                let newSC = FresnelReflectAmount(n, this.tv, normal, sC, 1.0);

                let chanceMultiplier = (1.0 - newSC) / (1.0 - sC);
                sC = newSC;
                rC  *= chanceMultiplier;
                dC *= chanceMultiplier;
                sssC *= chanceMultiplier;
            }

            if(random<dC){//diffuse
                let diffuseVec = normal.clone().add(randomVec);
                diffuseVec.normalize();
                this.tv = diffuseVec;
            }

            else if(random < dC+sC){//specular

                let diffuseVec = normal.clone().add(randomVec);
                diffuseVec.normalize();
                let reflectVec = reflectIn(this.tv,normal);

                let rough2 = this.currentObject.mat.roughness * this.currentObject.mat.roughness;
                let newTV = mix(reflectVec,randomVec, rough2);

                this.tv = newTV;
            }


            else if(random < dC + sC + rC){
                this.refract(this.currentObject);
            }


            else{
                //subsurface
                this.sss(this.currentObject);
            }


            //move a bit off the surface to get ready to start
            normal = this.currentObject.getNormal(this.tv.pos);
            this.tv.add(normal.multiplyScalar(0.002));
            this.tv.flow(0.002);
        }

    }


    sss(obj){
        //subsurface scattering through an object

        //FIRST: enter the object with a little refraction
        let normal = obj.getNormal(this.tv.pos);
        let rough2 = obj.mat.roughness * obj.mat.roughness;
        let randomVec = new TVec(this.tv.pos,new randomVec3Sphere());
        //n is the ior ratio current/entering:
        //we are outside, just entering
        let n = 1/obj.mat.ior;
        let reflectVec = refractIn(this.tv,normal,n);
        let newTV = mix(reflectVec,randomVec,rough2);
        this.tv = newTV;
        //move a little
        this.tv.flow(0.005);


        //start the SSS
        let scatterSteps = this.maxN-5;
        //distances
        let depth = 0;
        let flowDist =0;

        //parameters
        let iso = obj.mat.isotropy * obj.mat.isotropy;
        let mfp = obj.mat.mfp;

        let temp = this.tv.clone();

        for(let i=0; i<scatterSteps; i++){

            randomVec = new TVec(this.tv.pos,new randomVec3Sphere());
            temp = mix(temp, randomVec,iso);
            //update tvs direction
            this.tv = temp.clone();
            //choose distance to flow
            flowDist = randomExponential(mfp);

            //do a trial flow
            temp.flow(flowDist);

            //see if we left
            if(!obj.inside(temp.pos)){
                //tv is behind it, temp is in front: with distance flowDist
                //find the distance
                flowDist=bisect(this.tv,flowDist,obj);
                let eps = 0.
                this.tv.flow(flowDist-eps);
                this.pts.push(this.tv.pos);
                return;
            }

            //if we are inside still:
            //move ahead to this point
            this.tv = temp.clone();
            this.pts.push(this.tv.pos);
            depth += flowDist;

        }

        n = obj.mat.ior;
        normal = obj.getNormal(this.tv.pos);
        normal.multiplyScalar(-1);
        this.tv = refractIn(this.tv,normal,n);
        // this.tv.flow(0.005);

    }

    refract(obj){

        let incident = this.tv;
        let normal = obj.getNormal(incident.pos);
        let rough2 = obj.mat.roughness * obj.mat.roughness;
        let randomVec = new TVec(incident.pos,new randomVec3Sphere());

        //n is the ior ratio current/entering:
        //we are outside, just entering
        let n = 1/obj.mat.ior;
        let reflectVec = refractIn(incident,normal,n);
        let newTV = mix(reflectVec,randomVec,rough2);
        this.tv = newTV;

        //move a little
        this.tv.flow(0.005);

        //then trace to other side
        this.raymarch(obj);
        this.pts.push(this.tv.pos.clone());

        //bounce around if there is some total internal reflections
        for(let i=0; i<30; i++) {

            //n is the ior ratio current/entering: we are inside going to the outside
            n = obj.mat.ior;

            let normal = obj.getNormal(this.tv.pos);
            normal.multiplyScalar(-1);//we are inside

            if(TIR(n,this.tv,normal)) {
                //we have reflection, continue
                this.tv = reflectIn(this.tv, normal);
                this.tv.flow(0.002);
                this.raymarch(obj);
                this.pts.push(this.tv.pos.clone());
            }
            else{
                //no reflection: we're free!
                break;
            }
        }

        //now we are done internally reflecting
        normal = obj.getNormal(this.tv.pos);
        normal.multiplyScalar(-1);//still inside
        this.tv = refractIn(this.tv,normal,n);
        // this.tv.flow(0.005);

    }



}



export default OneBounce;
