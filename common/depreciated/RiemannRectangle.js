import {
    Vector3,
    MeshPhysicalMaterial,
    PlaneBufferGeometry,
    Mesh,
    DoubleSide,
    Group,
} from "../../3party/three/build/three.module.js";

import{ Rod } from "../components/basic-shapes/Rod.js";

//the geometry for a quadrilateral given its vertices
class RiemannRectangle {
    constructor( options ){
        this.x = options.x;
        this.y = options.y;
        this.delta = options.delta;

        this.borderRadius = 0.06*this.delta;

        let geom = new PlaneBufferGeometry(this.delta, Math.abs(this.y));
        let mat;
        if('material' in options){
            mat = options.material;
        }
        else{
            mat = new MeshPhysicalMaterial({
                color: options.color,
                clearcoat:1,
                side: DoubleSide,
            });
        }

        this.interior = new Mesh(geom, mat);
        this.interior.position.set(this.x+this.delta/2,this.y/2,0.001);

        this.rect = new Group();
        this.rect.add(this.interior);

        let borderMat;
        if('borderMaterial' in options){
            borderMat = options.borderMaterial;
        }
        else{
            borderMat = new MeshPhysicalMaterial({
                color: options.borderColor,
                clearcoat:1,
            });
        }

        //make the border geometries:
        //first: need the endpoints:
        const bottomLeft = new Vector3(this.x,0,0);
        const bottomRight = new Vector3(this.x+this.delta,0,0);
        const topLeft = new Vector3(this.x,this.y,0);
        const topRight = new Vector3(this.x+this.delta,this.y,0);

        this.top = new Rod(
            {
                end1: topLeft,
                end2: topRight,
                material: borderMat,
                radius: this.borderRadius,
            }
        );

        this.bottom = new Rod(
            {
                end1: bottomLeft,
                end2: bottomRight,
                material: borderMat,
                radius: this.borderRadius,
            }
        );

        this.left = new Rod(
            {
                end1: bottomLeft,
                end2: topLeft,
                material: borderMat,
                radius: this.borderRadius,
            }
        );

        this.right = new Rod(
            {
                end1: bottomRight,
                end2: topRight,
                material: borderMat,
                radius: this.borderRadius,
            }
        );

    }

    addToScene( scene ){
        scene.add(this.rect);
         this.top.addToScene(scene);
         this.bottom.addToScene(scene);
         this.left.addToScene(scene);
         this.right.addToScene(scene);
    }

    resize(x,y,delta){
        this.x=x;
        this.y=y;
        this.delta=delta;

        this.interior.geometry.dispose();
        this.interior.geometry = new PlaneBufferGeometry(this.delta,Math.abs(this.y));
        this.interior.position.set(this.x+this.delta/2,this.y/2,0.001);

        const bottomLeft = new Vector3(this.x,0,0);
        const bottomRight = new Vector3(this.x+this.delta,0,0);
        const topLeft = new Vector3(this.x,this.y,0);
        const topRight = new Vector3(this.x+this.delta,this.y,0);

        const newRad = this.delta * 0.02;

        this.top.resize(topLeft,topRight,newRad);
        this.bottom.resize(bottomLeft, bottomRight, newRad);
        this.left.resize(bottomLeft, topLeft, newRad);
        this.right.resize(bottomRight, topRight, newRad);
    }

    setPosition(x,y,z){
        this.rect.position.set(x,y,z);
        this.bottom.setPosition(x,y,z);
        this.top.setPosition(x,y,z);
        this.left.setPosition(x,y,z);
        this.right.setPosition(x,y,z);
    }


}



export { RiemannRectangle };
