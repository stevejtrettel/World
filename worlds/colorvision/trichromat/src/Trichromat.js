import Spectrum from "../../../../code/items/misc/Spectrum.js";
import ConeCell from "../../../../code/items/misc/ConeCell.js";
import {Color} from "../../../../3party/three/build/three.module.js";



let kernelSpectrum =function(f,params={time:0}){
        let val = 3.*Math.exp(-15.*(f-0.5)*(f-0.5))+Math.sin(30.*f)/8.-2.5*Math.exp(-600*(f-0.6)*(f-0.6))-4.*Math.exp(-800*(f-0.3)*(f-0.3))-Math.exp(-600*(f-0.45)*(f-0.45))+2.*Math.exp(-600*(f-0.3)*(f-0.3))+0.5*Math.sin(50.*(f-params.time));
        return Math.max(val,0.001);
    };

let greenSpectrum = function (f,params={time:0}){
    let x = f-(Math.sin(params.time)+1)/2;
    x *= 20.;
    let val = 2.-Math.pow(x,6);
    return Math.max(val,0.001);
};

let defaultParams = {
    L:{
        response:function(x) {
            let arg = Math.pow(x - 0.45, 2.);
            return 2.3 * Math.exp(-35. * arg);
        },
        color:new Color().setHSL(0.0,0.8,0.5),
    },
    M:{
        response:function(x) {
            let arg = Math.pow(x - 0.55, 2.);
            return 3.5 * Math.exp(-35. * arg);
        },
        color:new Color().setHSL(0.4,0.8,0.5),
    },
    S:{
        response: function(x) {
            let arg = Math.pow(x - 0.8, 2.);
            return 4 * Math.exp(-95. * arg);
        },
        color:new Color().setHSL(0.65,0.8,0.5),
    },
    spectrum: greenSpectrum,
};


class Trichromat {
    constructor(params=defaultParams) {

        this.params={
            time:0,
            N:1000,
        }

        this.spectrum = new Spectrum(params.spectrum,this.params.N);
        this.spectrum.update({time:0});
        this.spectrum.setPosition(0,5,0);

        this.LCone = new ConeCell(params.L.response,params.L.color,this.params.N);
        this.LCone.setSpectrum(params.spectrum);
        this.LCone.setPosition(0,-2,2);

        this.MCone = new ConeCell(params.M.response,params.M.color,this.params.N);
        this.MCone.setSpectrum(params.spectrum);
        this.MCone.setPosition(0,-2,0);

        this.SCone = new ConeCell(params.S.response,params.S.color,this.params.N);
        this.SCone.setSpectrum(params.spectrum);
        this.SCone.setPosition(0,-2,-2);
    }

    addToScene(scene){
        this.LCone.addToScene(scene);
        this.MCone.addToScene(scene);
        this.SCone.addToScene(scene);
        this.spectrum.addToScene(scene);
    }

    addToUI(ui){

    }

    tick(time,dTime){
        this.params.time = time/10.;
        this.spectrum.update(this.params)
        this.LCone.update(this.params);
        this.MCone.update(this.params);
        this.SCone.update(this.params);
    }

}


export default Trichromat;
