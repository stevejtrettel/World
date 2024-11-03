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

        //the normal
        this.nvec = new SurfaceNormal();

        //make some lights
        this.light1 = new Vector3(2,4,0);
        this.light2 = new Vector3(0,4,2);
        this.light3 = new Vector3(-2,4,0);

        //create the path
        let dir = new Vector3(-0.13, -0.1+0.01*0.71, -0.4-0.01*0.71).normalize();
        let tv = new TVec(new Vector3(0,0,10), dir);

        this.path1 = new PhongPath(tv,this.light1);
        this.path2 = new PhongPath(tv,this.light2);
        this.path3 = new PhongPath(tv,this.light3);

        this.lvec1 = new Vector(0xfcba03);
        this.lvec2 = new Vector(0xfcba03);
        this.lvec3 = new Vector(0xfcba03);

        //trace the rays through the scene.
        this.path1.trace(this.diorama);
        this.path2.trace(this.diorama);
        this.path3.trace(this.diorama);

        this.lvec1.setPos(this.path1.pointScene);
        this.lvec1.setDir(this.path1.pointLight.clone().sub(this.path1.pointScene).normalize().multiplyScalar(2));

        this.lvec2.setPos(this.path2.pointScene);
        this.lvec2.setDir(this.path2.pointLight.clone().sub(this.path2.pointScene).normalize().multiplyScalar(2));

        this.lvec3.setPos(this.path3.pointScene);
        this.lvec3.setDir(this.path3.pointLight.clone().sub(this.path3.pointScene).normalize().multiplyScalar(2));



        let obj = this.diorama.getObjectAt(this.path1.pointScene);
        if(obj) {
            this.nvec.getNormalAt(this.path1.pointScene, obj);
        }

    }


    addToScene(scene){
        this.path1.addToScene(scene);
        this.path2.addToScene(scene);
        this.path3.addToScene(scene);
        this.diorama.addToScene(scene);
        this.nvec.addToScene(scene);
        this.lvec1.addToScene(scene);
        this.lvec2.addToScene(scene);
        this.lvec3.addToScene(scene);
    }

    addToUI(ui){
        let path = this.path;
        let diorama = this.diorama;

        ui.add(this.params,'animate');
        ui.add(this.params,'t',0,1,0.001).onChange(function(time){
            let pos = new Vector3(0, 0, 4.8);
            let dir = new Vector3(-0.13 + 0.1 * Math.cos(time), -0.1 + 0.1 * Math.sin(time/ 10), -0.4).normalize();
            path.tv = new TVec(pos, dir);
            path.trace(diorama);
        });
    }

    tick(time,dTime){

        if(this.params.animate) {
            let pos = new Vector3(0, 0, 4.8);
            let dir = new Vector3(-0.13 + 1 * Math.cos(time / 3), -0.2 + 0.05 * Math.sin(3*time), -0.4).normalize();
            let tv =  new TVec(pos, dir);

            this.path1.tv = tv;
            this.path2.tv = tv;
            this.path3.tv = tv;

            this.path1.trace(this.diorama);
            this.path2.trace(this.diorama);
            this.path3.trace(this.diorama);

            this.lvec1.setPos(this.path1.pointScene);
            this.lvec1.setDir(this.path1.pointLight.clone().sub(this.path1.pointScene).normalize().multiplyScalar(2));

            this.lvec2.setPos(this.path2.pointScene);
            this.lvec2.setDir(this.path2.pointLight.clone().sub(this.path2.pointScene).normalize().multiplyScalar(2));

            this.lvec3.setPos(this.path3.pointScene);
            this.lvec3.setDir(this.path3.pointLight.clone().sub(this.path3.pointScene).normalize().multiplyScalar(2));

            this.path1.traj.showBounces(0);
            this.path2.traj.showBounces(0);
            this.path3.traj.showBounces(0);

            let obj =this.diorama.getObjectAt(this.path1.pointScene);
            if(obj) {
                this.nvec.getNormalAt(this.path1.pointScene,obj);
            }
        }
    }
}


export default Test;
