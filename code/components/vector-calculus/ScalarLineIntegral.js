


class ScalarLineIntegral{
    constructor(parametricCurve, scalarFunction, domain){
        this.parametricCurve = parametricCurve;
        this.scalarFunction = scalarFunction;
        this.domain = domain;


        this.initialize();

        this.topCurve;
        this.top;

        this.bottomCurve;
        this.bottom;
        this.start;
        this.end;
        this.surface;
    }


    addToScene(scene){
        this.top.addToScene(scene);
        this.bottom.addToScene(scene);
        this.start.addToScene(scene);
        this.end.addToScene(scene);
        this.surface.addToScene(scene);
    }

    setDomain(domain){
        this.domain=domain;
    }

    setParametricCurve(curve){
        this.parametricCurve = curve;
    }

    setScalarFunction(scalarFunction){
        this.scalarFunction = scalarFunction;
    }

    update(){

    }
}


