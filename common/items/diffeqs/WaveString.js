import {Vector3} from "../../../3party/three/build/three.module.js";

import ParametricCurve from "../../components/parametric/ParametricCurveCPU.js";
import {GlassPanel} from "../../components/basic-shapes/GlassPanel.js";

class WaveString{
    constructor() {

        this.params = {
            L: 5,
            n: 1,
            time:1,
        }

        this.domain = {min:-this.params.L,max:this.params.L};

        this.curve = function(x,params={n:1,L:5,time:1}){
            let lambda = Math.PI * params.n /params.L;
            let y =  Math.sin(lambda * x ) * Math.sin(lambda* params.time)/(params.n+0.1);
            return new Vector3(x,y,0);
        };

        this.wave = new ParametricCurve(this.curve, this.domain,{res:200});

        this.blackboard = new GlassPanel({
            xRange: this.domain,
            yRange: {min:-3, max:3}
        });
    }

    addToScene(scene){
        this.blackboard.addToScene(scene);
        this.wave.addToScene(scene);
    }

    addToUI(ui){
       ui.add(this.params,'n',0,10,1).name('n');
    }

    tick(time,dTime){
        this.params.time = time;
        this.wave.update(this.params);
    }

}

export default WaveString;