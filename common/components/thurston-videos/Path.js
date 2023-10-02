import {Vector3} from "../../../3party/three/build/three.module.js";
import RodChain from "./RodChain.js";

//given a scene and an initial tangent direction, build a RodChain

class Path{
    constructor(params) {
        this.env = params.env;
        this.tv = params.tv;
        this.n = params.n || 10.;

        this.trace();
        this.chain = new RodChain({pts:this.pts});
    }

    addToScene(scene){
        this.chain.addToScene(scene);
    }

    trace(){
        this.pts = [];
        let temp = this.tv;
        for(let i=0; i<this.n; i++) {
            this.env.raymarch(temp);
            this.pts.push(temp.pos);
        }
    }

    update(tv){
        this.tv = tv;
        this.trace();
        this.chain.updatePts(this.pts);
    }

}

export default Path;