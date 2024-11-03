import {Vector3} from "../../../../3party/three/build/three.module.js";

import Path from "../../../../code/items/raytrace/Path.js";
import TVec from "../../../../code/items/raytrace/TVec.js";

import boxScene from "./boxScene.js";


class Test{
    constructor() {

        this.params = {
            animate:true,
            t: 0,
            reset:function(){},
        }

        this.t =0;

        //use some diorama
        this.diorama = boxScene;

        //create the path
        let dir = new Vector3(-0.13 + 0.1 , -0.1 , -0.4).normalize();
        this.tv = new TVec(new Vector3(0,0,4.8), dir);
        this.path = new Path(this.tv,500);

        let dir2 = new Vector3(-0.13 + 0.1 * Math.cos((0.198+0.7) / 100), -0.1 + 0.3 * Math.sin((0.198+0.7) / 300), -0.4).normalize();
        this.tv2 = new TVec(new Vector3(0,0,4.8),dir2);
        this.path2 = new Path(this.tv2,500);

        //trace the rays through the scene.
        this.path.trace(this.diorama);
        this.path2.trace(this.diorama);


    }


    addToScene(scene){
        this.path.addToScene(scene);
        this.path2.addToScene(scene);
        this.diorama.addToScene(scene);
    }

    addToUI(ui){
        let obj=this;
        ui.add(this.params,'reset').onChange(function(){
            obj.t=0;
        });
    }

    tick(time,dTime){

        this.t+=0.03;
        this.path.showBounces(Math.floor(this.t));
        this.path2.showBounces(Math.floor(this.t));
    }
}


export default Test;
