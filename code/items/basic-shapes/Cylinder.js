

//a cylinder for the cylindrical shells method of volume integration

import {
    Color,
    CylinderGeometry,
    DoubleSide,
    Mesh,
    MeshPhysicalMaterial,
    Vector3
} from "../../../3party/three/build/three.module.js";


import ParametricCurve from "../../compute/parametric/ParametricCurve.js";

import {Rod} from "./Rod.js";

class Cylinder {
    constructor(x,top, bottom, axis=0, angle=2.*Math.PI, options={}) {

        this.x = x;
        this.top = top;
        this.bottom = bottom;
        this.axis = axis;
        this.angle = angle;

        this.surfaceColor = options.surfaceColor || new Color().setHSL(0.6,0.5,0.5);
        this.bdyColor = options.bdyColor || new Color().setHSL(0.6,0.7,0.2);

        let geom =  this.createCylinderGeometry();
        let mat = new MeshPhysicalMaterial({
            side: DoubleSide,
            clearcoat:1,
            color: this.surfaceColor,
        });

        this.surface = new Mesh(geom,mat);


        let bdyOptions = {
            radius: 0.05,
            color: this.bdyColor,
            res: 64,
        }

        this.topFn = this.createBdy(this.top);
        this.topCurve = new ParametricCurve(this.topFn,{min:0,max:this.angle},bdyOptions);

        this.bottomFn = this.createBdy(this.bottom);
        this.bottomCurve = new ParametricCurve(this.bottomFn,{min:0,max:this.angle},bdyOptions);

        this.start = new Rod({
            end1: this.topFn(0,{}),
            end2: this.bottomFn(0,{}),
            radius:0.05,
            color:this.bdyColor,
        });


        this.end = new Rod({
            end1: this.topFn(this.angle,{}),
            end2: this.bottomFn(this.angle,{}),
            radius:0.05,
            color:this.bdyColor,
        });


    }

    createBdy(fn){
        let xOrigin = this.x;
        let axis = this.axis;

        return function(t,params){
            let radius = xOrigin-axis;
            let height = fn(xOrigin,params);

            let x = radius * Math.cos(t)+axis;
            let y = height;
            let z = radius*Math.sin(t);
            return new Vector3(x,y,z);
        }
    }

    createCylinderGeometry(params){
        let radius = this.x - this.axis;
        let top = this.top(this.x,params);
        let bottom = this.bottom(this.x,params);
        let height = top-bottom;
        let geom = new CylinderGeometry(radius,radius,height, 32,1,true,Math.PI/2,this.angle);
        geom.translate(this.axis, bottom+ height/2,0);
        return geom;
    }


    setX(x){
        this.x=x;

        this.topFn = this.createBdy(this.top);
        this.topCurve.setCurve(this.topFn);

        this.bottomFn = this.createBdy(this.bottom);
        this.bottomCurve.setCurve(this.bottomFn);
    }

    setTop(top){
        this.top=top;
        this.topFn = this.createBdy(this.top);
        this.topCurve.setCurve(this.topFn);
    }

    setBottom(bottom){
        this.bottom=bottom;
        this.bottomFn = this.createBdy(this.bottom);
        this.bottomCurve.setCurve(this.bottomFn);
    }

    setAxis(axis){

        this.axis=axis;

        this.topFn = this.createBdy(this.top);
        this.topCurve.setCurve(this.topFn);

        this.bottomFn = this.createBdy(this.bottom);
        this.bottomCurve.setCurve(this.bottomFn);
    }

    setAngle(angle) {
        this.angle = angle;

        this.topCurve.setDomain({min: 0, max: -angle});
        this.bottomCurve.setDomain({min: 0, max: -angle});
    }










    addToScene(scene){
        scene.add(this.surface);
        this.topCurve.addToScene(scene);
        this.bottomCurve.addToScene(scene);
        this.start.addToScene(scene);
        this.end.addToScene(scene);

    }


    update(params){
        this.surface.geometry.dispose();
        this.surface.geometry = this.createCylinderGeometry(params);

        this.topCurve.update(params);
        this.bottomCurve.update(params);

        this.start.resize(this.topFn(0, params), this.bottomFn(0,params));
        this.end.resize(this.topFn(-this.angle, params), this.bottomFn(-this.angle, params));
    }
}



export default Cylinder;
