import {
    CatmullRomCurve3,
    Mesh,
    MeshPhysicalMaterial,
    SphereBufferGeometry,
    TubeBufferGeometry,
    Vector3,
    Group,
} from "../../../3party/three/build/three.module.js";




//the input options that are required:
//xRange or range
//radius
//f
//color

//this does NOT draw a graph of the function $f$, but rather a graph of its integral
//computed via a right endpoint Riemann sum

class Graph2DIntegral{
    constructor(options){

        //range is an object {min:x, max:y}
        this.domain = options.domain;

        //radius of the eventual tube
        this.radius = options.radius || 0.1;

        //f is a function that takes in x and spits out y
        this.f=options.f

        let material = new MeshPhysicalMaterial(
            {
                clearcoat:1,
                color: options.color||0xffffff,
            }
        );

        this.res = options.res || 100;

        this.buildTubeGeometry();
        this.tube = new Mesh(this.tubeGeometry, material);

        let sph = new SphereBufferGeometry(1,32,16);
        let ballRad = 1.5*this.radius;

        this.maxBall = new Mesh(sph,material);
        this.maxBall.scale.set(ballRad,ballRad,ballRad);
        this.maxBall.position.set(this.domain.min, this.f(this.domain.min), 0);

        this.minBall = new Mesh(sph, material);
        this.minBall.scale.set(ballRad,ballRad,ballRad);
        this.minBall.position.set(this.domain.max, this.f(this.domain.max), 0);

        this.graph = new Group();
        this.graph.add(this.minBall);
        this.graph.add(this.maxBall);
        this.graph.add(this.tube);

    }


    buildTubeGeometry(params){
        //take the function f and integrate it!
        let pts = [];
        let x,y;
        const spread = this.domain.max-this.domain.min;
        const Dx = spread/this.res;
        let xi;
        let val = 0.;
        for(let i=0;i<this.res;i++){
            x=this.domain.min+i*Dx;
            y=this.f(x,params);
            val += y*Dx;
            pts.push(new Vector3(x,val,0));
        }

        //the definite integral is the last value to come out of the function
        this.definiteIntegral = val;

        //draw the curve
        let curve = new CatmullRomCurve3(pts);
        this.tubeGeometry = new TubeBufferGeometry(curve, 5.*this.res,this.radius,16);
    }


    addToScene( scene ){
        scene.add(this.graph);
    }

    setRadius(rad){
        this.radius=rad;
    }

    update(params){

        this.tube.geometry.dispose();
        this.buildTubeGeometry(params);
        this.tube.geometry = this.tubeGeometry;

        let ballRad = 1.5 * this.radius;
        this.minBall.scale.set(ballRad,ballRad,ballRad);
        this.maxBall.scale.set(ballRad,ballRad,ballRad);

        //the starting area is zero; the final is the totalIntegral
        this.minBall.position.set(this.domain.min, 0., 0);
        this.maxBall.position.set(this.domain.max, this.definiteIntegral, 0);
    }

    setDomain(newDomain){
        this.domain=newDomain;
    }

    setFunction(newFunction){
        this.f=newFunction;
    }

    setPosition(x,y,z){
        this.graph.position.set(x,y,z);
    }

    setVisibility(value){
        this.graph.visible = value;
    }

    getIntegral(){
        return this.definiteIntegral;
    }

}

export default Graph2DIntegral;