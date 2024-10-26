import {Vector3} from "../../../../3party/three/build/three.module.js";
import RodBallChain from "../../../../code/items/basic-shapes/RodBallChain.js";

import Path from "../../../../code/items/raytrace/Path.js";
import Diorama from "../../../../code/items/raytrace/Diorama.js";
import TVec from "../../../../code/items/raytrace/TVec.js";
import Sphere from "../../../../code/items/raytrace/objects/Sphere.js";
import Material from "../../../../code/items/raytrace/Material.js";
import Wall from "../../../../code/items/raytrace/objects/Wall.js";


class Test{
    constructor() {

        //create diorama
        this.diorama = new Diorama();


        //add stuff to diorama
        let sphMat = new Material();
        sphMat.makeDielectric('0xeb4034');

        let light1 = new Sphere(new Vector3(0,3,2),0.5, sphMat);
        light1.isLight = true;
        this.diorama.addObject(light1);

        let light2 = new Sphere(new Vector3(2,3,0),0.5, sphMat);
        light2.isLight = true;
        this.diorama.addObject(light2);

        let light3 = new Sphere(new Vector3(-2,3,0),0.5, sphMat);
        light3.isLight = true;
        this.diorama.addObject(light3);


        let sphere2 = new Sphere(new Vector3(-1,1,0),1, sphMat);
        this.diorama.addObject(sphere2);


        let wallMat = new Material();
        wallMat.makeDielectric("0xab514b");

        let floor = new Wall(new Vector3(0,-5,0),new Vector3(0,1,0),wallMat);
        this.diorama.addObject(floor);

        let ceiling = new Wall(new Vector3(0,5,0),new Vector3(0,-1,0),wallMat);
        this.diorama.addObject(ceiling);

        let left = new Wall(new Vector3(5,0,0),new Vector3(-1,0,0),wallMat);
        this.diorama.addObject(left);

        let right = new Wall(new Vector3(-5,0,0),new Vector3(1,0,0),wallMat);
        this.diorama.addObject(right);

        let back = new Wall(new Vector3(0,0,-5),new Vector3(0,0,1),wallMat);
        this.diorama.addObject(back);

        let front = new Wall(new Vector3(0,0,5),new Vector3(0,0,-1),wallMat);
        this.diorama.addObject(front);
        front.setVisibility(false);


        //create the path
        this.tv = new TVec(new Vector3(0,0,3),new Vector3(0.59,-0.4,-1).normalize());
        this.path = new Path(this.tv);

        //trace the rays through the scene.
        this.path.trace(this.diorama);
        //now the ray has all its vertices stored as points along the scene.

    }


    addToScene(scene){
        this.path.addToScene(scene);
        this.diorama.addToScene(scene);
    }

    addToUI(ui){}

    tick(time,dTime){
        this.path.tv = new TVec(new Vector3(0,0,3),new Vector3(0.59,-0.4+0.1*Math.sin(time/100),-1).normalize());
        this.path.totalDist=0.;

        //trace the rays through the scene.
        this.path.trace(this.diorama);
    }
}


export default Test;
