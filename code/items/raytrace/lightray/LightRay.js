import PolyLine from "./PolyLine.js";
import BallList from "./BallList.js";

let defaultOptions = {
    color: 0xebc034,
        //0xffffff,
    clearcoat:true,
    radius:0.02,
};


class LightRay{
    constructor(pts) {

        this.pts = pts;

        let rodOptions = {
            radius: 0.02,
            color:0xffffff,
        };
        this.rods = new PolyLine(pts,rodOptions,100);

        let ballOptions = {
            radius:0.04,
            color: 0xffffff,
        };
        this.balls = new BallList(this.pts,ballOptions,100);

    }

    setColor(color){
        this.rods.setColor(color);
        this.balls.setColor(color);
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



    hitLight(bool){
        let color;
        if(bool){
            //make everything yellow
            color = 0xf0cd1d;
        }
        else{
            //make it dark red
            color = 0x2e0601;
        }

        this.setColor(color);
    }

}


export default LightRay;
