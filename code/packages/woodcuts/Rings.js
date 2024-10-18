import {Vector2} from "../../../3party/three/build/three.module.js";

import CircleGrid from "./Circles/CircleGrid.js";
import ConcentricCircles from "./Circles/ConcentricCircles.js";
import PlotGPU from "./Plot/PlotGPU.js";

class Rings{
    constructor(surface) {

        this.surface = surface;

        this.params = {
            centerx: 2,
            centery: 0,
            radius: 2,
            N: 5,
        }

        this.plot = new PlotGPU(this.surface);
        this.circles = new CircleGrid(
            this.surface,
            new Vector2(this.params.centerx,this.params.centery),
            this.params.radius,
            this.params.N
            );
        // this.circles = new ConcentricCircles(
        //     this.surface,
        //     new Vector2(this.params.centerx,this.params.centery),
        //     this.params.radius,
        //     this.params.N,
        // );

    }


    addToScene(scene){

        this.plot.addToScene(scene);
        this.circles.addToScene(scene);

    }

    addToUI(ui){

        let rings = this;
        let params = this.params;

        ui.add(params,'centerx',rings.surface.domain.u.min,rings.surface.domain.u.max,0.01).name('centerX').onChange(
            function(value){
                let pos = new Vector2(params.centerx,params.centery);
                rings.circles.updateCenter(pos);
            });

        ui.add(params,'centery',rings.surface.domain.v.min,rings.surface.domain.v.max,0.01).name('centerY').onChange(
            function(value){
                let pos = new Vector2(params.centerx,params.centery);
                rings.circles.updateCenter(pos);
            });

        ui.add(params,'radius',0,3,0.01).name('radius').onChange(
            function(value){
                rings.circles.updateRadius(params.radius);
            });
    }

    tick(time,dTime){
    }
}


export default Rings;