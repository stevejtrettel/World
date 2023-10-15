import Surface from "./Items/Surface.js";
import Geodesic from "./Geodesics/Geodesic.js";
import GeodesicSpray from "./Geodesics/GeodesicSpray.js";
import Compute from "./Compute.js";


const defaultParams = {};

class WoodCut{
    constructor(params=defaultParams) {
        this.compute = new Compute();
        this.surface = new Surface(this.compute);

        const iniState = new State();
        this.geodesic = new Geodesic(this.compute,iniState);
       // this.spray = new GeodesicSpray();

    }

    addToScene(scene){
        this.surface.addToScene(scene);
        this.geodesic.addToScene(scene);
       // this.spray.addToScene(scene);
    }

    addToUI(ui){

    }

    tick(time,dTime){

    }

}


export default WoodCut;