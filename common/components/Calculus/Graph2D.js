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


class Graph2D{
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

        let sph = new SphereBufferGeometry(1.5*this.radius,32,16);

        this.maxBall = new Mesh(sph,material);
        this.maxBall.position.set(this.domain.min, this.f(this.domain.min), 0);

        this.minBall = new Mesh(sph, material);
        this.minBall.position.set(this.domain.max, this.f(this.domain.max), 0);

        this.graph = new Group();
        this.graph.add(this.minBall);
        this.graph.add(this.maxBall);
        this.graph.add(this.tube);

    }


    buildTubeGeometry(params){
        let pts = [];
        let x,y;
        const spread = this.domain.max-this.domain.min;
        for(let i=0;i<this.res;i++){
            x=this.domain.min+i/this.res*spread;
            y=this.f(x,params);
            pts.push(new Vector3(x,y,0));
        }
        let curve = new CatmullRomCurve3(pts);

        this.tubeGeometry = new TubeBufferGeometry(curve, 5.*this.res,this.radius,16);
    }


    addToScene( scene ){
        scene.add(this.graph);
    }

    update(params){

        this.tube.geometry.dispose();
        this.buildTubeGeometry(params);
        this.tube.geometry = this.tubeGeometry;

        this.minBall.position.set(this.domain.min, this.f(this.domain.min,params), 0);
        this.maxBall.position.set(this.domain.max, this.f(this.domain.max,params), 0);
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

}

export default Graph2D;