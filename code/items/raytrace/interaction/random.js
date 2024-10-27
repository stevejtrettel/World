import { MathUtils, Vector2, Vector3} from "../../../../3party/three/build/three.module.js";


function mix(vec1, vec2, t){
    //convex combo of the TVecs
    let v1 = vec1.clone().multiplyScalar(t);
    let v2 = vec2.clone().multiplyScalar(1-t);
    let newVec = v1.add(v2);
    return newVec;
}



function randomVec3Sphere( Radius=1 ){
    let theta = MathUtils.randFloat(0,6.29);
    let z = MathUtils.randFloat(-1,1);

    let pt = new Vector3( Math.cos(theta), Math.sin(theta), z);
    pt.multiplyScalar( Radius );

    return pt;
}



// // get a single random sample from an exponential distribtution of specified mean
// //calculated by sampling uniform, and inverting CDF:
// //https://www.baeldung.com/cs/sampling-exponential-distribution
function randomExponential(mean){
    let u = Math.random();
    let x = -mean*Math.log(1-u);
    return x;
}


export {randomVec3Sphere,mix, randomExponential};
