import {Color, Vector3} from "../../../3party/three/build/three.module.js";

import {Rod} from "../../components/basic-shapes/Rod.js";
import Vector from "../../components/basic-shapes/Vector.js";

let ptColor = new Color().setHSL(0.55,0.5,0.5);
let dirColor = new Color().setHSL(0.2,0.5,0.5);
let sumColor = new Color().setHSL(0.35,0.5,0.5);
let lineColor = new Color().setHSL(0.65,0.5,0.7);




const defaultSetup = {
    pt: new Vector3(0,1,2),
    dir: new Vector3(1,-2,-1)
};


class ParametricLineAnimation {
    constructor(setup=defaultSetup) {

        this.params = {
            animate: true,
            s:0,
            dx:1,
            dy:0.5,
            dz:0,
            px:1,
            py:2,
            pz:-1,
        }


        this.pt = setup.pt;
        this.ptVector = new Vector(setup.pt,ptColor);

        this.dir = setup.dir;
        this.dirVector = new Vector(setup.dir,dirColor);

        this.shiftedDirVector = new Vector(setup.dir);
        this.shiftedDirVector.setPos(this.pt,dirColor);

        this.sum = this.pt.clone().add(this.dir);
        this.sumVector = new Vector(this.sum,sumColor);

        let end1 = this.pt.clone().add(this.dir.clone().multiplyScalar(8));
        let end2 = this.pt.clone().sub(this.dir.clone().multiplyScalar(8));
        this.line = new Rod({
            end1:end1,
            end2:end2,
            color:lineColor,
            radius:0.075,
        });

    }

    addToScene(scene){
        this.ptVector.addToScene(scene);
        this.dirVector.addToScene(scene);
        this.shiftedDirVector.addToScene(scene);
        this.sumVector.addToScene(scene);
        this.line.addToScene(scene);
    }

    addToUI(ui){

        let thisObj =this;

        let pFolder =ui.addFolder('Parameterize');
        pFolder.close();

        pFolder.add(thisObj.params, 'animate').name('Animate');
        pFolder.add(thisObj.params,'s',-5,5,0.01).name('Parameter').onChange(function(val){
            thisObj.shiftedDirVector.setDir(thisObj.dir.clone().multiplyScalar(val));
            thisObj.sum = thisObj.pt.clone().add(thisObj.dir.clone().multiplyScalar(val));
            thisObj.sumVector.setDir(thisObj.sum);
        });

        let dFolder = ui.addFolder('Direction');
        dFolder.close();
        dFolder.add(thisObj.params,'dx',-1,1,0.01).name('x').onChange(function(val){
            thisObj.dir.x=val;
            thisObj.dirVector.setDir(thisObj.dir);
            let end1 = thisObj.pt.clone().add(thisObj.dir.clone().multiplyScalar(6));
            let end2 = thisObj.pt.clone().sub(thisObj.dir.clone().multiplyScalar(6));
            thisObj.line.resize(end1,end2);
        });
        dFolder.add(thisObj.params,'dy',-1,1,0.01).name('y').onChange(function(val){
            thisObj.dir.y=val;
            thisObj.dirVector.setDir(thisObj.dir);
            let end1 = thisObj.pt.clone().add(thisObj.dir.clone().multiplyScalar(6));
            let end2 = thisObj.pt.clone().sub(thisObj.dir.clone().multiplyScalar(6));
            thisObj.line.resize(end1,end2);
        });
        dFolder.add(thisObj.params,'dz',-1,1,0.01).name('z').onChange(function(val){
            thisObj.dir.z=val;
            thisObj.dirVector.setDir(thisObj.dir);
            let end1 = thisObj.pt.clone().add(thisObj.dir.clone().multiplyScalar(6));
            let end2 = thisObj.pt.clone().sub(thisObj.dir.clone().multiplyScalar(6));
            thisObj.line.resize(end1,end2);
        });

        let posFolder = ui.addFolder('Position');
        posFolder.close();
        posFolder.add(thisObj.params,'px',-2,2,0.01).name('x').onChange(function(val){
            thisObj.pt.x=val;
            thisObj.ptVector.setDir(thisObj.pt);
            thisObj.shiftedDirVector.setPos(thisObj.pt);
            let end1 = thisObj.pt.clone().add(thisObj.dir.clone().multiplyScalar(8));
            let end2 = thisObj.pt.clone().sub(thisObj.dir.clone().multiplyScalar(8));
            thisObj.line.resize(end1,end2);
        });
        posFolder.add(thisObj.params,'py',-2,2,0.01).name('y').onChange(function(val){
            thisObj.pt.y=val;
            thisObj.ptVector.setDir(thisObj.pt);
            thisObj.shiftedDirVector.setPos(thisObj.pt);
            let end1 = thisObj.pt.clone().add(thisObj.dir.clone().multiplyScalar(8));
            let end2 = thisObj.pt.clone().sub(thisObj.dir.clone().multiplyScalar(8));
            thisObj.line.resize(end1,end2);
        });
        posFolder.add(thisObj.params,'pz',-2,2,0.01).name('z').onChange(function(val){
            thisObj.pt.z=val;
            thisObj.ptVector.setDir(thisObj.pt);
            thisObj.shiftedDirVector.setPos(thisObj.pt);
            let end1 = thisObj.pt.clone().add(thisObj.dir.clone().multiplyScalar(8));
            let end2 = thisObj.pt.clone().sub(thisObj.dir.clone().multiplyScalar(8));
            thisObj.line.resize(end1,end2);
        });

    }

    tick(time,dTime){

        if(this.params.animate){
            let s = 5.*Math.sin(time);

            this.shiftedDirVector.setDir(this.dir.clone().multiplyScalar(s));

            this.sum = this.pt.clone().add(this.dir.clone().multiplyScalar(s));
            this.sumVector.setDir(this.sum);

        }

    }
}



export default ParametricLineAnimation;
