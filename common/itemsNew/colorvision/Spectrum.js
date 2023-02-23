import {Color} from "../../../3party/three/build/three.module.js";
import ColoredBarGraph from "../../components/colorvision/ColoredBarGraph.js";



let defaultParams = {
    domain:{min:-3,max:3},
    spectralCurve: function(f){
        return Math.exp(-f*f/1.);
    }
}






class Spectrum{
    constructor(params=defaultParams){

        this.params = params;
        this.curve = params.spectralCurve;
        this.domain = params.domain;

       this.createBars();
    }

    createBars(){

        let thisObj=this;

        let toDomain=function(x){
            let spread = (thisObj.domain.max-thisObj.domain.min);
            return (x+thisObj.domain.min)/spread;
        }

        let rescaledCurve = function(x){
            let y = toDomain(x);
            return thisObj.curve(y);
        }


        function spectralColor(x,y){

            //freq is rescaled between 0 and 1
            let freq = (x+thisObj.domain.min)/(thisObj.domain.max-thisObj.domain.min);
            let hue = 0.7*freq-0.3;
            let saturation=0.5;
            let lightness= 0.5;

            return new Color().setHSL(hue,saturation,lightness);
        }


        this.bar = new ColoredBarGraph(rescaledCurve,spectralColor,this.domain);
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



export default Spectrum;
