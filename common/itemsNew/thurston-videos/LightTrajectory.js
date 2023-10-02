import {Vector3} from "../../../3party/three/build/three.module.js";
import RodChain from "../../components/thurston-videos/RodChain.js";
import Environment from "../../components/thurston-videos/Environment.js";
import {Sphere,TVec} from "../../components/thurston-videos/Objects.js";
import Path from "../../components/thurston-videos/Path.js";


let objList = {
    sph1: new Sphere(new Vector3(3,0,0),1),
    sph2: new Sphere(new Vector3(0,0,-2),0.5),
    sph3: new Sphere(new Vector3(0,3,0),0.5),
}
let env = new Environment(objList);


class LightTrajectory {
    constructor(){

        this.env = env;
        this.tv = new TVec(new Vector3(0,0,0), new Vector3(1,1,1));
        this.path = new Path({
            env:this.env,
            tv: this.tv,
            n:10,
        });
    }

    addToScene(scene){
        this.path.addToScene(scene);
    }

    addToUI(ui){
    }

    tick(time,dTime){
    }
}

export default LightTrajectory;


