import {Color} from "../../../3party/three/build/three.module.js";

import ConeCell from "../../../code/items/misc/ConeCell.js";
import Spectrum from "../../../code/items/misc/Spectrum.js";

let generalSpectrum =function(f,params={time:0}){
    let val = 3.*Math.exp(-15.*(f-0.5)*(f-0.5))+Math.sin(30.*f)/8.-2.5*Math.exp(-600*(f-0.6)*(f-0.6))-4.*Math.exp(-800*(f-0.3)*(f-0.3))-Math.exp(-600*(f-0.45)*(f-0.45))+2.*Math.exp(-600*(f-0.3)*(f-0.3))+0.5*Math.sin(20.*(f-params.time));
    return Math.max(val,0.001);
};

let lowFreqResponse = function(x){
    let arg = Math.pow(x-0.2,2.);
    return 3.*Math.exp(-45.*arg);
}

let lowFreqColor = new Color().setHSL(0.0,0.8,0.5);

let hardCurve = function(f,params={time:0}){
    let val = 3.*Math.exp(-15.*(f-0.5)*(f-0.5))+Math.sin(30.*f)/8.-2.5*Math.exp(-600*(f-0.6)*(f-0.6))-4.*Math.exp(-800*(f-0.3)*(f-0.3))-Math.exp(-600*(f-0.45)*(f-0.45))+2.*Math.exp(-600*(f-0.3)*(f-0.3))+Math.sin(30.*f-10.*params.time);
    return Math.max(val,0);
};

let shiftingSpectrum = function (f,params={time:0}){
    let x = f-(Math.sin(3.*params.time)+1)/2;
    x *= 20.;
    let val = 2.-Math.pow(x,6);
    return Math.max(val,0.001);
};

let defaultParams = {
    response: lowFreqResponse,
    color:lowFreqColor,
    spectrum:generalSpectrum,
}



class Monochromat {
    constructor(params=defaultParams) {

        this.params={
            time:0,
            N:1000,
        }

        this.spectrum = new Spectrum(params.spectrum,this.params.N);
        this.spectrum.update({time:0});
        this.spectrum.setPosition(0,3,0);

        this.cone = new ConeCell(params.response,params.color,this.params.N);
        this.cone.setSpectrum(params.spectrum);
        this.cone.setPosition(0,-4,0);
        //if you want the space out the response
        this.cone.responseCurveGraph.setPosition(0.,0.,0);
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
