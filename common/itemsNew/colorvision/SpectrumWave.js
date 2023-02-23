import {Color} from "../../../3party/three/build/three.module.js";
import Spectrum from "../../components/colorvision/Spectrum.js";
import EMWave from "../../components/colorvision/EMWave.js";


//the spectral curve takes values in (0,1):
//0 is red, and 1 is blue (should we show outside of this range YES??)
let defaultParams = {
    spectralCurve: function(f){
        return 3.*Math.exp(-15.*(f-0.5)*(f-0.5));
    },
    currentPos:0,
};


class SpectrumWave{
    constructor(params=defaultParams){
        this.params=params;

        this.N=100;

        //rescale the spectral curve to take in data from (0,1) instead of domain:
        this.curve = this.params.spectralCurve;

        this.waveData = {
            freq: 3,
            amp: 1,
            t: 0,
        };


        this.spectrum = new Spectrum(this.curve,100);
        this.spectrum.setPosition(0,-2,0);

        this.wave = new EMWave(3,1);
        this.wave.setPosition(0,3,0);
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


    addToScene(scene){
        this.spectrum.addToScene(scene);
        this.wave.addToScene(scene);
    }

    addToUI(ui){
        let thisObj=this;
        ui.add(thisObj,"N",1,100,1).onChange(function(val) {
                thisObj.spectrum.setN(val);
                thisObj.spectrum.update();
            }
        )
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