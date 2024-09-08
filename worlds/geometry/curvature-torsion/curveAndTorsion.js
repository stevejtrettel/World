
import {SpaceCurve} from "../../../code/compute/parametric/SpaceCurve.js";




//build a curve from its curvature and torsion functions!
//set in the background the curvature and torsion functions




//using GLOBAL object math.parser: this is from the 3rd party math file loaded in the html
const parser = math.parser();


//ideally will read these in from a menu!

let inputs = {
    curvature: 'a*s',
    torsion: '1.',
    a: 0,
    b:0,
    c:0,
};
let equations = {
    curvatureFull: parser.evaluate('curvatureFull(s,a,b,c)='.concat(inputs.curvature)),
    torsionFull: parser.evaluate('torsionFull(s,a,b,c)='.concat(inputs.torsion)),
    curvature: (s)=>equations.curvatureFull(s,inputs.a, inputs.b, inputs.c),
    torsion: (s)=>equations.torsionFull(s,inputs.a, inputs.b, inputs.c),
}

inputs.addToUI = (ui)=>{
    let eqnFolder = ui.addFolder(`Equations`);
    eqnFolder.add(inputs,'curvature').name('curvature(s)=').onChange(
        ()=>{
            equations.curvatureFull =parser.evaluate('curvatureFull(s,a,b,c)='.concat(inputs.curvature));
            spaceCurve.reset(equations.curvature, equations.torsion);
        });
    eqnFolder.add(inputs,'torsion').name('torsion(s)=').onChange(
        ()=>{
            equations.torsionFull =parser.evaluate('torsionFull(s,a,b,c)='.concat(inputs.torsion));
            spaceCurve.reset(equations.curvature, equations.torsion);
        });

    //add a folder for parameters a,b,c?
    let paramFolder = ui.addFolder(`Parameters`);
    paramFolder.add(inputs, 'a', -1,1,0.01).onChange(
        ()=>{
            spaceCurve.reset(equations.curvature, equations.torsion);
        });
    paramFolder.add(inputs, 'b', -1,1,0.01).onChange(
        ()=>{
            spaceCurve.reset(equations.curvature, equations.torsion);
        });
    paramFolder.add(inputs, 'c', -1,1,0.01).onChange(
        ()=>{
            spaceCurve.reset(equations.curvature, equations.torsion);
        });
};
inputs.addToScene = ()=>{};







let spaceCurve = new SpaceCurve( equations.curvature, equations.torsion, 10., 0.05 );
spaceCurve.addToUI=function(ui){};
spaceCurve.tick=function(time,dTime){};
//animate the space curve:
// spaceCurve.tick= function( time, dTime ){
//     let curvature = (s)=>s;
//     let torsion = (s)=>Math.sin(time)*Math.abs(s);
//     spaceCurve.reset(curvature, torsion);
// }




let curveAndTorsion = {
    inputs: inputs,
    spaceCurve: spaceCurve,
};

export default curveAndTorsion;
