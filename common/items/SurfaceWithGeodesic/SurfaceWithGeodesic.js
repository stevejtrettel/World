import { RungeKutta } from "../../cpu/RungeKutta.js";

import { Surface } from "./components/Surface.js";
import { IntegralCurve } from "./structures/IntegralCurve.js";
import { ParametricSurface } from "./structures/ParametricSurface.js";

//An ITEM class which produces a surface, and a geodesic on that surface

class SurfaceWithGeodesic {
    constructor( surface, parameters ) {

        //store the data
        this.math = surface;
        this.parameters = parameters;

        //build the integrator
        const derive = (state) => this.math.getAcceleration(state);
        this.integrator = new RungeKutta( derive, 0.05 );


        //make the geodesic
        const intCurveParameters=[];
        const parameterization = (uv)=> this.math.getPoint( uv );
        this.geodesic = new IntegralCurve(
            this.integrator,
            parameterization,
            intCurveParameters,
            this.parameters,
            );

        //make the surface
        const surfaceParameters = [];
        this.surface = new ParametricSurface(
            this.math,
            surfaceParameters,
            this.parameters
        );

    }

    addToScene( scene ){

        this.geodesic.addToScene( scene );
        this.surface.addToScene( scene );

    }

    addToUI( ui ){

        for(let param in Object.keys(this.parameters)){
            //add things:
        }

    }

    tick( time, dTime ) {


    }
}
