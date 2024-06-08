import {
    CatmullRomCurve3,
    Mesh,
    MeshPhysicalMaterial,
    TubeGeometry,
    Vector2
} from "../../../../3party/three/build/three.module.js";
import State from "../Integrator/State.js";

class Circle{
    constructor(pts,rad) {
        this.rad = rad;
        this.pts = pts;

        this.curve = new CatmullRomCurve3(this.pts,true);
        this.circumference = this.curve.getLength();

        let tubeRad = Math.min(0.1,this.rad/20);
        let tubeGeo = new TubeGeometry(this.curve,200,tubeRad,8,true);
        let mat = new MeshPhysicalMaterial({
            color:0xffffff,
            clearcoat:1,
        });
        this.tube = new Mesh(tubeGeo, mat);

    }

    addToScene(scene){
        scene.add(this.tube);
    }

    update(pts){
        this.curve = new CatmullRomCurve3(this.pts,true);
        this.tube.geometry.dispose();
        let rad = Math.min(0.1,this.rad/20);
        this.tube.geometry = new TubeGeometry(this.curve,200,rad,8,true);
    }
}



//draws circles on the surface of a function f(x,y)
class ConcentricCircles{
    constructor(surface, centerPos=new Vector2(0,0), radius=1, N=2,) {
        this.surface = surface;
        this.center = centerPos;
        this.radius = radius;
        this.N = N;
        this.res = 60;

        this.circlePts=new Array(this.N);
        for(let i=0;i<this.N;i++){
            this.circlePts[i]=new Array(this.res);
        }

        this.circles = new Array(this.N);
        this.computePoints();
        //now build the circles
        for(let i=0; i<this.N;i++){
            let rad = this.radius/this.N*i
            this.circles[i] = new Circle(this.circlePts[i],rad);
        }

        }

    computePoints() {
        //going to go around 20 different diameters of the circle:
        for (let i = 0; i < this.res; i++) {
            let dir = new Vector2(Math.cos(2 * Math.PI * i / this.res), Math.sin(2 * Math.PI * i / this.res));
            let state = new State(this.center, dir);

            //now start integrating along this path, and stop ever certain amount to add points to all the circles:
            let dr = 1 * this.radius / this.N;
            let numSteps = Math.floor(dr / this.surface.integrator.ep);
            for (let n = 0; n < this.N; n++) {
                for (let j = 0; j < numSteps; j++) {
                    state = this.surface.integrator.step(state);
                }
                let p = this.surface.parameterization(state.pos);
                this.circlePts[n][i]=p;
            }
        }
    }


    updateCircles(){
        for(let i=0;i<this.N;i++){
                let rad = this.radius/this.N*i
                this.circles[i].update(this.circlePts[i],rad);
        }
    }


    addToScene(scene){
        for(let i=0; i<this.N; i++){
            this.circles[i].addToScene(scene);
        }
    }

    resetCenter(pos){

        this.center = pos;
        this.computePoints();
        this.updateCircles();

    }

    resetRad(radius){
        this.radius = radius;
        this.computePoints();
        this.updateCircles();

    }
}



export default ConcentricCircles;