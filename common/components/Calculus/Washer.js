import {
    DoubleSide,
    Mesh,
    MeshPhysicalMaterial,
    RingBufferGeometry,
    Vector3,
    Color
} from "../../../3party/three/build/three.module.js";

import {Rod} from "./Rod.js";
import ParametricCurve from "../VectorCalculus/ParametricCurve.js";


//a class for drawing a washer between two curves
class Washer{
    constructor(x,top, bottom, axis=0, angle=2.*Math.PI, options={}) {

        this.x =x;
        this.top = top;
        this.bottom = bottom;
        this.axis = axis;
        this.angle = angle;

        this.surfaceColor = options.surfaceColor || new Color().setHSL(0.6,0.5,0.5);
        this.bdyColor = options.bdyColor || new Color().setHSL(0.6,0.7,0.2);

        let geom =  this.createRingGeometry();
        let mat = new MeshPhysicalMaterial({
            side: DoubleSide,
            clearcoat:1,
            color: this.surfaceColor,
        });

        this.surface = new Mesh(geom,mat);
        this.surface.rotateY(-Math.PI/2);
        this.surface.position.set(this.x,this.axis,0);



        let bdyOptions = {
            radius: 0.05,
            color: this.bdyColor,
            res: 64,
        }

        this.outerFn = this.createBdy(this.top);
        this.outer = new ParametricCurve(this.outerFn,{min:0,max:this.angle},bdyOptions);

        this.innerFn = this.createBdy(this.bottom);
        this.inner = new ParametricCurve(this.innerFn,{min:0,max:this.angle},bdyOptions);


        this.start = new Rod({
            end1: this.innerFn(0,{}),
            end2: this.outerFn(0,{}),
            radius:0.05,
            color:this.bdyColor,
        });


        this.end = new Rod({
            end1: this.innerFn(this.angle,{}),
            end2: this.outerFn(this.angle,{}),
            radius:0.05,
            color:this.bdyColor,
        });

    }

    //take in top or bottom, create function for boundary parametric curve
    createBdy(fn){
        let x = this.x;
        let axis = this.axis;

        return function(t,params){
            let r = fn(x,params)-axis;
            let y = r*Math.cos(t)+axis;
            let z = r*Math.sin(t);
            return new Vector3(x, y,z);
        }
    }

    createRingGeometry(params){
        let outerRadius = this.top(this.x)-this.axis;
        let innerRadius = this.bottom(this.x)-this.axis;
        return new RingBufferGeometry(innerRadius,outerRadius,32,1,Math.PI/2,this.angle);
    }

    setColor(surfColor, bdyColor){
        this.surface.material.color = surfColor;
    }

    setX(x){
        this.x=x;

        this.outerFn = this.createBdy(this.top);
        this.outer.setCurve(this.outerFn);

        this.innerFn = this.createBdy(this.bottom);
        this.inner.setCurve(this.innerFn);
    }

    setTop(top){
        this.top=top;
    }

    setBottom(bottom){
        this.bottom=bottom;
    }

    setAxis(axis){

        this.axis=axis;

        this.outerFn = this.createBdy(this.top);
        this.outer.setCurve(this.outerFn);

        this.innerFn = this.createBdy(this.bottom);
        this.inner.setCurve(this.innerFn);
    }

    setAngle(angle) {
        this.angle = angle;

        this.outer.setDomain({min: 0, max: -angle});
        this.inner.setDomain({min: 0, max: -angle});
    }


    addToScene(scene){
        scene.add(this.surface);
        this.outer.addToScene(scene);
        this.inner.addToScene(scene);
        this.start.addToScene(scene);
        this.end.addToScene(scene);
    }

    update(params){
        this.surface.geometry.dispose();
        this.surface.geometry = this.createRingGeometry(params);
        this.surface.position.set(this.x,this.axis,0);

        this.outer.update(params);
        this.inner.update(params);

        this.start.resize(this.innerFn(0, params), this.outerFn(0,params));
        this.end.resize(this.innerFn(-this.angle, params), this.outerFn(-this.angle, params));
    }
}



export default Washer;