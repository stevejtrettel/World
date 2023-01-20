import {Vector3} from "../../../3party/three/build/three.module.js";
import {ParametricTube} from "../../materials/ParametricTube";




class FunctionSlice1D{
    constructor(functionGLSL,) {

        this.functionGLSL=functionGLSL;



        this.rod = new ParametricTube();
        this.start;
        this.end;


    }



    addToScene(){

    }

    update(params={}){
        let controlPt = params.controlPt || 0.5;
        let dir = params.dir || new Vector3(1,1,1);



        this.start.position.set();
        this.end.position.set();

    }

}



export default FunctionSlice1D;