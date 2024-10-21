import PolyLine from "./PolyLine.js";
import {MeshPhysicalMaterial, TubeGeometry, Mesh} from "../../../3party/three/build/three.module.js";
import InstancedBall from "./InstancedBall.js";


let defaultOptions = {
    color: 0xffffff,
    clearcoat:true,
    radius:0.05,
    ballScale:1.5,
};


class RodBallChain{
    constructor(pts, options=defaultOptions) {

        this.options=options;

        this.pts = pts;

        this.rods = new PolyLine(pts,options,100);
        this.balls = new InstancedBall(this.pts,options,100);

    }

    addToScene(scene){
        this.balls.addToScene(scene);
        this.rods.addToScene(scene);
    }

    setPoints(pts){

        this.pts=pts;

        this.balls.setPoints(pts);
        this.rods.setPoints(pts);

    }

}


export default RodBallChain;
