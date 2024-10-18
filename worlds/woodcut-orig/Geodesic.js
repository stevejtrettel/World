
import IntegralCurve from "../../code/packages/woodcuts/Integrator/IntegralCurve.js";

//essentially a wrapper for IntegralCurve that takes in a compute class
//and pulls out the acceleration to build the integrator

const defaultOptions = {
    length:40,
    color: 0x000000,
        //0xffffff,
    radius: 0.05,
    res: 100,
}

class Geodesic{
    constructor(surface, iniState, curveOptions = defaultOptions) {

        this.surface = surface;
        this.iniState = iniState;
        this.curveOptions = curveOptions;

        this.ep = 0.1;

        this.curve = new IntegralCurve(
            this.surface.integrator,
            this.surface.parameterization,
            this.iniState,
            this.curveOptions,
        );

    }

    addToScene(scene){
        this.curve.addToScene(scene);
    }

    updateSurface(){
        this.curve.updateIntegrator(this.surface.integrator,this.surface.parameterization);
    }

    updateLength(length){
        this.curveOptions.length = length;
        this.curve.setLength(length);
    }

    update(iniState){
        //get new initial state if it exists:
        this.iniState = iniState
        this.curve.update(this.iniState);
    }

    setVisibility(value){
        this.curve.setVisibility(value);
    }

    //get the point that is percent of the way along the curve
    getPoint(percent){
        return this.curve.curve.getPointAt(percent);
    }

    // printToString(numPts=500){
    //     return this.curve.printToString(numPts)+`\n\n`;
    // }

    //redo that also prints normal vectors:
    printToString(numPts=500){
        let precision = 4;
        let str = ``;
        for(let i=0;i<numPts;i++){
            let pt = this.curve.curve.getPoint(i/(numPts-1));

            //need to re-order so xyz is correct again
            let x = pt.x.toFixed(precision);
            let y = -pt.z.toFixed(precision);
            let z = pt.y.toFixed(precision);

            //now need to get the normal vector at this point:
            let nvec = this.surface.nvec({x:pt.x,y:pt.y});

            let nx = nvec.x.toFixed(precision);
            let ny = -nvec.z.toFixed(precision);
            let nz = nvec.y.toFixed(precision);

            let ptString = `(${x},${y},${z},${nx},${ny},${nz}), `;
            str += ptString;
        }
        this.curve.pointString = str;
        return str+'\n\n';
    }

    printToFile(fileName='geodesic', numPts=500){
        this.curve.printToString(numPts);
        this.curve.printToFile(fileName);
    }

}


export default Geodesic;
