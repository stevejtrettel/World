import { MathUtils, Vector2, Vector3} from "../../../../3party/three/build/three.module.js";



//uniformly randomly distributed vec3 on surface of unit sphere
function randomVec3Sphere( ){
    let theta = MathUtils.randFloat(0,6.29);
    let z = MathUtils.randFloat(-1,1);
    //this is a random point on the cylinder (theta,z)

    //use archimedes area preserving horizontal projection:
    let R = Math.sqrt(1-z*z);
    let pt = new Vector3( R*Math.cos(theta), R*Math.sin(theta), z);

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


export {randomVec3Sphere, randomExponential};
