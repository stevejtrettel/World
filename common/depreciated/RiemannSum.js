import{ setX } from "../utils/math/functions_singleVar.js";
import {RiemannRectangle} from "./RiemannRectangle.js";
import {DoubleSide, MeshPhysicalMaterial} from "../../3party/three/build/three.module.js";

class RiemannSum{
    constructor( options ){
        this.f = options.f;
        this.domain = options.domain;

        this.n = options.n;
        let spread = this.domain.max-this.domain.min;
        this.delta = spread/this.n;


        //make the border material

        //make the interior material
        let posMat = new MeshPhysicalMaterial({
            clearcoat:1,
            color:options.posColor,
            side: DoubleSide,
            }
        );

        let negMat = new MeshPhysicalMaterial({
                clearcoat:1,
                color:options.negColor,
                side: DoubleSide,
            }
        );

        let borderMaterial = new MeshPhysicalMaterial({
                clearcoat:1,
                color:options.borderColor,
                side: DoubleSide,
            }
        );

        //for now just a left hand sum:
        let x,y;
        let mat;
        this.rects = [];
        for(let i=0;i<this.n;i++){
            x = setX(i/this.n, this.domain);
            y = this.f(x);
            if(y>0){
                mat=posMat;
            }
            else{
                mat=negMat;
            }
            this.rects.push(new RiemannRectangle({
                x:x,
                y:y,
                delta:this.delta,
                material: mat,
                borderMaterial:borderMaterial,
            }));
        }
    }


    addToScene( scene ){
        for(let i=0; i<this.n; i++){
            this.rects[i].addToScene(scene);
        }
    }

    setPosition(x,y,z){
        for(let i=0; i<this.n; i++){
            this.rects[i].setPosition(x,y,z);
        }
    }

    addToUI(ui){}

    tick(time,dTime){}
}


export{ RiemannSum };



let data = {
    domain: { min:-5, max:3},
    n:60,
    f: (x)=> Math.cos(3*x)+Math.cos(x),
    posColor:0x244f30,
    negColor:0xc98018,
    borderColor:0xa8a032,
};

let example = new RiemannSum( data );

export default {example};
