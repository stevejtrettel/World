import BarGraph from "../basic-shapes/BarGraph.js";
import {BoxGeometry} from "../../../3party/three/build/three.module";


let defaultParams = {

}


class ConeCell{
    constructor(responseCurve, color, N=1000){

        this.params;
        this.N=N;

        //the color we draw the cone's response curve / result:
        this.color=color;

        //the response curve that's built into the cone's definition
        this.responseCurve=responseCurve;

        //a plot of this response curve:
        let colorFunction = function(x){
            return this.color;
        }
        this.responseCurveGraph = new BarGraph(this.responseCurve,colorFunction,{min:-5,max:5},this.N);

        //the result of integrating a specturm against the response curve
        this.result=0.;

        //a box displaying this result
        this.resultGraph=new BoxGeometry(0.5,0.5,0.5);
    }




    addToScene(){
        this.responseCurveGraph.addToScene(scene);
    }


    setCurvePos(x,y,z){

    }

    setResultPos(x,y,z){

    }

    computeResponse( spectralCurve ){

        this.resultGraph.scale(1,this.result,1);
    }

    update(){

    }
}



export default ConeCell;