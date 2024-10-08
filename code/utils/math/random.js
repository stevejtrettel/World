
import {
    MathUtils, Vector2,
    Vector3
} from "../../../3party/three/build/three.module.js";



function randomDisk(){
    let theta = 2*Math.PI * Math.random();
    let r2 = Math.random();
    let r = Math.sqrt(r2);
    return new Vector2(r*Math.cos(theta), r*Math.sin(theta));
}


function randomVec3Sphere( Radius=1 ){
    let theta = MathUtils.randFloat(0,6.29);
    let z = MathUtils.randFloat(-1,1);

    let pt = new Vector3( Math.cos(theta), Math.sin(theta), z);
    pt.multiplyScalar( Radius );

    return pt;
}



function randomVec3Ball( Radius=1 ){

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
