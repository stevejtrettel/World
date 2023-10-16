import {DoubleSide, Mesh, MeshPhysicalMaterial} from "../../../../3party/three/build/three.module.js";
import {ParametricGeometry} from "../../../../3party/three/examples/jsm/geometries/ParametricGeometry.js";



class Surface{
    constructor(compute) {
        this.compute = compute;

        //plot the parametric surface:
        const plotMaterial = new MeshPhysicalMaterial({
            color: 0xeb4034,
            side: DoubleSide,
            clearcoat:0.5,
            roughness:0.3,
        });

        const plotGeometry = new ParametricGeometry(compute.parametricSurface,50,50)
        this.plot = new Mesh(plotGeometry, plotMaterial);
    }

    addToScene(scene){
        scene.add(this.plot);
    }

    update(){

    }
}


export default Surface;