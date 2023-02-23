import {Color} from "../../3party/three/build/three.module.js";

function posNegColor(val){
    //set the color of this instance:
    //make it different for positive and negative areas:
    let hue,sat,lightness;
    if(Math.abs(val)<0.01){
        hue = 0.;
        sat = 0.0;
        lightness = 0.75;
    }
    else if(val>0){
        hue = 0.3;
        sat = 0.5;
        lightness = 0.5;
    }
    else{
        hue = 0.01;
        sat = 0.5;
        lightness = 0.5;
    }

    return new Color().setHSL(hue, sat, lightness);
}


//val is a percentage of the way along the visible spectrum, from 0 to 1
function spectralColor(x){
        let hue = x;
        let sat = 0.5;
        let light = 0.5;
        return new Color().setHSL(hue,sat,light);
}





export {posNegColor, spectralColor};