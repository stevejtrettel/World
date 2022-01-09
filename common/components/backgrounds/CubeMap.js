
import {
    Scene,
    CubeTextureLoader,
    sRGBEncoding,
    AmbientLight,
} from "../../../3party/three/build/three.module.js";


import {Background} from "./Background.js";



//CAN GENERATE CUBE MAPS
//https://jaxry.github.io/panorama-to-cubemap/

function loadSkyBox(fileLocation, fileType){
    //load up the cube texture
    const loader = new CubeTextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.setPath( fileLocation );
    loader.load( [
            'px.'+fileType,
            'nx.'+fileType,
            'py.'+fileType,
            'ny.'+fileType,
            'pz.'+fileType,
            'nz.'+fileType
        ],
        function (texture) {
            return texture;
        }
    );
}



//NOT WORKING YET!

class CubeMap extends Background {

    constructor( fileLocation, fileType ) {

        super();
        this.background = loadSkyBox(fileLocation, fileType);

    }

}



export { CubeMap };
