import PolyLine from "./PolyLine.js";
import BallList from "./BallList.js";

let defaultOptions = {
    color: 0xebc034,
        //0xffffff,
    clearcoat:true,
    radius:0.02,
};


class LightRay{
    constructor(pts, options=defaultOptions) {

        this.pts = pts;

        let rodOptions = options;
        this.rods = new PolyLine(pts,rodOptions,100);

        let ballOptions = {
            color: options.color,
            clearcoat: options.clearcoat,
            radius: 3*options.radius,
        }
        this.balls = new BallList(this.pts,ballOptions,100);

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

    showBounces(N){
        //only show the first N bounces.
        //this means the first N+2 points and N+1 rods
        this.balls.setVisibility(N+2);
        this.rods.setVisibility(N+1);
    }

}


export default LightRay;
