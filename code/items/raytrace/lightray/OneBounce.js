import BallList from "./BallList.js"
import {
    SphereGeometry,
    MeshPhysicalMaterial,
    Mesh,
    LineCurve3,
    TubeGeometry
} from "../../../../3party/three/build/three.module";

class OneBounce{
    constructor() {

        this.radius = 0.02;

        this.pts;
        this.balls = new BallList(3);

        this.originColor = 0xffffff;
        this.bounceColor = 0xffffff;

        let trashGeom = new SphereGeometry();
        this.originRay = new Mesh(trashGeom, new MeshPhysicalMaterial({
            color:this.originColor,
            clearcoat:true,
        }));

        this.bounceRay = new Mesh(trashGeom, new MeshPhysicalMaterial({
            color:this.bounceColor,
            clearcoat:true,
        }));

    }


    setPoints(pts) {
        this.pts = pts;
        this.balls.setPoints(pts);

        let originLine = new LineCurve3(pts[0], pts[1]);
        this.originRay.geometry.dispose();
        this.originRay.geometry = new TubeGeometry(originLine, 1, this.radius, 8, false);


        let bounceLine = new LineCurve3(pts[1], pts[2]);
        this.bounceRay.geometry.dispose();
        this.bounceRay.geometry = new TubeGeometry(bounceLine, 1, this.radius, 8, false);
    }

    setColors(originColor,bounceColor){
        this.originRay.material.color.setHex(originColor);
        this.bounceRay.material.color.setHex(bounceColor);
    }

    addToScene(scene){
        this.balls.addToScene(scene);
        scene.add(this.originRay);
        scene.add(this.bounceRay);
    }

    showBounceRay(bool){
            this.bounceRay.setVisibility(bool);
    }

}


export default OneBounce;
