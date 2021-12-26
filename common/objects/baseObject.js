import {Object3D} from "../../3party/three/build/three.module.js";


class baseObject extends Object3D {

    constructor () {
        super();

        this.name = null;

    }


    setName( name ) {
        this.name = name;
    }

    addToScene( scene ) {
        scene.add(this);
    }

    addToUI ( ui ) {


    }

    tick () {


    }


}



export { baseObject };
