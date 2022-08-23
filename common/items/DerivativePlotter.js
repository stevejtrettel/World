import {BlackBoard} from "../components/calculus/Blackboard.js";

function differentiate(f){
    return function(x){
        const h = 0.001;
        const dy = f(x+h/2)-f(x-h/2);
        return dy/h;
    }
}


function getYRange(f, domain){
    let pts = [];
    let res=100;
    const spread = domain.max-domain.min;

    let x;
    for(let i=0;i<res;i++){
        x=domain.min+i/res*spread;
        pts.push(f(x));
    }

    const yMin = Math.min(...pts);
    const yMax = Math.max(...pts);

    return {
        min: yMin,
        max: yMax,
    };
}

class DerivativePlotter {
    constructor( options ){

        this.domain=options.domain;

        this.f = options.f;
        this.fRange = getYRange(this.f,this.domain);

        this.fPrime = differentiate(this.f);
        this.fPrimeRange = getYRange(this.fPrime, this.domain);

        const fBoardOptions = {
            xRange: this.domain,
            yRange: this.fRange,
            radius:options.radius,
        }
        this.fBoard = new BlackBoard( fBoardOptions );

        const fPrimeBoardOptions = {
            xRange: this.domain,
            yRange: this.fPrimeRange,
            radius:options.radius,
        }
        this.fPrimeBoard = new BlackBoard( fBoardOptions );
        this.fPrimeBoard.setPosition(0,0,-3);

    }

    addToScene( scene ){
        this.fBoard.addToScene(scene);
        this.fPrimeBoard.addToScene(scene);
    }

    addToUI( ui ){

    }

    tick(time, dTime){

    }

}


