import {MeshNormalMaterial, SphereGeometry, Mesh} from "three";


class SphereObj{
    constructor(){
        let geom = new SphereGeometry(1,32,16);
        let mat = new MeshNormalMaterial();
        this.mesh = new Mesh(geom,mat);
    }

    addToScene(scene){
        scene.add(this.mesh);
    }

    setPos(x,y,z){
        this.mesh.position.set(x,y,z);
    }
}


export default SphereObj;