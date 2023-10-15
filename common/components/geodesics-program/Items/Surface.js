import {Mesh,MeshPhysicalMaterial} from "../../../../3party/three/build/three.module.js";
import {ParametricGeometry} from "../../../../3party/three/examples/jsm/geometries/ParametricGeometry.js";

class Surface{
    constructor(compute) {
        this.compute = compute;

        //plot the parametric surface:
        const plotMaterial = new MeshPhysicalMaterial({
            color: 0xffffff
        })
        const plotGeometry = new ParametricGeometry(compute.parametricGeoFn,50,50)
        this.plot = new Mesh();
    }

    addToScene(scene){
        scene.add(this.plot);
    }

    update(){

    }
}


export default Surface;