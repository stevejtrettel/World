import { CatmullRomCurve3 } from "../../3party/three/build/three.module.js";
import { colorConversion } from "../shaders/colors/colorConversion.js";
import { ParametricTube } from "./ParametricTube.js";


class IntegralCurve {

    constructor(integrator, parameterization, state, length ){

        this.state = state;
        this.integrator = integrator;
        this.length = length;

        this.parameterization = parameterization;


        //number of steps to integrate out.
        this.N = Math.floor(this.length/this.integrator.ep);

        this.curve=null;
        this.integrate( this.state );


        //build a tube around this

        const curveOptions = {
            segments: 1024,
            radius: 0.1,
            tubeRes: 32,
        };
        let uniforms = {};
        let fragment = {
            aux: colorConversion,
            fragColor: `
            vec3 fragColor(){      
               return hsb2rgb(vec3(vUv.x, 0.65, 0.4));
            }`,
        };

        this.tube = new ParametricTube( this.curve, curveOptions, fragment, {},{});

    }

    integrate( state ){

        let pts = [];
        let p;
        let currentState = state.clone();

        for(let i=0; i<this.N; i++){

            p = this.parameterization( currentState.pos.clone() );
            pts.push( p.clone() );

            currentState = this.integrator.step( currentState );

        }
        this.curve = new CatmullRomCurve3(pts);
    }

    resetCurve(curve){
        this.tube.resetCurve(curve);
    }

    setName( name ) {
        this.name = name;
    }

    addToScene( scene ) {
        this.tube.addToScene( scene );
    }

    addToUI( ui ) {

    }

    tick( time, dTime ) {

    }
}



export { IntegralCurve }
