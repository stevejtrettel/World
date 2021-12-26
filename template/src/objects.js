import {
    MeshNormalMaterial,
    SphereBufferGeometry,
    Mesh
} from "../../3party/three/build/three.module.js";



class Sph extends Mesh {
    constructor() {
        super();
        this.geometry = new SphereBufferGeometry(1, 32, 16);
        this.material = new MeshNormalMaterial();
        this.name = null;
    }

    setName( name ){
        this.name=name;
    }

    addToScene( scene ) {
        scene.add(this);
    }

    addToUI( ui ){
        let Folder = ui.addFolder('Sphere');

        Folder.close();
    }

    tick(time,dt){
        this.position.set(Math.sin(time),Math.cos(time),2*Math.sin(time/2));
    }
}











const objects = {
sph: new Sph(),
};

export { objects };
