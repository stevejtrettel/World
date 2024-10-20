import {Vector2} from "../../../../3party/three/build/three.module.js";

import State from "../../../../code/items/geodesic-program/Integrators/States/State.js";
import Graph from "../../../../code/items/geodesic-program/plot/Graph.js";
import GraphingCalc from "../../../../code/items/geodesic-program/surface/Examples/GraphingCalc.js";
import GeodesicStripes from "../../../../code/items/geodesic-program/trajectories/GeodesicStripes.js";

class Board{
    constructor() {

        this.surface = new GraphingCalc();
        this.plot = new Graph(this.surface);

        this.params = {
            pos: 0,
            ang:0,
        };

        this.buildIniState();

        this.stripes = new GeodesicStripes(this.surface,this.iniState,0);

    }

    buildIniState(){
        let pos = new Vector2(this.surface.domain.u.min, this.params.pos);
        let vel = new Vector2(Math.cos(this.params.ang),Math.sin(this.params.ang));
        this.iniState = new State(pos,vel);
    }

    addToScene(scene){
        this.plot.addToScene(scene);
        this.stripes.addToScene(scene);
    }

    addToUI(ui){

        let test = this;

        let resetScene = function(){
            test.plot.updateSurface();
            test.stripes.updateSurface();
        };

        this.surface.buildUIFolder(ui,resetScene);

        let stripeFolder = ui.addFolder('Stripes');
        stripeFolder.close();

        stripeFolder.add(test.params,'pos',-0.5,0.5,0.01).onChange(function(value){
            test.buildIniState();
            test.stripes.iniState = test.iniState;
            test.stripes.update();
        });


        stripeFolder.add(test.params,'ang',-0.5,0.5,0.01).onChange(function(value){
            test.buildIniState();
            test.stripes.iniState = test.iniState;
            test.stripes.update();
        });

    }

    tick(time,dTime){
    }


}


export default Board;
