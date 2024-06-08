

//------------------------------------------------------------------
// PART OF THE COLOR VISION COLLECTION OF PROGRAMS
//-------------------------------------------------------------------



import { spectralColor } from "../../utils/colors.js";


//input to a spectrum is a normalized spectral curve:
//this takes visible light values between 0 (red) and 1 (blue)
//but allows inputs outside of this if we opt for ExtendedDomain

//the curve is re-scaled for display,
//and a spectral color function is used to color each bar

import BarGraph from "../basic-shapes/BarGraph.js";
import {Color} from "../../../3party/three/build/three.module.js";

class Spectrum{
    constructor(spectralCurve, N=1000){

        this.N=N;
        this.spectralCurve = spectralCurve;

        this.domain = {min:-5,max:5};
        this.initialize();

        this.barGraph = new BarGraph(this.rescaledCurve, this.rescaledColor,this.domain,this.N);

    }

    initialize(){
        let thisObj = this;

        this.toDomain = function(x){
            let spread = thisObj.domain.max-thisObj.domain.min;
            return thisObj.domain.min + x*spread;
        }

        this.fromDomain = function(x){
            let spread = thisObj.domain.max-thisObj.domain.min;
            return (x-thisObj.domain.min)/spread;
        }

        this.rescaledCurve = function(x,params){
            return thisObj.spectralCurve(thisObj.fromDomain(x),params);
        }

        this.rescaledColor = function(x,params){
            return spectralColor(thisObj.fromDomain(x),params);
        }


    }

    setN(N){
        this.barGraph.setN(N);
    }

    setVisibility(value){
        this.barGraph.setVisibility(value);
    }

    addToScene(scene){
        this.barGraph.addToScene(scene);
    }

    setPosition(x,y,z){
        this.barGraph.setPosition(x,y,z);
    }

    update(params){
        this.barGraph.update(params);
    }

}



export default Spectrum;
