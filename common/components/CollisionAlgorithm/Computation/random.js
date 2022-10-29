import {Vector3} from "../../../../3party/three/build/three.module.js";

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function randomVector3(rng){
    let x = getRandom(-rng,rng);
    let y = getRandom(-rng,rng);
    let z = getRandom(-rng,rng);
    return new Vector3(x,y,z);
}




//pick a hex color by specifying hue saturation and lightness
function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
    };
    return `0x${f(0)}${f(8)}${f(4)}`;
}


export {getRandom, randomVector3, hslToHex};