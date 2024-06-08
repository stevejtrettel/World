import {Color} from "../../../3party/three/build/three.module.js";

import ConeCell from "../../items/misc/ConeCell.js";
import Spectrum from "../../items/misc/Spectrum.js";


let lowFreq = function(x){
    let argR = Math.pow(x-0.15,2.);
    let argG = Math.pow(x-0.5,2.);
    let argB = Math.pow(x-0.8,2.);
    return 1.5*Math.exp(-705.*argB)+3.*Math.exp(-200*argG)+2.*Math.exp(-350*argR)+0.1;
}

let medFreq = function(x){
    let arg = Math.pow(x-0.5,2.);
    return Math.exp(-45.*arg);
}

let highFreq = function(x){
    let arg = Math.pow(x-0.6,2.);
    return 3.*Math.exp(-55.*arg);
}

let combinedFreq = function(x){
    return highFreq(x)+lowFreq(x);
}


let lowFreqColor = new Color().setHSL(0.0,0.8,0.5);

let hardCurve = function(f,params={time:0}){
    let val = 3.*Math.exp(-15.*(f-0.5)*(f-0.5))+Math.sin(30.*f)/8.-2.5*Math.exp(-600*(f-0.6)*(f-0.6))-4.*Math.exp(-800*(f-0.3)*(f-0.3))-Math.exp(-600*(f-0.45)*(f-0.45))+2.*Math.exp(-600*(f-0.3)*(f-0.3));
    val = val*2.*(1+0.5*Math.sin(4.*params.time));
    return Math.max(val,0.01);
};

let shiftingSpectrum = function (f,params={time:0}){
    let x = f-(Math.sin(3.*params.time)+1)/2;
    x *= 20.;
    let val = 2.-Math.pow(x,6);
    return Math.max(val,0.001);
};

let defaultParams = {
    response: medFreq,
    color:lowFreqColor,
    spectrum:lowFreq,
}



class Monochromat {
    constructor(params=defaultParams) {

        this.params={
            time:0,
            N:1000,
        }

        this.spectrum = new Spectrum(params.spectrum,this.params.N);
        this.spectrum.update({time:0});
        this.spectrum.setPosition(-2,0,0);

        this.cone = new ConeCell(params.response,params.color,this.params.N);
        this.cone.setSpectrum(params.spectrum);
        this.cone.setPosition(2,0,0);

        this.cone.responseCurveGraph.setVisibility(false);
        this.cone.activationCurveGraph.setVisibility(false);
    }

    addToScene(scene){
        this.cone.addToScene(scene);
        this.spectrum.addToScene(scene);
    }

    addToUI(ui){
        let thisObj=this;
        ui.add(thisObj.params,"N",1,1000,1).onChange(function(value){
            thisObj.cone.setN(value);
            thisObj.spectrum.setN(value);
            thisObj.cone.update(thisObj.params);
            thisObj.spectrum.update(thisObj.params);
        })
    }

    tick(time,dTime){
        this.params.time = time/10.;
        this.spectrum.update(this.params)
        this.cone.update(this.params);
    }
}

export default Monochromat;
