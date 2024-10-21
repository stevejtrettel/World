import {Vector3} from "../../../../3party/three/build/three.module.js";
import RodBallChain from "../../../../code/items/basic-shapes/RodBallChain.js";

class RodTest{
    constructor() {
        let pts = [];
        for(let i=0;i<50;i++){
            let vec = new Vector3(Math.random(),Math.random(),Math.random()).multiplyScalar(10);
            pts.push(vec);
        }
        this.rod = new RodBallChain(pts,{color:0xffffff,radius:0.1,clearcoat:true});
    }


    addToScene(scene){
        this.rod.addToScene(scene);
    }

    addToUI(ui){

    }

    tick(time,dTime){

    }
}


export default RodTest;
