import PolyLine from "./PolyLine.js";
import BallList from "./BallList.js";

let defaultOptions = {
    color: 0xebc034,
        //0xffffff,
    clearcoat:true,
    radius:0.02,
};


class LightRay{
    constructor(maxN=100) {

        this.maxN = maxN;

        let rodOptions = {
            radius: 0.025,
            color:0xffffff,
        };
        this.rods = new PolyLine(rodOptions, maxN);

        let ballOptions = {
            radius:0.05,
            color: 0xffffff,
        };
        this.balls = new BallList(ballOptions, maxN);

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
