import {MathUtils, Vector3} from "../../../3party/three/build/three.module.js";
import {randomVec3Ball } from "../../utils/random.js";

import { FlowLine } from "./FlowLine.js";




// a collection of flow lines
class FlowLineField {

    constructor( integrator, numLines, lineLength ) {

        this.integrator = integrator;
        this.numLines = numLines;
        this.flowLines = [];
        this.lineLength = lineLength;

        let state, line;

        for(let i=0; i<this.numLines; i++){

            state = randomVec3Ball( 1.25 );
            state.add(new Vector3(0,0,1));
            line = new FlowLine(this.integrator, state, this.lineLength);
            this.flowLines.push(line);

        }

        this.name = null;
    }


    addToScene( scene ){

        for( let line of this.flowLines ){
            line.addToScene(scene);
        }
    }

    setName( name ) {
        this.name = name;
    }

    step() {

        for (let line of this.flowLines) {
            line.step();
        }
    }
}


export { FlowLineField };
