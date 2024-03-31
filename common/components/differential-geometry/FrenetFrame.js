import {Vector3} from "../../../3party/three/build/three.module.js";

import Vector from "../basic-shapes/Vector.js";


let defaultOptions = {
    tColor:0xffffff,
    nColor:0xffffff,
    bColor:0xffffff,
    size:1,
}
class FrenetFrame{
    constructor(eqn,options=defaultOptions) {

        this.options=options;
        this.eqn = eqn;
        //compute these quantities with compute TNB:
        this.pos;
        this.tangent;
        this.normal;
        this.binormal;

        this.computeTNB(0);

        //initialize the vectors
        this.T = new Vector(this.tangent.clone().multiplyScalar(options.size), options.tColor||0xffffff,options.size||1);
        this.T.setPos(this.pos);
        this.N = new Vector(this.normal.clone().multiplyScalar(options.size), options.nColor||0xffffff,0.99*(options.size||1));
        this.N.setPos(this.pos);
        this.B = new Vector(this.binormal.clone().multiplyScalar(options.size), options.bColor||0xffffff,0.98*(options.size||1));
        this.B.setPos(this.pos);

    }


    computeTNB(s,params={}){
        let epsilon = 0.001;

        let prev = this.eqn(s-epsilon, params);
        let current = this.eqn(s,params);
        let next = this.eqn(s+epsilon, params);

        this.pos = current;
        this.tangent = new Vector3().subVectors(next,prev);
        this.tangent.normalize();

        //get normal by next-2current+prev
        this.normal = new Vector3().subVectors(new Vector3().addVectors(next,prev), current.clone().multiplyScalar(2));
        this.normal.normalize();

        this.binormal = new Vector3().crossVectors(this.tangent,this.normal);

    }

    resetTNBVectors(){
        this.T.setDir(this.tangent.clone().multiplyScalar(this.options.size));
        this.T.setPos(this.pos);
        this.N.setDir(this.normal.clone().multiplyScalar(this.options.size));
        this.N.setPos(this.pos);
        this.B.setDir(this.binormal.clone().multiplyScalar(this.options.size));
        this.B.setPos(this.pos);
    }

    addToScene(scene) {
        this.T.addToScene(scene);
        this.N.addToScene(scene);
        this.B.addToScene(scene);
    }

    resetCurve(eqn){
        this.eqn=eqn;
    }

    update(s,params){
        this.computeTNB(s,params);
        this.resetTNBVectors();
    }

}



export default FrenetFrame;