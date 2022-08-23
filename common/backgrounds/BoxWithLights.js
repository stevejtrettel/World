import {
    BoxGeometry,
    Mesh,
    MeshLambertMaterial
} from "../../3party/three/build/three.module.js";

import { BoxNoLights } from "./BoxNoLights.js";





class BoxWithLights extends BoxNoLights {

    constructor ( color ) {

        super( color );

        const lightParameters = {
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 2
        };

        const geometry = new BoxGeometry();
        geometry.deleteAttribute( 'uv' );

        const lightMaterial = new MeshLambertMaterial( lightParameters );

        const light1 = new Mesh( geometry, lightMaterial );
        light1.position.set(  5, 0, 0 );
        light1.scale.set( 0.1, 1, 1 );
        this.add( light1 );

        const light2 = new Mesh( geometry, lightMaterial );
        light2.position.set( 0, 5, 0 );
        light2.scale.set( 1, 0.1, 1 );
        this.add( light2 );

        const light3 = new Mesh( geometry, lightMaterial );
        light3.position.set( 2, 1, 5 );
        light3.scale.set( 1.5, 2, 0.1 );
        this.add( light3 );

        // const light4 = new Mesh( geometry, lightMaterial );
        // light4.position.set(  -5, 0, 0 );
        // light4.scale.set( 0.1, 1, 1 );
        // this.add( light4 );
        //
        // const light5 = new Mesh( geometry, lightMaterial );
        // light5.position.set( 0, -5, 0 );
        // light5.scale.set( 1, 0.1, 1 );
        // this.add( light5 );

        const light6 = new Mesh( geometry, lightMaterial );
        light6.position.set( -2, -1, -5 );
        light6.scale.set( 1.5, 2, 0.1 );
        this.add( light6 );

    }

}



export { BoxWithLights };
