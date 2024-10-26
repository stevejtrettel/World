import {Vector3} from "../../../../3party/three/build/three.module.js";

import Path from "../../../../code/items/raytrace/Path.js";
import TVec from "../../../../code/items/raytrace/TVec.js";

import boxScene from "./boxScene.js";


class Test{
    constructor() {

        //use some diorama
        this.diorama = boxScene;

        //create the path
        this.tv = new TVec(new Vector3(0,0,4.8),new Vector3(0.49,-0.4,-1).normalize());
        this.path = new Path(this.tv,50);

        //trace the rays through the scene.
        this.path.trace(this.diorama);

    }


    addToScene(scene){
        this.path.addToScene(scene);
        this.diorama.addToScene(scene);
    }

    addToUI(ui){

    }

    tick(time,dTime){

       // this.path.tv = new TVec(new Vector3(0,0,4.8),new Vector3(0.73+0.1*Math.cos(time/30),-0.4+0.1*Math.sin(time/30),-1).normalize());
       // this.path.totalDist=0.;
       // this.path.trace(this.diorama);
        this.path.showBounces(Math.floor(time));
    }
}


export default Test;
