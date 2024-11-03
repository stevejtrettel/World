import {Vector3} from "../../../../3party/three/build/three.module.js";

import Path from "../../../../code/items/raytrace/Path.js";
import TVec from "../../../../code/items/raytrace/TVec.js";

import boxScene from "./boxScene.js";


class Test{
    constructor() {

        this.params = {
            animate:false,
            n:-1,
            t: 0,
        }



        this.t=0;

        //use some diorama
        this.diorama = boxScene;


        this.paths = [];

        let origPos = new Vector3(0,0,4,8);
        let origDir = new Vector3(0,-0.2,-0.8);
        this.res = 20;

        for(let i=0;i<this.res;i++){
            this.paths.push([]);
            for(let j=0;j<this.res;j++) {
                let di= 3.*(i-this.res/2)/this.res;
                let dj = 3.*(j-this.res/2)/this.res;
                let pos=origPos.clone().add(new Vector3(di,dj,0));
                let dir = origDir.clone().add(new Vector3(di/3,dj/3,0)).normalize();
                let tv = new TVec(pos,dir);
                let path = new Path(tv,20);
                path.trace(this.diorama);
                path.showBounces(-1);
                path.traj.setColor(0xffffff);
                this.paths[i].push(path);
            }
        }
    }




    addToScene(scene){

        this.diorama.addToScene(scene);
        for(let i=0;i<this.res;i++){
            for(let j=0;j<this.res;j++) {
                this.paths[i][j].addToScene(scene);
            }
        }
    }

    addToUI(ui){
        let obj=this;
        // ui.add(this.params,'reset');
        ui.add(this.params,'animate');
        ui.add(this.params,'n',-1,20,1).onChange(function(value){

            for(let i=0;i<obj.res;i++){
                for(let j=0;j<obj.res;j++) {
                    obj.paths[i][j].showBounces(value);
                }
            }
        })
    }

    tick(time,dTime) {

        if (this.params.animate) {
            this.t += 0.03;
            for (let i = 0; i < this.res; i++) {
                for (let j = 0; j < this.res; j++) {
                    this.paths[i][j].showBounces(Math.floor(this.t));
                }
            }
        }
    }
}


export default Test;
