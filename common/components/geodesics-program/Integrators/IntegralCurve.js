
//takes in an integrator, a parameterization, and then some curve params and returns the curve
//parameterization is a function (integrator output)->vec3
//the input curve params are:
//{iniState, length, stopFn}
//the input display params are:
//{tubeRad, ballRad, color}

class IntegralCurve{
    constructor(integrator, curveParams, displayParams) {
        this.integrator = integrator;
        this.curveParams = curveParams;
        this.displayParams = displayParams;
    }


}



export default IntegralCurve;