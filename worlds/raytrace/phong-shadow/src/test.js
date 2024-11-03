import {Vector3} from "../../../../3party/three/build/three.module.js";

import TVec from "../../../../code/items/raytrace/TVec.js";

import boxScene from "./boxScene.js";
import PhongShadowPath from "../../../../code/items/raytrace/PhongShadowPath.js";
import SurfaceNormal from "../../../../code/items/raytrace/SurfaceNormal.js";

class Test{
    constructor() {

        this.params = {
            animate:true,
            t: 0,
        }

        //use some diorama
        this.diorama = boxScene;

        this.nvec = new SurfaceNormal();

        //make some lights
        this.light1 = new Vector3(2,4,0);
        this.light2 = new Vector3(0,4,2);
        this.light3 = new Vector3(-2,4,0);

        //create the path
        let dir = new Vector3(-0.13, -0.1+0.01*0.71, -0.4-0.01*0.71).normalize();
        let tv = new TVec(new Vector3(0,0,5), dir);

        this.path1 = new PhongShadowPath(tv,this.light1);
        this.path2 = new PhongShadowPath(tv,this.light2);
        this.path3 = new PhongShadowPath(tv,this.light3);

        //trace the rays through the scene.
        this.path1.trace(this.diorama);
        this.path2.trace(this.diorama);
        this.path3.trace(this.diorama);

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
    }

    addToUI(ui){
    }

    tick(time,dTime){

        if(this.params.animate) {
            let pos = new Vector3(0, 0, 4.8);
            let dir = new Vector3(-0.15 + 0.2 * Math.cos(time / 3), -0.25+ 0.05*Math.sin(3.*time) , -0.4).normalize();
            let tv =  new TVec(pos, dir);

            this.path1.tv = tv;
            this.path2.tv = tv;
            this.path3.tv = tv;

            this.path1.trace(this.diorama);
            this.path2.trace(this.diorama);
            this.path3.trace(this.diorama);

            let obj = this.diorama.getObjectAt(this.path1.pointScene);
            if(obj) {
                this.nvec.getNormalAt(this.path1.pointScene, obj);
            }
        }
    }
}


export default Test;
