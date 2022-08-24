import {
    CatmullRomCurve3,
    Mesh,
    MeshPhysicalMaterial,
    SphereBufferGeometry,
    TubeBufferGeometry,
    Vector3,
    Group,
} from "../../../3party/three/build/three.module.js";




function buildTubeGeometry(f,domain, radius, res){
    let pts = [];
    let x,y;
    const spread = domain.max-domain.min;
    for(let i=0;i<res;i++){
        x=domain.min+i/res*spread;
        y=f(x);
        pts.push(new Vector3(x,y,0));
    }
    let curve = new CatmullRomCurve3(pts);

    return new TubeBufferGeometry(curve, res,radius,8);
}



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

        let geometry = buildTubeGeometry(this.f, this.domain, this.radius ,this.res);

        this.tube = new Mesh(geometry, material);

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

    addToScene( scene ){
        scene.add(this.graph);
    }

    updateGraph(){
        this.tube.geometry.dispose();
        this.tube.geometry=buildTubeGeometry(this.f,this.domain,this.radius, this.res);
        this.minBall.position.set(this.domain.min, this.f(this.domain.min), 0);
        this.maxBall.position.set(this.domain.max, this.f(this.domain.max), 0);
    }

    resetDomain(newDomain){
        this.domain=newDomain;
        this.updateGraph();
    }

    resetFunction(newFunction){
        this.f=newFunction;
        this.updateGraph();
    }

    setPosition(x,y,z){
        this.graph.position.set(x,y,z);
    }

    setVisibility(value){
        this.graph.visible = value;
    }

}


export { Graph2D };