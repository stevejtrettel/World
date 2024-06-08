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





function smoothStep(x){
    if(x<0){
        return 0;
    }
    if(x>1) {
        return 1
    }
    return 3.*x*x-2.*x*x*x;
}

//val is a percentage of the way along the visible spectrum, from 0 to 1
function spectralColor(x){
        x = smoothStep(1.2*x-0.1);
        let hue = 0.7*x;
        let sat = 0.5;
        let light = 0.5;
        return new Color().setHSL(hue,sat,light);
}

function spectralHue(x){
    x = smoothStep(1.2*x-0.1);
    return 0.7*x;
}



export {posNegColor, spectralColor,spectralHue};