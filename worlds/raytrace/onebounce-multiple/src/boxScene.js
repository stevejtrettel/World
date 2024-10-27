import {Vector3} from "../../../../3party/three/build/three.module.js";

import Diorama from "../../../../code/items/raytrace/Diorama.js";
import Material from "../../../../code/items/raytrace/Material.js";
import Sphere from "../../../../code/items/raytrace/objects/Sphere.js";
import Wall from "../../../../code/items/raytrace/objects/Wall.js";



//create diorama
let boxScene= new Diorama();


//add stuff to diorama
let lightMat = new Material();
lightMat.makeMirror(0xffffff);

let light1 = new Sphere(new Vector3(0,4,2),0.5, lightMat);
light1.isLight = true;
boxScene.addObject(light1);

let light2 = new Sphere(new Vector3(2,4,0),0.5, lightMat);
light2.isLight = true;
boxScene.addObject(light2);

let light3 = new Sphere(new Vector3(-2,4,0),0.5, lightMat);
light3.isLight = true;
boxScene.addObject(light3);



let sphMat1 = new Material();
sphMat1.makeDielectric(0xeb4034,0.2,0.95);

let sphere1 = new Sphere(new Vector3(-1,-4,3),1, sphMat1);
boxScene.addObject(sphere1);

let sphMat2 = new Material();
sphMat2.makeDielectric(0xd18324,0.75,0.2);

let sphere2 = new Sphere(new Vector3(3,-3.5,0),1.5, sphMat2);
boxScene.addObject(sphere2);

let sphMat3 = new Material();
sphMat3.makeGlass(0x95b888,1.5,0.95,0.2);
//0x814fb3);

let sphere3 = new Sphere(new Vector3(-2,-3,-2),2, sphMat3);
boxScene.addObject(sphere3);




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
