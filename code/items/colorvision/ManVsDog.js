import {Color} from "../../../3party/three/build/three.module.js";
import Spectrum from "../../components/misc/Spectrum.js";
import ConeCell from "../../components/misc/ConeCell.js";



let generalSpectrum =function(f,params={time:0}){
    let val = 3.*Math.exp(-15.*(f-0.5)*(f-0.5))+Math.sin(30.*f)/8.-2.5*Math.exp(-600*(f-0.6)*(f-0.6))-4.*Math.exp(-800*(f-0.3)*(f-0.3))-Math.exp(-600*(f-0.45)*(f-0.45))+2.*Math.exp(-600*(f-0.3)*(f-0.3))+0.5*Math.sin(20.*(f-params.time));
    return Math.max(val,0.001);
};

let defaultParams = {
    man: {
        L: {
            response: function (x) {
                let arg = Math.pow(x - 0.45, 2.);
                return 2.3 * Math.exp(-35. * arg);
            },
            color: new Color().setHSL(0.0, 0.8, 0.5),
        },
        M: {
            response: function (x) {
                let arg = Math.pow(x - 0.55, 2.);
                return 3.5 * Math.exp(-35. * arg);
            },
            color: new Color().setHSL(0.4, 0.8, 0.5),
        },
        S: {
            response: function (x) {
                let arg = Math.pow(x - 0.8, 2.);
                return 4 * Math.exp(-95. * arg);
            },
            color: new Color().setHSL(0.65, 0.8, 0.5),
        },
    },
    dog:{
        Y:{
            response:function(x) {
                let arg = Math.pow(x - 0.45, 2.);
                return 3.5 * Math.exp(-35. * arg);
            },
            color:new Color().setHSL(0.25,0.8,0.5),
        },
        P:{
            response: function(x) {
                let arg = Math.pow(x - 0.8, 2.);
                return 4 * Math.exp(-95. * arg);
            },
            color:new Color().setHSL(0.7,0.8,0.5),
        },
    },
    spectrum: generalSpectrum,
};

class ManVsDog{
    constructor(params=defaultParams) {

        this.params={
            time:0,
            N:1000,
        }

        this.spectrum = new Spectrum(params.spectrum,this.params.N);
        this.spectrum.update({time:0});
        this.spectrum.setPosition(0,5,0);

        this.LCone = new ConeCell(params.man.L.response,params.man.L.color,this.params.N);
        this.LCone.setSpectrum(params.spectrum);
        this.LCone.setPosition(0,-2,6);

        this.MCone = new ConeCell(params.man.M.response,params.man.M.color,this.params.N);
        this.MCone.setSpectrum(params.spectrum);
        this.MCone.setPosition(0,-2,5);

        this.SCone = new ConeCell(params.man.S.response,params.man.S.color,this.params.N);
        this.SCone.setSpectrum(params.spectrum);
        this.SCone.setPosition(0,-2,4);

        this.YCone = new ConeCell(params.dog.Y.response,params.dog.Y.color,this.params.N);
        this.YCone.setSpectrum(params.spectrum);
        this.YCone.setPosition(0,-2,-4);

        this.PCone = new ConeCell(params.dog.P.response,params.dog.P.color,this.params.N);
        this.PCone.setSpectrum(params.spectrum);
        this.PCone.setPosition(0,-2,-5);

    }

    addToScene(scene){
        this.LCone.addToScene(scene);
        this.MCone.addToScene(scene);
        this.SCone.addToScene(scene);
        this.YCone.addToScene(scene);
        this.PCone.addToScene(scene);
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
        this.PCone.update(this.params);
        this.YCone.update(this.params);
    }
}



export default ManVsDog;
