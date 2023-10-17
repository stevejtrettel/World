//gravitational force AT pos1 from mass2 and pos2
function gravForce(pos1, mass1, pos2, mass2){
    let relPos = pos2.clone().sub(pos1);
    let r2 = relPos.lengthSq();
    let dir = relPos.normalize();

    let force = dir.multiplyScalar(mass1*mass2/r2);
    return force;
}


export {gravForce};