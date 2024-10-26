import TVec from "../TVec.js";

function reflectIn(tv,normal){

    let proj = tv.dir.dot(normal.dir);
    let dir = tv.dir.clone().sub(normal.dir.clone().multiplyScalar(2. * proj));

    return new TVec(tv.pos,dir);

}


export default reflectIn;
