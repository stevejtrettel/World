import {Rod} from "./Calculus/Rod.js";


class RodChain{
    constructor(pts,rad=0.1){
        this.pts = pts;
        this.numRods = pts.length -1;

        this.rods = [];
        let currentRad = rad;
        for(let i=0;i<this.numRods;i++){
            let r = new Rod({end1:this.pts[i],end2:this.pts[i+1],radius:currentRad});
            this.rods.push(r);
            currentRad *=0.95;
        }

    }

    update(pts){
        this.pts=pts;
        for(let i=0;i<this.numRods;i++){
            this.rods[i].resize(this.pts[i],this.pts[i+1]);
        }
    }


    addToScene(scene){
        for(let i=0;i<this.numRods;i++){
            this.rods[i].addToScene(scene);
        }
    }


    setPosition(x,y,z){
        for(let i=0; i<this.numRods; i++){
            this.rods[i].setPosition(x,y,z);
        }
    }
}


export default RodChain;