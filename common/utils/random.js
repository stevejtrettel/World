
import {
    MathUtils,
    Vector3
} from "../../3party/three/build/three.module.js";




function randomVec3Sphere( Radius ){
    let theta = MathUtils.randFloat(0,6.29);
    let z = MathUtils.randFloat(-1,1);

    let pt = new Vector3( Math.cos(theta), Math.sin(theta), z);
    pt.multiplyScalar( Radius );

    return pt;
}





function randomVec3Ball( Radius ){

    let pt = randomVec3Sphere( Radius );

    let r = MathUtils.randFloat(0,1);
    r=Math.pow(r,1.3333);
    pt.multiplyScalar( r );

    return pt;
}



export {
    randomVec3Ball,
    randomVec3Sphere,
}
