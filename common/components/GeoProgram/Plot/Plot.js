import {DoubleSide, Mesh, MeshPhysicalMaterial} from "../../../../3party/three/build/three.module.js";
import {ParametricGeometry} from "../../../../3party/three/examples/jsm/geometries/ParametricGeometry.js";


//res is dots per inch:
class Plot {
    constructor(surface, res=20) {
        this.surface = surface;
        this.res = res;

        //plot the parametric surface:
        const plotMaterial = new MeshPhysicalMaterial({
            color: 0xeb4034,
            side: DoubleSide,
            clearcoat:0.5,
            roughness:0.3,
        });

        let uDom = this.surface.domain.u;
        let vDom = this.surface.domain.v;
        let slices = Math.floor(res*(uDom.max-uDom.min));
        let stacks = Math.floor(res*(vDom.max-vDom.min));
        const plotGeometry = new ParametricGeometry(surface.parametricSurface,slices,stacks);
        this.plot = new Mesh(plotGeometry, plotMaterial);
    }

    addToScene(scene){
        scene.add(this.plot);
    }

    update(){

    }
}


export default Plot;