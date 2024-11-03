import {Vector3} from "../../../../3party/three/build/three.module.js";

import Diorama from "../../../../code/items/raytrace/Diorama.js";
import Material from "../../../../code/items/raytrace/Material.js";
import Sphere from "../../../../code/items/raytrace/objects/Sphere.js";
import Wall from "../../../../code/items/raytrace/objects/Wall.js";



//create diorama
let boxScene= new Diorama();
boxScene.setRoughness = function(value){
    sphMat1.roughness=value;
}

let sphMat1 = new Material();
// sphMat1.makeDielectric(0xeb4034,0.0,0.95);
sphMat1.makeSubsurface(0x95b888,0.5,0.05,1,0,0.1);

let sphere1 = new Sphere(new Vector3(0,-3,1),2, sphMat1);
boxScene.addObject(sphere1);
// sphere1.setVisibility(false);


let floorMat = new Material();
floorMat.makeMirror(0x595959);

let floor = new Wall(new Vector3(0,-5,0),new Vector3(0,1,0),floorMat);
boxScene.addObject(floor);

let ceilingMat = new Material();
ceilingMat.makeMirror(0xffffff);

let ceiling = new Wall(new Vector3(0,5,0),new Vector3(0,-1,0),ceilingMat);
boxScene.addObject(ceiling);


let sidesMat = new Material();
sidesMat.makeMirror(0x498f59);

let left = new Wall(new Vector3(5,0,0),new Vector3(-1,0,0),sidesMat);
boxScene.addObject(left);

let right = new Wall(new Vector3(-5,0,0),new Vector3(1,0,0),sidesMat);
boxScene.addObject(right);



let backMat = new Material();
backMat.makeMirror(0x486cb0);

let back = new Wall(new Vector3(0,0,-5),new Vector3(0,0,1),backMat);
boxScene.addObject(back);

let front = new Wall(new Vector3(0,0,5),new Vector3(0,0,-1),backMat);
boxScene.addObject(front);
front.setVisibility(false);



export default boxScene;
