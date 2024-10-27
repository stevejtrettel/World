import {Vector3} from "../../../../3party/three/build/three.module.js";

import Path from "../../../../code/items/raytrace/Path.js";
import OneBounce from "../../../../code/items/raytrace/OneBounce.js";
import TVec from "../../../../code/items/raytrace/TVec.js";

import boxScene from "./boxScene.js";


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
        this.tv = new TVec(new Vector3(0,0,4.8), dir);
        this.path = new OneBounce(this.tv,1000);

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
        ui.add(this.params,'animate');
        // ui.add(this.params,'t',0,1,0.001).onChange(function(time){
        //     let pos = new Vector3(0, 0, 4.8);
        //     let dir = new Vector3(-0.13 + 0.01 * Math.cos((time+0.7) / 300), -0.1 + 0.01 * Math.sin((time+0.7) / 300), -0.4).normalize();
        //     path.tv = new TVec(pos, dir);
        //     path.trace(diorama);
        //
        // });
    }

    tick(time,dTime){

        if(this.params.animate) {

            //rerun to get a new random path
            let pos = new Vector3(0, 0, 4.8);
            let dir = new Vector3(-0.13, -0.1, -0.4).normalize();

            this.path.tv = new TVec(pos, dir);
            this.path.totalDist = 0.;
            this.path.trace(this.diorama);
        }

       //this.path.showBounces(Math.floor(time));
    }
}


export default Test;
