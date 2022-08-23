import {Vector3} from "../../../3party/three/build/three.module.js";

import { Rod } from "./Rod.js";
import { GlassPanel } from "./GlassPanel.js";





class BlackBoard{
    constructor(options){
        this.xRange=options.xRange;
        this.yRange=options.yRange;

        //build the blackboard
        const boardOptions={
            xRange:{
                min: this.xRange.min-0.5,
                max: this.xRange.max+0.5,
            },
            yRange:{
                min: this.yRange.min-0.5,
                max: this.yRange.max+0.5
            }
        }
        this.board = new GlassPanel(boardOptions);

        //build the x axis
        const xOptions = {
            end1: new Vector3(this.xRange.min,0,0),
            end2: new Vector3(this.xRange.max,0,0),
            radius:0.5*options.radius,
            color:0xffffff,
            transmission:0.9,
        }
        this.xAxis = new Rod(xOptions);


        //build the y axis
        const yOptions = {
            end1: new Vector3(0,this.yRange.min,0),
            end2: new Vector3(0,this.yRange.max,0),
            radius:0.5*options.radius,
            color:0xffffff,
            transmission:0.9,
        }
        this.yAxis = new Rod(yOptions);

    }

    addToScene( scene ){
        this.board.addToScene(scene);
        this.xAxis.addToScene(scene);
        this.yAxis.addToScene(scene);
    }

    resetRange(xRange, yRange){
        this.xRange=xRange;
        this.yRange=yRange;

        //build the blackboard
        const newXRange ={
            min: this.xRange.min-0.5,
            max: this.xRange.max+0.5,
        };
        const newYRange = {
            min: this.yRange.min-0.5,
            max: this.yRange.max+0.5,
        };
        this.board.resetRange(newXRange, newYRange);

        const xEnd1 = new Vector3(this.xRange.min,0,0);
        const xEnd2 = new Vector3(this.xRange.max,0,0);
        this.xAxis.resetRod(xEnd1,xEnd2);

        const yEnd1 = new Vector3(0,this.yRange.min,0);
        const yEnd2 = new Vector3(0,this.yRange.max,0);
        this.yAxis.resetRod(yEnd1,yEnd2);

    }

    setPosition(x,y,z){
        this.board.setPosition(x,y,z);
        this.xAxis.setPosition(x,y,z);
        this.yAxis.setPosition(x,y,z);
    }

}

export{ BlackBoard };