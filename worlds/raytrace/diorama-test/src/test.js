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
        let lightMat = new Material();
        lightMat.makeDielectric(0xffffff);

        let light1 = new Sphere(new Vector3(0,4,2),0.5, lightMat);
        light1.isLight = true;
        this.diorama.addObject(light1);

        let light2 = new Sphere(new Vector3(2,4,0),0.5, lightMat);
        light2.isLight = true;
        this.diorama.addObject(light2);

        let light3 = new Sphere(new Vector3(-2,4,0),0.5, lightMat);
        light3.isLight = true;
        this.diorama.addObject(light3);



        let sphMat1 = new Material();
        sphMat1.makeDielectric(0xeb4034);

        let sphere1 = new Sphere(new Vector3(-1,-4,3),1, sphMat1);
        this.diorama.addObject(sphere1);


        let sphMat2 = new Material();
        sphMat2.makeDielectric(0xd18324);

        let sphere2 = new Sphere(new Vector3(3,-3.5,0),1.5, sphMat2);
        this.diorama.addObject(sphere2);


        let sphMat3 = new Material();
        sphMat3.makeDielectric(0x95b888);
            //0x814fb3);

        let sphere3 = new Sphere(new Vector3(-2,-3,-2),2, sphMat3);
        this.diorama.addObject(sphere3);


        let floorMat = new Material();
        floorMat.makeDielectric(0x595959);


        let floor = new Wall(new Vector3(0,-5,0),new Vector3(0,1,0),floorMat);
        this.diorama.addObject(floor);


        let ceilingMat = new Material();
        ceilingMat.makeDielectric(0xffffff);

        let ceiling = new Wall(new Vector3(0,5,0),new Vector3(0,-1,0),ceilingMat);
        this.diorama.addObject(ceiling);




        let sidesMat = new Material();
        sidesMat.makeDielectric(0x498f59);

        let left = new Wall(new Vector3(5,0,0),new Vector3(-1,0,0),sidesMat);
        this.diorama.addObject(left);

        let right = new Wall(new Vector3(-5,0,0),new Vector3(1,0,0),sidesMat);
        this.diorama.addObject(right);



        let backMat = new Material();
        backMat.makeDielectric(0x486cb0);

        let back = new Wall(new Vector3(0,0,-5),new Vector3(0,0,1),backMat);
        this.diorama.addObject(back);

        // let front = new Wall(new Vector3(0,0,5),new Vector3(0,0,-1),wallMat);
        // this.diorama.addObject(front);
        // front.setVisibility(false);


        //create the path
        this.tv = new TVec(new Vector3(0,0,4.8),new Vector3(0.59,-0.4,-1).normalize());
        this.path = new Path(this.tv,5);

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
