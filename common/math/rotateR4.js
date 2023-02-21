import {Matrix4,Vector4} from "../../3party/three/build/three.module.js";

function rotateR4JS(p, x, y, u){
    let cS = Math.cos(y);
    let sS = Math.sin(y);
    let cT = Math.cos(x);
    let sT = Math.sin(x);
    let cU = Math.cos(u);
    let sU = Math.sin(u);

    let rotMatY = new Matrix4().set(
        cS,0,-sS,0,
        0,cS,0,-sS,
        sS,0,cS,0,
        0,sS,0,cS
    ).transpose();

    let rotMatX = new Matrix4().set(
        cT,0,0,-sT,
        0,cT,-sT,0,
        0,sT,cT,0,
        sT,0,0,cT
    ).transpose();

    let rotMatU = new Matrix4().set(
        cU,-sU,0,0,
        sU,cU,0,0,
        0,0,cU,-sU,
        0,0,sU,cU
    ).transpose();

    let totalRot = new Matrix4().multiplyMatrices(rotMatU,rotMatY).multiply(rotMatX);
    return p.clone().applyMatrix4(totalRot);
};



export {rotateR4JS};
