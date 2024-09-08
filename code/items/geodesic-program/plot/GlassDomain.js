import {ParametricGeometry} from "../../../../3party/three/examples/jsm/geometries/ParametricGeometry.js";
import {DoubleSide, MeshPhysicalMaterial,Mesh} from "../../../../3party/three/build/three.module.js";

class GlassDomain{
    constructor(surface) {
        this.surface = surface;

        this.options = {
            clearcoat:1,
            roughness:0.35,
        }

        const domainGeometry = new ParametricGeometry(this.surface.parametricDomain,5,5);
        const domainMaterial = new MeshPhysicalMaterial(
            {
                color: 0x708bdb,
               // transparent:true,
                //opacity: 0.05,
                // ior:1.,
                // transmission: 0.98,
                clearcoat: 1,
                side: DoubleSide,
            });

        this.glass = new Mesh(domainGeometry, domainMaterial);
    }

    addToScene(scene){
        scene.add(this.glass);
    }
}

export default GlassDomain;
