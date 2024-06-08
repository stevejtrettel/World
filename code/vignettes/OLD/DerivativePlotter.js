
//----------------------------------
// NEED TO MAKE SO SOMEONE CAN TYPE IN THEIR OWN FUNCTION
//------------------------------


import {BlackBoard} from "../../items/basic-shapes/Blackboard.js";

import{ getRange, differentiate } from "../../utils/math/functions_singleVar.js";
import Graph2D from "../../items/calculus/Graph2D.js";


const defaultSetup = {
    domain: { min:-5, max:3},
    f: (x)=> Math.cos(3*x)+Math.cos(x),
    res:300,
    radius:0.05,
    color:0x244f30,
    accentColor:0xa8a032,
};


class DerivativePlotter {
    constructor( setup=defaultSetup ){

        this.domain=setup.domain;

        this.f = setup.f;
        this.fRange = getRange(this.f,this.domain);

        this.fPrime = differentiate(this.f);
        this.fPrimeRange = getRange(this.fPrime, this.domain);

        const fBoardOptions = {
            xRange: this.domain,
            yRange: this.fRange,
            radius:setup.radius,
        }
        this.fBoard = new BlackBoard( fBoardOptions );

        const fPrimeBoardOptions = {
            xRange: this.domain,
            yRange: this.fPrimeRange,
            radius:setup.radius,
        }
        this.fPrimeBoard = new BlackBoard( fPrimeBoardOptions );
        this.fPrimeBoard.setPosition(0,0,-2);

        const graphOptions = {
            domain: this.domain,
            f: this.f,
            radius: setup.radius,
            color: setup.color,
            res:512,
        }
        this.graph = new Graph2D( graphOptions );


        const graphPrimeOptions = {
            domain: this.domain,
            f: this.fPrime,
            radius: setup.radius,
            color: setup.color,
            res:500,
        }
        this.graphPrime = new Graph2D( graphPrimeOptions );
        this.graphPrime.setPosition(0,0,-2);



    }

    addToScene( scene ){
        this.fBoard.addToScene(scene);
        this.fPrimeBoard.addToScene(scene);
        this.graph.addToScene(scene);
        this.graphPrime.addToScene(scene);
    }

    addToUI( ui ){

    }

    tick(time, dTime){

    }

}



export default DerivativePlotter;
