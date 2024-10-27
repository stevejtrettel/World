import {Vector3} from "../../../3party/three/build/three.module.js";
import TVec from "./TVec.js";
import {reflectIn, refractIn} from "./interaction/scatter.js";
import Rod from "./lightray/Rod.js";
import LightRay from "./lightray/LightRay.js";
import {mix, randomVec3Sphere} from "./interaction/random.js";


class OneBounce {
    constructor(tv) {

        this.tv = tv;

        //the different components
        // this.originRay = new Rod();
        // this.bounceRay = new Rod();
        // this.subsurfRay = new LightRay();
        this.traj = new LightRay();

        //the current object in case we need it
        this.currentObject = undefined;

    }

    addToScene(scene){
        // this.originRay.addToScene(scene);
        // this.bounceRay.addToScene(scene);
        // this.subsurfRay.addToScene(scene);

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
        //find the current object and save.
        //figure out if we refract, reflect, diffuse or subsurface
        //if we need to traverse *through* the object, do so.
        this.interact(diorama);


        //now we are at the surface of the object again
        //(either where we started, or after refraction/subsurface)
        //move a little off the surface:
        let currentNormal = this.currentObject.getNormal(this.tv.pos);
        this.tv.pos.add(currentNormal.dir.multiplyScalar(0.002));
        this.tv.flow(0.002);

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

            let incident = this.tv.clone();
            let normal = this.currentObject.getNormal(incident.pos);
            let randomVec = new TVec(incident.pos,new randomVec3Sphere());
            let diffuseVec = normal.clone().add(randomVec);
            diffuseVec.normalize();

            let rough2 = this.currentObject.mat.roughness * this.currentObject.mat.roughness;
            console.log(rough2);

            //decide which we are doing:

            let random = Math.random();

            let dC = this.currentObject.mat.diffuseChance;
            let sC = this.currentObject.mat.specularChance;
            let rC = this.currentObject.mat.refractChance;
            let sssC = this.currentObject.mat.subsurfaceChance;


            if(random<dC){
                //diffuse
                this.tv = diffuseVec;
            }
            else if(random < dC+sC){
                //specular
                let reflectVec = reflectIn(incident,normal);
                let newTV = mix(randomVec,reflectVec,rough2);
                this.tv = newTV;
            }
            else if(random < dC + sC + rC){
                this.refract(this.currentObject);

                //once this is over, we are back at the surface, and ready to escape.
                this.tv.flow(0.002);
                this.raymarch(diorama);
                this.pts.push(this.tv.pos.clone());
            }
            else{
                //subsurface
                this.sss(this.currentObject);
            }

        }

    }


    sss(obj){
        //subsurface scattering through an object

    }

    refract(obj){

        let incident = this.tv;
        let normal = obj.getNormal(incident.pos);
        let rough2 = obj.mat.roughness * obj.mat.roughness;
        let randomVec = new TVec(incident.pos,new randomVec3Sphere());

        //refract
        let n = 1/this.currentObject.mat.ior;
        let reflectVec = refractIn(incident,normal,n);
        let newTV = mix(randomVec,reflectVec,rough2);
        this.tv = newTV;

        //move a little
        this.tv.flow(0.002);

        //then trace to other side
        this.raymarch(obj);
        this.pts.push(this.tv.pos.clone());

        //bounce around if there is some total internal reflections
        this.tir(obj);


        //really need to be recursively running some TIR here
        //incase it keeps reflecting!
        //BUT not today....

        //refract through the surface again
        // let incident = this.tv;
        // let normal = obj.getNormal(incident.pos);
        // let rough2 = obj.mat.roughness * obj.mat.roughness;
        // let randomVec = new TVec(incident.pos,new randomVec3Sphere());
        //
        // let n = this.currentObject.mat.ior;
        // let reflectVec = refractIn(incident,normal,n);
        // let newTV = mix(randomVec,reflectVec,rough2);
        // this.tv = newTV;
        //
        // //move a litle
        // this.tv.flow(0.002);


    }

    tir(obj){

        let n = 1/this.currentObject.mat.ior;

        for(let i=0; i<10; i++) {
            let incident = this.tv;
            let normal = this.currentObject.getNormal(incident.pos);

            let cosX = -normal.dot(incident);
            let sinT2 = n * n * (1 - cosX * cosX);
            if (sinT2 < 1.) {
                break;
            }

            //otherwise, we have reflection, continue
            this.tv = reflectIn(incident,normal);
            this.tv.flow(0.002);

            this.raymarch(obj);
            this.pts.push(this.tv.pos.clone());
        }

        let normal =  this.currentObject.getNormal(this.tv.pos);
        this.tv = refractIn(this.tv,normal,n);

    }


}



export default OneBounce;
