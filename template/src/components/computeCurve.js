
import {SpaceCurve} from "../../../common/objects/SpaceCurve.js";




//build a curve from its curvature and torsion functions!
//set in the background the curvature and torsion functions


const curvature = (s)=> s;

const torsion = (s)=> Math.sin(s);




let spaceCurve = new SpaceCurve( curvature, torsion, 10., 0.05 );

//animate the space curve:
spaceCurve.tick= function( time, dTime ){
    let curvature = (s)=>s;
    let torsion = (s)=>Math.sin(time)*Math.abs(s);
    spaceCurve.setInvariants(curvature, torsion);
    spaceCurve.integrate();
    spaceCurve.resetCurve(spaceCurve.curve);
}




let computeCurve = {
    spaceCurve: spaceCurve,
};

export { computeCurve };
