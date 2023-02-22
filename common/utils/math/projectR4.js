import {Vector3,Vector4} from "../../../3party/three/build/three.module.js";


function orthographicProj(p){
    return new Vector3(p.x,p.y,p.z);
}


function stereographicProj(p){
    let P = new Vector3(p.x,p.y,p.z);
        return P.divideScalar(1.+p.w);
}


function invStereographicProj(p){
    let r2 = p.lengthSq();
    let q = new Vector4(p.clone.multiplyScalar(2.),r2-1.).divideScalar(r2+1);
    return q;

}


function stereographicProjX(p){
    let P = new Vector3(p.y,p.z,p.w);
    return P.divideScalar(1.+p.x);
}

function perspectiveProj(p) {
    let offset = 2.;
    let P = new Vector3(p.x,p.y,p.z);
    return P.divideScalar(offset+p.w).multiplyScalar(2);
}



export{
    stereographicProj,
    stereographicProjX,
    invStereographicProj,
    perspectiveProj,
}