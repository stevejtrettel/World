import {Vector3} from "../../../../3party/three/build/three.module.js";

import Path from "../../../../code/items/raytrace/Path.js";
import OneBounce from "../../../../code/items/raytrace/OneBounce.js";
import TVec from "../../../../code/items/raytrace/TVec.js";

import boxScene from "./oneBallScene.js";


class Test{
    constructor() {

        this.params = {
            rerun:function(){},
            isotropy: 0.5,
            mfp:0.1,
        }

        this.numPaths = 50;

        //use some diorama
        this.diorama = boxScene;

        //create the paths
        let dir = new Vector3(-0., -0.2, -0.4).normalize();
        this.tv = new TVec(new Vector3(0,0,4.8), dir);

        this.paths = [];
        for(let i=0; i<this.numPaths; i++) {
            this.paths.push( new OneBounce(this.tv,1000) );
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

        ui.add(this.params,'rerun').onChange(function(){
            //rerun to get a new random path
            let pos = new Vector3(0, 0, 4.8);
            let dir = new Vector3(-0., -0.2, -0.4).normalize();
            tv = new TVec(pos, dir);
            for(let i=0;i<numPaths;i++) {
                paths[i].tv = tv;
                paths[i].trace(diorama);
            }
        });

        ui.add(this.params,'isotropy').onChange(function(value){
            console.log(diorama.objList[0]);
            diorama.objList[0].mat.isotropy = value;
            //rerun to get a new random path
            let pos = new Vector3(0, 0, 4.8);
            let dir = new Vector3(-0., -0.2, -0.4).normalize();
            tv = new TVec(pos, dir);
            for(let i=0;i<numPaths;i++) {
                paths[i].tv = tv;
                paths[i].trace(diorama);
            }
        });
    }

    tick(time,dTime){
    }
}


export default Test;
