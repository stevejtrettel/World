import {
    CatmullRomCurve3, Mesh,
    MeshPhysicalMaterial,
    TubeGeometry,
    Vector2
} from "../../../../3party/three/build/three.module.js";

import State from "../Integrator/State.js";
import Geodesic from "../Geodesics/Geodesic.js";




class Circle{
    constructor(pts,rad) {
        this.rad = rad;
        this.pts = pts;

        this.curve = new CatmullRomCurve3(this.pts,true);
        this.circumference = this.curve.getLength();

        let tubeRad = Math.min(0.1,this.rad/30);
        let tubeGeo = new TubeGeometry(this.curve,200,tubeRad,8,true);
        let mat = new MeshPhysicalMaterial({
            color:0xffffff,
            clearcoat:1,
        });
        this.tube = new Mesh(tubeGeo, mat);

    }

    addToScene(scene){
        scene.add(this.tube);
    }

    update(pts){
        this.curve = new CatmullRomCurve3(this.pts,true);
        this.tube.geometry.dispose();
        let rad = Math.min(0.1,this.rad/30);
        this.tube.geometry = new TubeGeometry(this.curve,200,rad,8,true);
    }
}





class CircleGrid{
    constructor(surface, center, radius, N) {
        this.surface = surface;
        this.center = center;
        this.radius = radius;
        this.numCircs = N;
        this.numSegs = 20.;

        this.circlePts = new Array(this.numCircs);
        for(let i=0; i<this.numCircs;i++){
            this.circlePts[i]=new Array(this.numSegs)
        }

        this.circles = new Array(this.numCircs);
        this.spray = new Array(this.numSegs);

        //initialize the spray:
        for(let i=0; i<this.numSegs; i++){
            let iniState = this.sprayIniCond(i);
            this.spray[i] = new Geodesic(this.surface, iniState, {
                length:this.radius,
                color: 0xffffff,
                radius: 0.05,
                res: 100,
            });
        }


        //initialize the circles:
        for(let i=0; i<this.numCircs; i++){
            //percentage of the way to the outside
            let rad = (i+1)/this.numCircs;
            for(let j=0; j<this.numSegs; j++){
                this.circlePts[i][j]=this.spray[j].getPoint(rad);
            }
            //now got all the points: can build the circle!
            this.circles[i] = new Circle(this.circlePts[i],rad*this.radius);
        }

    }

    sprayIniCond(i){
        let theta = 2.*Math.PI/this.numSegs *i;
        let dir = new Vector2(Math.cos(theta),Math.sin(theta));
        return new State(this.center, dir);
    }


    computeSpray(){
        for(let i=0; i<this.numSegs; i++){
            this.spray[i].updateLength(this.radius);
            let iniState = this.sprayIniCond(i);
            this.spray[i].update(iniState);
            //console.log(this.spray[i].curve.curve.getLength());
        }
    }

    computeCircles(){
        for(let i=0; i<this.numCircs; i++){
            //percentage of the way to the outside
            let rad = (i+1)/this.numCircs;
            for(let j=0; j<this.numSegs; j++){
                this.circlePts[i][j]=this.spray[j].getPoint(rad);
            }
            //now got all the points: can build the circle!
            this.circles[i].update(this.circlePts[i],rad*this.radius);
        }
    }


    addToScene(scene){

        for(let i=0; i<this.numSegs; i++){
            this.spray[i].addToScene(scene);
        }

        for(let i=0; i<this.numCircs; i++){
            this.circles[i].addToScene(scene);
        }

    }

    updateCenter(center){
        this.center = center;
        this.computeSpray();
        this.computeCircles();

    }

    updateRadius(radius){
        this.radius=radius;
        this.computeSpray();
        this.computeCircles();
    }
}


export default CircleGrid;