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

        this.numPaths = 100;

        //use some diorama
        this.diorama = boxScene;

        //create the paths
        let dir = new Vector3(-0.13, -0.1+0.01*0.71, -0.4-0.01*0.71).normalize();
        this.tv = new TVec(new Vector3(0,0,4.8), dir);

        this.paths = [];
        for(let i=0; i<this.numPaths; i++) {
            this.paths.push( new OneBounce(this.tv) );
            this.paths[i].trace(this.diorama);
        }
    }


    addToScene(scene){
        for(let i=0; i<this.numPaths;i++){
            this.paths[i].addToScene(scene);
        }
        this.diorama.addToScene(scene);
    }

    addToUI(ui){
        let numPaths = this.numPaths;
        let tv = this.tv;
         let paths = this.paths;
         let diorama = this.diorama;
        //
        ui.add(this.params,'animate');
        ui.add(this.params,'t',0,1,0.001).onChange(function(time){
            //rerun to get a new random path
            let pos = new Vector3(0, 0, 4.8);
            let dir = new Vector3(-0.13+0.2*Math.sin(time/3), -0.2, -0.4).normalize();
            tv = new TVec(pos, dir);

            for(let i=0;i<numPaths;i++) {
                paths[i].tv = tv;
                paths[i].trace(diorama);
            }

        });
    }

    tick(time,dTime){
        if(this.params.animate) {

            //rerun to get a new random path
            let pos = new Vector3(0, 0, 4.8);
            let dir = new Vector3(-0.13+0.2*Math.sin(time/3), -0.2, -0.4).normalize();
            this.tv = new TVec(pos, dir);

            for(let i=0;i<this.numPaths;i++) {
                this.paths[i].tv = this.tv;
                this.paths[i].trace(this.diorama);
            }
        }
       //this.path.showBounces(Math.floor(time));
    }
}


export default Test;
