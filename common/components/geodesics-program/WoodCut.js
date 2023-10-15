import Surface from "./Surface/Surface.js";
import GeodesicSpray from "./Geodesics/GeodesicSpray.js";



const defaultParams = {};

class WoodCut{
    constructor(params=defaultParams) {

        this.surface = new Surface();
        this.spray = new GeodesicSpray();

    }

    addToScene(scene){
        this.surface.addToScene(scene);
        this.spray.addToScene(scene);
    }

    addToUI(ui){

    }

    tick(time,dTime){

    }

}


export default WoodCut;