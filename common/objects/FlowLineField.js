import { FlowLine } from "./FlowLine.js";
import { RungeKuttaVec3 as RungeKutta } from "../computation/RungeKutta.js";
import {
    Vector3,
    MathUtils,
} from "../../3party/three/build/three.module.js";



//make a random initial condition inside a ball of some radius:
function ptInBall( Rad ){
    let theta = MathUtils.randFloat(0,6.29);
    let z = MathUtils.randFloat(-1,1);
    let r = MathUtils.randFloat(0,1);
    r=Math.pow(r,1.3333);

    let pt = new Vector3( Math.cos(theta), Math.sin(theta), z +1 );
    pt.multiplyScalar( r );
    pt.multiplyScalar( Rad );

    return pt;
}



// a collection of flow lines
class FlowLineField {

    constructor( derive, ep, numLines, lineLength ) {

        this.integrator=new RungeKutta(derive, ep);
        this.numLines = numLines;
        this.flowLines = [];
        let N = Math.floor(lineLength/ep);

        let state, line;

        for(let i=0; i<this.numLines; i++){
            state = ptInBall( 1.25 );
            line = new FlowLine(this.integrator, state, N);
            this.flowLines.push(line);
        }

        this.name = null;
    }




    addToScene( scene ){

        for( let line of this.flowLines ){

                line.addToScene(scene);

        }
    }

    addToUI(){

    }

    setName( name ) {
        this.name = name;
    }

    step() {

        for (let line of this.flowLines) {

            line.step();
        }
    }



    tick(){

        this.step();
    }
}


export { FlowLineField };
