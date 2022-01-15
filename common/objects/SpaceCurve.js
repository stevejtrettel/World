import {CatmullRomCurve3, Vector2, Vector3} from "../../3party/three/build/three.module.js";

import { RungeKutta } from "../cpu/RungeKutta.js";
import { TNB } from "../cpu/components/TNB.js";
import {colorConversion} from "../shaders/colors/colorConversion.js";
import {ParametricTube} from "./ParametricTube.js";





//get the frenet formulas for a curve with perscribed curvature and torsion

const FrenetFormula = (curvature, torsion)=>{
    return ( tnb ) => {

        const s = tnb.getS();
        const T = tnb.getT();
        const N = tnb.getN();
        const B = tnb.getB();

        const k = curvature( s );
        const tau = torsion( s );

        //do the frenet serret equations
        const Tp = N.clone().multiplyScalar(k);
        const Np = T.clone().multiplyScalar(-k).add(B.clone().multiplyScalar(tau));
        const Bp = N.clone().multiplyScalar(-tau);

        const prime = new TNB();
        prime.T = Tp;
        prime.N = Np;
        prime.B = Bp;

        return prime;

    };
}


class SpaceCurve {

    constructor(curvature, torsion, length, eps=0.005 ){

        //step 0: save input functions, data
        this.curvature = curvature;
        this.torsion = torsion;
        this.length  = length;

        //Step 1: build the integrator:
        const derive = FrenetFormula(this.curvature, this.torsion);

        //this integrator works on objects of the class TNB, and does frenet serret formula!
        this.integrator = new RungeKutta(derive, eps);

        //number of steps to integrate out.
        this.N = Math.floor(this.length/this.integrator.ep);

        this.curve=null;

        //integrate the curve!!!
        this.integrate( );


        //build a tube around this

        const curveOptions = {
            segments: 1024,
            radius: 0.03,
            tubeRes: 32,
        };
        let uniforms = {};
        let fragment = {
            aux: colorConversion,
            fragColor: `
            vec3 fragColor(){      
               return hsb2rgb(vec3(vUv.x, 0.75, 0.6));
            }`,
        };

        this.tube = new ParametricTube( this.curve, curveOptions, fragment, {},{});

    }

    integrate( ){


        let Tf,Tb;
        let pf = new Vector3();
        let pb = new Vector3();

        let PFs = [];
        let PBs = [];


        //make a default frame at the origin, with TNB on axes
        let forwardState = new TNB();

        let backwardState = new TNB();
        backwardState.T.multiplyScalar(-1);


        for(let i=0; i<this.N; i++){

            //move ahead one step along the frenet frame
            forwardState = this.integrator.step( forwardState );
            //add the stepped amount to the arc length
            forwardState.incrementS(this.integrator.ep);

            //move back one step along the frenet frame
            backwardState = this.integrator.step( backwardState );
            //add the stepped amount to the arc length BACKWARDS
            backwardState.incrementS( - this.integrator.ep);

            //get the resulting tangent vectors
            Tf = forwardState.getT();
            Tb = backwardState.getT();

            //use these to increment points by integration:
            pf.add(Tf.multiplyScalar(this.integrator.ep));
            pb.add(Tb.multiplyScalar(this.integrator.ep));

            //adding them after ensures the origin is not included in either array
            PFs.push(pf.clone());
            PBs.push(pb.clone());

        }

        //make the array of points FINALLY!!!!
        //reverse the backwards list, add origin, continue with forwards list
        let pts = [...PBs.reverse(), new Vector3(), ...PFs];

        //build a curve from these points
        this.curve = new CatmullRomCurve3(pts);
    }

    reset(curvature, torsion){
        this.integrator.derive = FrenetFormula(curvature, torsion);
        this.integrate();
        this.tube.resetCurve(this.curve);
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



export { SpaceCurve };
