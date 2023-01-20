import {Color, MeshPhysicalMaterial, Vector3, Mesh, DoubleSide} from "../../../3party/three/build/three.module.js";
import {Rod} from "../../components/Calculus/Rod.js";

import Vector from "../../components/VectorCalculus/Vector.js";
import {ParametricGeometry} from "../../../3party/three/examples/jsm/geometries/ParametricGeometry.js";


class CrossProduct{
    constructor(){

        this.params = {
            axes:false,
            animate: true,
            ux:1,
            uy:2,
            uz:3,
            vx:0,
            vy:2,
            vz:-2
        }

        //The "u" vector
        this.uDir = new Vector3(this.params.ux, this.params.uy, this.params.uz);
        let uColor = new Color().setHSL(0.15,0.7,0.4);
        this.u = new Vector(this.uDir,uColor);

        //The "v" vector
        this.vDir = new Vector3(this.params.vx, this.params.vy, this.params.vz);
        let vColor = new Color().setHSL(0.6,0.5,0.3);
        this.v = new Vector(this.vDir,vColor);

        //The Cross Product
        this.crossDir = new Vector3().crossVectors(this.uDir,this.vDir);
        let crossColor =  new Color().setHSL(0.3,0.4,0.4);
        this.cross = new Vector(this.crossDir,crossColor);



        //The Parallelogram
        //make the function that generates the parametric geometry
        //takes in uv in (0,1)x(0,1)
        let geom = this.createParallelogram();
        let mat = new MeshPhysicalMaterial({
            side:DoubleSide,
            clearcoat:1,
            color:crossColor,
        });
        this.parallelogram = new Mesh(geom,mat);


           //The axes
        let axisColor = new Color().setHSL(0.1,0.5,0.5);
        this.xAxis = new Rod({
            end1:new Vector3(-10,0,0),
            end2:new Vector3(10,0,0),
            radius:0.02,
            color: axisColor
        });
        this.yAxis = new Rod({
            end1:new Vector3(0,-10,0),
            end2:new Vector3(0,10,0),
            radius:0.02,
            color: axisColor
        });
        this.zAxis = new Rod({
            end1:new Vector3(0,0,-10),
            end2:new Vector3(0,0,10),
            radius:0.02,
            color: axisColor
        });
        this.xAxis.setVisibility(this.params.axes);
        this.yAxis.setVisibility(this.params.axes);
        this.zAxis.setVisibility(this.params.axes);




    }

    createParallelogram(){
        let uDir = this.uDir;
        let vDir = this.vDir;

        let parameterization = function(s,t,dest){

            let res = uDir.clone().multiplyScalar(s);
            res.add(vDir.clone().multiplyScalar(t));

            dest.set(res.x,res.y,res.z);
        }

        return new ParametricGeometry(parameterization, 16,16 );
    }


    setDir(uDir, vDir){

        this.uDir=uDir;
        this.u.setDir(this.uDir);

        this.vDir=vDir;
        this.v.setDir(this.vDir);

        this.crossDir = new Vector3().crossVectors(this.uDir,this.vDir);
        this.cross.setDir(this.crossDir);

        this.parallelogram.geometry.dispose();
        this.parallelogram.geometry=this.createParallelogram();
    }

    addToScene(scene){
        this.u.addToScene(scene);
        this.v.addToScene(scene);
        this.cross.addToScene(scene);
        scene.add(this.parallelogram);

        this.xAxis.addToScene(scene);
        this.yAxis.addToScene(scene);
        this.zAxis.addToScene(scene);

    }

    addToUI(ui){
        let thisObj=this;
        ui.add(thisObj.params,"axes").name("Show Axes").onChange(function(value){
            thisObj.params.axes=value;
            thisObj.xAxis.setVisibility(value);
            thisObj.yAxis.setVisibility(value);
            thisObj.zAxis.setVisibility(value);
        });

        ui.add(thisObj.params,"animate").name("Animate");

        let uFolder =ui.addFolder('u');
        let vFolder =ui.addFolder('v');
        uFolder.close();
        vFolder.close();

        uFolder.add(thisObj.params,"ux",-3,3,0.01).name("x").onChange(function(val){
            thisObj.params.ux=val;
            let dir = new Vector3(thisObj.params.ux,thisObj.params.uy,thisObj.params.uz);
            thisObj.setDir(dir,thisObj.vDir);
        });

        uFolder.add(thisObj.params,"uy",-3,3,0.01).name("y").onChange(function(val){
            thisObj.params.uy=val;
            let dir = new Vector3(thisObj.params.ux,thisObj.params.uy,thisObj.params.uz);
            thisObj.setDir(dir,thisObj.vDir);
        });

        uFolder.add(thisObj.params,"uz",-3,3,0.01).name("z").onChange(function(val){
            thisObj.params.uz=val;
            let dir = new Vector3(thisObj.params.ux,thisObj.params.uy,thisObj.params.uz);
            thisObj.setDir(dir,thisObj.vDir);
        });


        vFolder.add(thisObj.params,"vx",-3,3,0.01).name("x").onChange(function(val){
            thisObj.params.vx=val;
            let dir = new Vector3(thisObj.params.vx,thisObj.params.vy,thisObj.params.vz);
            thisObj.setDir(thisObj.uDir,dir);
        });

        vFolder.add(thisObj.params,"vy",-3,3,0.01).name("y").onChange(function(val){
            thisObj.params.vy=val;
            let dir = new Vector3(thisObj.params.vx,thisObj.params.vy,thisObj.params.vz);
            thisObj.setDir(thisObj.uDir,dir);
        });

        vFolder.add(thisObj.params,"vz",-3,3,0.01).name("z").onChange(function(val){
            thisObj.params.vz=val;
            let dir = new Vector3(thisObj.params.vx,thisObj.params.vy,thisObj.params.vz);
            thisObj.setDir(thisObj.uDir,dir);
        });



    }

    tick(time,dTime){

        if(this.params.animate){
            let x = 3*Math.sin(time);
            let y = 2.*Math.sin(2*time);
            let z = 1.*Math.cos(3*time);

            this.setDir(new Vector3(x,y,z),new Vector3(1,2,3));
        }

    }
}


let ex = new CrossProduct();

export default {ex};