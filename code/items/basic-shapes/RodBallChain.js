import PolyLine from "./PolyLine.js";
import {MeshPhysicalMaterial, TubeGeometry, Mesh} from "../../../3party/three/build/three.module.js";
import InstancedBall from "./InstancedBall.js";


let defaultOptions = {
    color: 0xd6aa4b,
        //0xffffff,
    clearcoat:true,
    radius:0.01,
};


class RodBallChain{
    constructor(pts, options=defaultOptions) {

        this.pts = pts;

        let rodOptions = options;
        this.rods = new PolyLine(pts,rodOptions,100);

        let ballOptions = {
            color: options.color,
            clearcoat: options.clearcoat,
            radius: 3*options.radius,
        }
        this.balls = new InstancedBall(this.pts,ballOptions,100);

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
