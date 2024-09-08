import {Color, Vector3} from "../../../3party/three/build/three.module.js";
import {Rod} from "../../../code/items/basic-shapes/Rod.js";

import Vector from "../../../code/items/basic-shapes/Vector.js";


class VectorComponents{
    constructor(){

        this.params = {
            animate: true,
            coordinates:true,
            x:1,
            y:2,
            z:3
        }

        //The main vector
        this.dir = new Vector3(this.params.x, this.params.y, this.params.z);
        let vectorColor = new Color().setHSL(0,0,1);
        this.vector = new Vector(this.dir,vectorColor);

    //    The axes
        let axisColor = new Color().setHSL(0.1,0.5,0.5);
        this.xAxis = new Rod({
            end1:new Vector3(-10,0,0),
            end2:new Vector3(10,0,0),
            radius:0.05,
            color: axisColor
        });
        this.yAxis = new Rod({
            end1:new Vector3(0,-10,0),
            end2:new Vector3(0,10,0),
            radius:0.05,
            color: axisColor
        });
        this.zAxis = new Rod({
            end1:new Vector3(0,0,-10),
            end2:new Vector3(0,0,10),
            radius:0.05,
            color: axisColor
        });


        //the components
        let componentColor = new Color().setHSL(0.4,0.7,0.4)
        this.toX = new Rod({
            end1: new Vector3(0,0,0),
            end2: new Vector3(this.dir.x,0,0),
            radius:0.075,
            color: componentColor,
        });
        this.toZ = new Rod({
            end1: new Vector3(this.dir.x,0,0),
            end2: new Vector3(this.dir.x,0,this.dir.z),
            radius:0.075,
            color: componentColor
        });
        this.toY = new Rod({
            end1: new Vector3(this.dir.x,0,this.dir.z),
            end2: this.dir,
            radius:0.075,
            color: componentColor
        });

    }

    setDir(dir){
        this.dir=dir;
        this.vector.setDir(this.dir);
        this.toX.resize(new Vector3(0,0,0),new Vector3(this.dir.x,0,0));
        this.toZ.resize(new Vector3(this.dir.x,0,0),new Vector3(this.dir.x,0,this.dir.z));
        this.toY.resize(new Vector3(this.dir.x,0,this.dir.z),this.dir);
    }

    addToScene(scene){
        this.vector.addToScene(scene);

         this.toX.addToScene(scene);
        this.toY.addToScene(scene);
        this.toZ.addToScene(scene);

        this.xAxis.addToScene(scene);
        this.yAxis.addToScene(scene);
        this.zAxis.addToScene(scene);
    }

    addToUI(ui){
        let thisObj=this;
        ui.add(thisObj.params,"coordinates").name("Coordinate Bars").onChange(function(value){
            thisObj.toX.setVisibility(value);
            thisObj.toY.setVisibility(value);
            thisObj.toZ.setVisibility(value);
        });
        ui.add(thisObj.params,"animate").name("Animate");
        ui.add(thisObj.params,"x",-3,3,0.01).onChange(function(val){
            let dir = new Vector3(val,thisObj.params.y,thisObj.params.z);
            thisObj.setDir(dir);
        });

        //swtiched y and z in the names to make it fit vector calc notation better
        ui.add(thisObj.params,"z",-3,3,0.01).name("y").onChange(function(val){
            let dir = new Vector3(thisObj.params.x,thisObj.params.y,val);
            thisObj.setDir(dir);
        });

        //swtiched y and z in the names to make it fit vector calc notation better
        ui.add(thisObj.params,"y",-3,3,0.01).name("z").onChange(function(val){
            let dir = new Vector3(thisObj.params.x,val,thisObj.params.z);
            thisObj.setDir(dir);
        });
                }

    tick(time,dTime){

        if(this.params.animate){
            let x = 3*Math.sin(time/3);
            let y = 2.*Math.sin(time/2);
            let z = 1.*Math.cos(time);

            this.setDir(new Vector3(x,y,z));
        }

    }
}


export default VectorComponents;
