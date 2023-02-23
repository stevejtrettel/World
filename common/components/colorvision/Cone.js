

class Cone{
    constructor(){

        //the color we draw the cone's response curve / result:
        this.color;

        //the response curve that's built into the cone's definition
        this.responseCurve;

        //a plot of this response curve:
        this.responseCurveGraph;

        //the result of integrating a specturm against the response curve
        this.result;

        //a box displaying this result
        this.resultGraph;
    }




    addToScene(){

    }


    setCurvePos(x,y,z){

    }

    setResultPos(x,y,z){

    }

    computeResponse( spectralCurve ){

    }
}



export default Cone;