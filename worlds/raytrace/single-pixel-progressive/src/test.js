import {Vector3} from "../../../../3party/three/build/three.module.js";

import Path from "../../../../code/items/raytrace/Path.js";
import TVec from "../../../../code/items/raytrace/TVec.js";

import boxScene from "./boxScene.js";


class Test{
    constructor() {

        this.params = {
            animate:true,
            t: 0,
            reset:function(){
                this.t=0;
            }
        }

        this.t=0;

        //use some diorama
        this.diorama = boxScene;

        //create the path
       // let dir = new Vector3(-0.13, -0.1+0.01*0.71, -0.4-0.01*0.71).normalize();
        let dir = new Vector3(-0.13 + 0.1 , -0.1 , -0.4).normalize();
        this.tv = new TVec(new Vector3(0,0,4.8), dir);
        this.path = new Path(this.tv,500);

        //trace the rays through the scene.
        this.path.trace(this.diorama);

    }


    addToScene(scene){
        this.path.addToScene(scene);
        this.diorama.addToScene(scene);
    }

    addToUI(ui){
        let obj=this;

        ui.add(this.params,'reset').onChange(function(){
            obj.t=0;
        });
         ui.add(this.params,'animate');
        ui.add(this.params,'t',0,1,0.001).onChange(function(time){
            let pos = new Vector3(0, 0, 4.8);
            let dir = new Vector3(-0.13 + 0.1*time, -0.1*time + 0.1, -0.4).normalize();
            obj.path.tv = new TVec(pos, dir);
            obj.path.trace(obj.diorama);
            obj.t=0;

        });
    }

    tick(time,dTime){

        this.t+=0.01;

         if(this.params.animate) {
        //     let pos = new Vector3(0, 0, 4.8);
        //     let dir = new Vector3(-0.13 + 0.01 * Math.cos(time / 300), -0.1 + 0.01 * Math.sin(time / 300), -0.4).normalize();
        //
        //     this.path.tv = new TVec(pos, dir);
        //     this.path.totalDist = 0.;
        //     this.path.trace(this.diorama);
        this.t+=0.01;
        this.path.showBounces(Math.floor(this.t));
         }
      //  this.path.showBounces(Math.floor(this.t));
    }
}


export default Test;
