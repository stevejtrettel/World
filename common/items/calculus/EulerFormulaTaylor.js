import {Vector2,Vector3} from "../../../3party/three/build/three.module.js";

import ParametricCurveCPU from "../../compute/parametric/ParametricCurveCPU.js";



function cmult(z,w){
    let real = z.x*w.x-z.y*w.y;
    let img = z.x+w.y+z.y*w.x;
    return new Vector2(real, img);
}

class EulerFormulaTaylor{

    constructor() {

        this.fn=function(t){

            let z = new Vector2(0,t);
            let temp = new Vector2(1,0);
            let total = new Vector2(1,0);
            for(let i =1; i<100;i++){
                temp = cmult(temp,z).multiplyScalar(1/i);
                total.add(temp.clone());
            }

            return new Vector3(total.x,0,total.y);
        };


        this.domain={min:0,max:4*Math.PI};
        let curveOptions = {};
        this.curve = new ParametricCurveCPU(this.fn, this.domain, curveOptions);

    }


    addToScene(scene){
        this.curve.addToScene(scene);
    }

    addToUI(ui){

    }

    tick(time,dTime){

    }
}



let ex = new EulerFormulaTaylor();

export default {ex};
