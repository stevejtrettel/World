import { attractor } from "./components/attractor.js";
import { flows } from "./components/flows.js";
import { qm } from "./components/qm.js";
import { symFlow } from "./components/SymplecticFlow.js";

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
    //...attractor,
   // ...flows,
    ...symFlow,
};

export { objects };
