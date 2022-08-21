 import { flows } from "../../common/items/flows.js";
 import { strangeAttractors } from "../../common/items/strangeAttractors.js";
import { hopfTori } from "../../common/items/hopfTori.js";
import { knotComplement } from "../../common/items/knotComplements.js";
import {tubeTest } from "../../common/items/tubeTest.js";
import {torus} from "../../common/items/Torus.js";
import { geo } from "../../common/items/Geodesic.js";
import { computeSurface } from "../../common/items/computeSurface.js";
import { pentagramMap } from "../../common/items/pentagramMap.js";
import { curveAndTorsion } from "../../common/items/curveAndTorsion.js";
// import { wobbleSphere } from "./components/wobbleSphere.js";
//import { curveOnTorus } from "./components/torusFundamentalGroup.js";
import { cuttingCylinder } from "../../common/items/cuttingCylinder.js";
import { cuttingTorus } from "../../common/items/cuttingTorus.js";
import { stereoProj } from "../../common/items/stereoProj.js";
//import { stereoCube } from "./components/stereoCube.js";


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
   // ...pentagramMap,
    //...strangeAttractors,
   // ...flows,
   // ...hopfTori,
    //...knotComplement,
       // ...tubeTest,
        ...geo
       // torus,
      //  ...computeSurface,
  //...curveAndTorsion,
    //wobbleSphere,
     //curveOnTorus,
    //cuttingCylinder,
   // cuttingTorus,
    //...stereoProj,
   // ...stereoCube
};

export { objects };
