import { Scene } from "../../3party/three/build/three.module.js";

class Background extends Scene {

    constructor () {
        super();
    }


    createPMREM(pmrem, options={}) {
       const generatedPMREM = pmrem.fromScene(
            this,
            options.sigma||0.015,
            options.near||1,
            options.far||100
        );

       return generatedPMREM.texture;
    }

}




export { Background };
