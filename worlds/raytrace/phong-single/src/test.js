import {Vector3} from "../../../../3party/three/build/three.module.js";

import TVec from "../../../../code/items/raytrace/TVec.js";

import boxScene from "./boxScene.js";
import PhongPath from "../../../../code/items/raytrace/PhongPath.js";
import SurfaceNormal from "../../../../code/items/raytrace/SurfaceNormal.js";
import Vector from "../../../../code/items/raytrace/lightray/Vector.js";

class Test{
    constructor() {

        this.params = {
            animate:true,
            t: 0,
        }

        //use some diorama
        this.diorama = boxScene;

        this.nvec = new SurfaceNormal();
        this.lightVec = new Vector(0xfcba03,1);

        //make some lights
        this.light1 = new Vector3(2,4,0);

        //create the path
        let dir = new Vector3(-0.13, -0.1+0.01*0.71, -0.4-0.01*0.71).normalize();
        let tv = new TVec(new Vector3(0,0,10), dir);
        this.path = new PhongPath(tv,this.light1);
        this.path.traj.showBounces(0);

        //trace the rays through the scene.
        this.path.trace(this.diorama);
        let obj = this.diorama.getObjectAt(this.path.pointScene);
        if(obj) {
            this.nvec.getNormalAt(this.path.pointScene, obj);
            this.lightVec.setPos(this.path.pointScene);
            let dir = this.path.pointLight.clone().sub(this.path.pointScene).normalize().multiplyScalar(2);
            this.lightVec.setDir(dir);
        }

    }


    addToScene(scene){
        this.path.addToScene(scene);
        this.diorama.addToScene(scene);
        this.nvec.addToScene(scene);
        this.lightVec.addToScene(scene);
    }

    addToUI(ui){
        let path = this.path;
        let diorama = this.diorama;
        let nvec = this.nvec;
        let obj = this;

        ui.add(this.params,'animate');
        ui.add(this.params,'t',0,1,0.001).onChange(function(time){
            let pos = new Vector3(0, 0, 4.8);
            let dir = new Vector3(-0.13 + 0.1 * Math.cos(time), -0.1 + 0.1 * Math.sin(time/ 10), -0.4).normalize();
            path.tv = new TVec(pos, dir);
            path.trace(diorama);
            nvec.getNormalAt(path.pointScene, diorama.getObjectAt(path.pointScene));
            obj.lightVec.setPos(path.pointScene);
            dir = path.pointLight.clone().sub(path.pointScene).normalize().multiplyScalar(3);
            obj.lightVec.setDir(dir);
        });
    }

    tick(time,dTime){

        if(this.params.animate) {
            let pos = new Vector3(0, 0, 4.8);
            let dir = new Vector3(-0.15 + 0.2 * Math.cos(time / 3), -0.2+ 0.05*Math.sin(3.*time) , -0.4).normalize();
            this.path.tv = new TVec(pos, dir);
            this.path.trace(this.diorama);
            this.path.traj.showBounces(0);//hide the ray to the light!


            let obj =this.diorama.getObjectAt(this.path.pointScene);
            if(obj) {
                this.nvec.getNormalAt(this.path.pointScene,obj);
                this.lightVec.setPos(this.path.pointScene);
                let dir = this.path.pointLight.clone().sub(this.path.pointScene).normalize().multiplyScalar(3);
                this.lightVec.setDir(dir);
            }

        }
    }
}


export default Test;
