import {Color} from "../../../3party/three/build/three.module.js";
import ColoredBarGraph from "../../components/colorvision/ColoredBarGraph.js";
import EMWave from "../../components/colorvision/em-waves.js";


let defaultParams = {
    domain:{min:-2,max:2},
    spectralCurve: function(f){
        return 3.*Math.exp(-f*f/20.);
    },
    currentPos:0,
};


class SpectrumWave{
    constructor(params=defaultParams){
        this.params=params;
        this.domain = params.domain;

        //rescale the spectral curve to take in data from (0,1) instead of domain:
        this.curve = this.rescaleCurve(this.params.spectralCurve);

        this.waveData = {
            freq: 3,
            amp: 1,
            t: 0,
        };

        this.createSpectrum();
        this.createWave();
    }


    rescaleCurve(fn){
        let thisObj = this;

        //convert from natural domain of fn to (0,1)
        let fromUnitInterval=function(x){
            let spread = (thisObj.domain.max-thisObj.domain.min);
            return x*spread-thisObj.domain.min;
        }

        return function(x){
            let y = fromUnitInterval(x);
            return fn(y);
        }

    }


    createSpectrum(){

        let thisObj=this;

        function spectralColor(x,y){

            //freq is rescaled between 0 and 1
            let freq = (x+thisObj.domain.min)/(thisObj.domain.max-thisObj.domain.min);
            let hue = 0.7*freq-0.3;
            let saturation=0.7;
            let lightness= 0.5;

            return new Color().setHSL(hue,saturation,lightness);
        }

        this.spectrum = new ColoredBarGraph(this.curve,spectralColor,this.domain);
        this.spectrum.setPosition(0,-2,0);
    }

    createWave(){

        this.wave = new EMWave(3,1);
        this.wave.setPosition(0,3,0);
    }




    addToScene(scene){
        this.spectrum.addToScene(scene);
        this.wave.addToScene(scene);
    }

    addToUI(ui){

    }

    tick(time,dTime){

        //this.waveData.t=time;
        let timeParam = 1+Math.sin(time)/2.;
        this.waveData.freq = 10.*timeParam;
        this.waveData.amp = this.curve(timeParam);
        console.log(this.waveData.amp);
        this.wave.update(this.waveData);

        let params = {};
        this.spectrum.update(params);
    }
}



export default SpectrumWave;