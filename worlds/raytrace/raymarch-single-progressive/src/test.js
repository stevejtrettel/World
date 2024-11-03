import {Vector3} from "../../../../3party/three/build/three.module.js";

import TVec from "../../../../code/items/raytrace/TVec.js";

import boxScene from "./boxScene.js";
import RaymarchPath from "../../../../code/items/raytrace/RaymarchPath.js";

class Test{
    constructor() {

        this.params = {
            animate:true,
            t: 0,
        }

        //use some diorama
        this.diorama = boxScene;

        //create the path
        let dir = new Vector3(-0.13, -0.1+0.01*0.71, -0.4-0.01*0.71).normalize();
        let tv = new TVec(new Vector3(0,0,4.8), dir);
        this.path = new RaymarchPath(tv);

        //trace the rays through the scene.
        this.path.trace(this.diorama);

    }


    addToScene(scene){
        this.path.addToScene(scene);
        this.diorama.addToScene(scene);
    }

    addToUI(ui){
        // let path = this.path;
        // let diorama = this.diorama;
        //
        // ui.add(this.params,'animate');
        // ui.add(this.params,'t',0,1,0.001).onChange(function(time){
        //     let pos = new Vector3(0, 0, 4.8);
        //     let dir = new Vector3(-0.13 + 0.1 * Math.cos(time), -0.1 + 0.1 * Math.sin(time/ 10), -0.4).normalize();
        //     path.tv = new TVec(pos, dir);
        //     path.trace(diorama);
        // });
    }

    tick(time,dTime){

        // if(this.params.animate) {
        //     let pos = new Vector3(0, 0, 4.8);
        //     let dir = new Vector3(-0.13 + 0.2 * Math.cos(time / 3), -0.05, -0.4).normalize();
        //     this.path.tv = new TVec(pos, dir);
        //     this.path.trace(this.diorama);
        // }

        this.path.showBounces(Math.floor(time));
    }
}


export default Test;
