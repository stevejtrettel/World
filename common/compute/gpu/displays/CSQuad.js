import {
    Mesh,
    DoubleSide,
    MeshStandardMaterial,
    PlaneBufferGeometry,
} from "../../../../3party/three/build/three.module.js"


import { CSDisplay } from "./CSDisplay.js";


class CSQuad extends CSDisplay {

    constructor( computeSystem ) {

        super( computeSystem );

        //just need to make this.display!
        const geometry = new PlaneBufferGeometry(3,3);
        const material = new MeshStandardMaterial({side:DoubleSide});
        material.map = null;

        this.display = new Mesh(geometry, material);
        this.display.position.set(0,0,-3);

    }


    //the only method that needs to get overwritten is tick()!
    tick() {
        this.display.material.map = this.compute.getData(this.selectedDisplay());
    }

}





export { CSQuad };
