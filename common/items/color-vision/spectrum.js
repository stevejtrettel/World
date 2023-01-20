import {Color} from "../../../3party/three/build/three.module.js";
import coloredBarGraph from "../../components/ColorVision/coloredBarGraph.js";

function spectralColor(x,y){
    let hue = (x+5)/12;
    let saturation=0.5;
    let lightness=0.5;

    return new Color().setHSL(hue,saturation,lightness);
}




class Spectrum{
    constructor(curve){

        this.curve = curve;

        this.plotDomain={min:-5,max:5};
        //convert domain {-5,5} into
        let toDomain=function(x,dom){
            let spread = 10;
            return (x-5)/spread;
        }

        let rescaledCurve = function(x){
            return this.curve(toDomain(x,this.plotDomain));
        }

        this.bar = new coloredBarGraph(rescaledCurve,spectralColor,this.plotDomain);

    }

    addToScene(scene){
        this.bar.addToScene(scene);
    }

    addToUI(ui){

    }

    tick(time,dTime){
        let params = {};
        this.bar.update(params);
    }
}



//spectralCurve is between 0 and 1:
//then gets rescaled for range:
let spectralCurve = function(freq){
    return freq*(1-freq);
}


let ex = new Spectrum(spectralCurve);
export default {ex};