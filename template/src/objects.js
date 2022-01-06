import { flows } from "./components/flows.js";
import { qm } from "./components/qm.js";
import { strangeAttractors } from "./components/strangeAttractors.js";
import { hopfTori } from "./components/hopfTori.js";
import { knotComplement } from "./components/knotComplements.js";


// class Sph extends Mesh {
//     constructor() {
//         super();
//         this.geometry = new SphereBufferGeometry(1, 32, 16);
//         this.material = new MeshNormalMaterial();
//         this.name = null;
//     }
//
//     setName( name ){
//         this.name=name;
//     }
//
//     addToScene( scene ) {
//         scene.add(this);
//     }
//
//     addToUI( ui ){
//         let Folder = ui.addFolder('Sphere');
//
//         Folder.close();
//     }
//
//     tick(time,dt){
//         this.position.set(Math.sin(time),Math.cos(time),2*Math.sin(time/2));
//     }
// }



const objects = {
    //...qm,
   // ...strangeAttractors,
   // ...flows,
   // ...hopfTori,
    ...knotComplement
};

export { objects };
