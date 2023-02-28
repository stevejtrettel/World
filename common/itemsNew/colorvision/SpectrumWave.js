import {Color, Vector3,} from "../../../3party/three/build/three.module.js";
import Spectrum from "../../components/colorvision/Spectrum.js";
import EMWave from "../../components/colorvision/EMWave.js";
import {Rod} from "../../components/basic-shapes/Rod.js";


let simpleCurve = function(f){
    return  3.*Math.exp(-305.*(f-0.3)*(f-0.35))+0.1;
}
let medCurve = function(f) {
    let val = 3. * Math.exp(-15. * (f - 0.5) * (f - 0.5)) + Math.sin(30. * f) / 8. - 2.5 * Math.exp(-600 * (f - 0.6) * (f - 0.6));
    return Math.max(val, 0);
}

let hardCurve = function(f){
    let val = 3.*Math.exp(-15.*(f-0.5)*(f-0.5))+Math.sin(30.*f)/8.-2.5*Math.exp(-600*(f-0.6)*(f-0.6))-4.*Math.exp(-800*(f-0.3)*(f-0.3))
        val = val-Math.exp(-600*(f-0.45)*(f-0.45))+2.*Math.exp(-600*(f-0.3)*(f-0.3));
    val = val + Math.exp(-1000*(f-0.05)*(f-0.05));
    return Math.max(val,0.001);
};


//the spectral curve takes values in (0,1):
//0 is red, and 1 is blue (should we show outside of this range YES??)
let defaultParams = {
    spectralCurve: hardCurve,
    currentPos:0,
};



class SpectrumWave{
    constructor(params=defaultParams){
        this.params=params;

        this.N=1000;

        //rescale the spectral curve to take in data from (0,1) instead of domain:
        this.curve = this.params.spectralCurve;

        this.waveData = {
            freq: 3,
            amp: 1,
            t: 0,
        };


        this.spectrum = new Spectrum(this.curve,this.N);
        this.spectrum.setPosition(0,-2,0);

        this.wave = new EMWave(3,1);
        this.wave.setPosition(0,3,0);

        this.currentPos = new Rod({
            end1:new Vector3(0,0,0),
            end2:new Vector3(0,1,0),
            color:0xffffff,
            radius:0.15,
        });
        this.currentPos.setPosition(0,-2,0);
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
        this.currentPos.addToScene(scene);
    }

    addToUI(ui){
        let thisObj=this;
        ui.add(thisObj,"N",1,100,1).onChange(function(val) {
                thisObj.spectrum.setN(val*val/10.);
                thisObj.spectrum.update();
            }
        )
    }

    tick(time,dTime){

            //
            // this.N = Math.min(time/2.+ Math.exp(time / 2.) + 5., 1000);
            // this.spectrum.setN(this.N);


        this.waveData.t=time/3;
        let timeParam = Math.floor(this.N*(1+Math.sin(time/3))/2.)/this.N;
        let amp = this.curve(timeParam);
        this.wave.setFreq(timeParam);
        this.wave.setAmp(amp/1.5);
        this.wave.update();

        let s = (timeParam-0.5)*10.;
        let end1 = new Vector3(s,0,0);
        let end2 = new Vector3(s,amp,0);
        this.currentPos.resize(end1,end2);

        // this.wave.setVisibility(false);
        this.currentPos.setVisibility(false);
        this.spectrum.setVisibility(false);

        let params = {};

        this.spectrum.update(params);
    }
}



export default SpectrumWave;