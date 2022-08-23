import {
    Scene,
    BoxGeometry,
    MeshStandardMaterial,
    BackSide,
    Mesh,
    PointLight,
} from "../../3party/three/build/three.module.js";

import { Background } from "./Background.js";




class BoxNoLights extends Background {

    constructor ( color ) {

        super();

        const geometry = new BoxGeometry();
        geometry.deleteAttribute( 'uv' );
        const parameters = {
            metalness: 0,
            side: BackSide
        };

        const roomMaterial = new MeshStandardMaterial( parameters );
        roomMaterial.color.set(color);

        const room = new Mesh( geometry, roomMaterial );
        room.scale.setScalar( 10 );
        this.add( room );

        const mainLight = new PointLight( 0xffffff, 40, 0, 2 );
        this.add( mainLight );

    }


}

export { BoxNoLights };
