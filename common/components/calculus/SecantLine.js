import {
    Vector2,
    Vector3,
    MeshPhysicalMaterial,
    SphereBufferGeometry,
    Mesh,
} from "../../../3party/three/build/three.module.js";

import { Rod } from "./Rod.js";




class SecantLine{
    constructor(options){

        this.f=options.f;
        this.radius = options.radius;

        this.setSlopeData(options.x,options.h);

        //now set the actual objects that end up in the scene:

        const secantMaterial = new MeshPhysicalMaterial(
            {
                color: options.mainColor,
                clearcoat:1,
            }
        );

        const accentMaterial = new MeshPhysicalMaterial(
            {
                color: options.accentColor,
                clearcoat:1,
            }
        );

        const auxMaterial = new MeshPhysicalMaterial(
            {
                color: options.auxColor,
                clearcoat:1,
            }
        );

        const ballGeometry = new SphereBufferGeometry(1.5*this.radius,32,16);

        //ball at x
        this.ballX = new Mesh(ballGeometry, accentMaterial);
        this.ballX.position.set(this.x, this.y, 0);

        //ball at x+h
        this.ballXH =  new Mesh(ballGeometry, accentMaterial);
        this.ballXH.position.set(this.x2, this.y2, 0);

        //elbow joint between rise and run
        const joinSphereGeometry = new SphereBufferGeometry(0.5*this.radius,32,16);
        this.joinSphere = new Mesh(joinSphereGeometry, auxMaterial);
        this.joinSphere.position.set(this.x2,this.y,0);

        this.run = new Rod(
            {
                end1: new Vector3(this.x, this.y, 0),
                end2: new Vector3(this.x2, this.y, 0),
                radius: 0.3*this.radius,
                color: options.auxColor
            }
        );

        this.rise = new Rod(
            {
                end1: new Vector3(this.x2, this.y, 0),
                end2: new Vector3(this.x2, this.y2, 0),
                radius: 0.3*this.radius,
                color:options.auxColor,
            }
        );

        this.setSecantData();
    }

    setSlopeData(x,h){
        this.x=x;
        this.h=h;
        this.x2=x+h;
        this.y=this.f(this.x);
        this.y2=this.f(this.x2);
        this.slope = (this.y2-this.y)/(this.x2-this.x);
    }

    setSecantData(){
        //now build the rod
        //first: get the length of the secant
        const relVec = new Vector2(this.x2,this.y2).sub(new Vector2(this.x,this.y));
        const len = relVec.length();
        //second: calculate what x value is needed to extend length by 2 in each direction
        const deltaX = Math.sqrt(4/(1+this.slope*this.slope));

        const xStart = this.x-deltaX;
        const xEnd = this.x2+deltaX;

        const yStart = this.f(xStart);
        const yEnd = this.f(xEnd);

        const end1 = new Vector3(xStart, yStart, 0);
        const end2 = new Vector3(xEnd, yEnd, 0);
    }

    addToScene( scene ){
       scene.add(this.ballX);
       scene.add(this.ballXH);
       scene.add(this.joinSphere);
       // this.secant.addToScene(scene);
       this.rise.addToScene(scene);
       this.run.addToScene(scene);
    }

    resetX(x){
        //reset the data
        this.setSlopeData(x,this.h);

        //move the balls around
        this.ballX.position.set(this.x, this.y, 0);
        this.ballXH.position.set(this.x2, this.y2, 0);
        this.joinSphere.position.set(this.x2,this.y,0);

        //redraw the rods
        const rise1 = new Vector3(this.x2,this.y,0);
        const rise2 = new Vector3(this.x2, this.y2,0);
        this.rise.resetRod(rise1, rise2);

        const run1 = new Vector3(this.x, this.y,0);
        const run2 = new Vector3(this.x2, this.y, 0);
        this.run.resetRod(run1, run2);
     }

    resetH(h){
        //reset the data
        this.setSlopeData(this.x, h);

        //move the balls around
        this.ballX.position.set(this.x, this.y, 0);
        this.ballXH.position.set(this.x2, this.y2, 0);
        this.joinSphere.position.set(this.x2,this.y,0);

        //redraw the rods
        const rise1 = new Vector3(this.x2,this.y,0);
        const rise2 = new Vector3(this.x2, this.y2,0);
        this.rise.resetRod(rise1, rise2);

        const run1 = new Vector3(this.x, this.y,0);
        const run2 = new Vector3(this.x2, this.y, 0);
        this.run.resetRod(run1, run2);
    }

}



export{ SecantLine };