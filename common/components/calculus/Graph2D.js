import {
    CatmullRomCurve3,
    Mesh,
    MeshPhysicalMaterial,
    SphereBufferGeometry,
    TubeBufferGeometry,
    Vector3
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
        this.range = options.domain || options.xRange || options.range;

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

        let geometry = buildTubeGeometry(this.f, this.range, this.radius ,this.res);

        this.graph = new Mesh(geometry, material);

        let sph = new SphereBufferGeometry(1.5*this.radius,32,16);

        this.maxBall = new Mesh(sph,material);
        this.maxBall.position.set(this.range.min, this.f(this.range.min), 0);

        this.minBall = new Mesh(sph, material);
        this.minBall.position.set(this.range.max, this.f(this.range.max), 0);

    }

    addToScene( scene ){
        scene.add(this.graph);
        scene.add(this.minBall);
        scene.add(this.maxBall);
    }

    updateGraph(){
        this.graph.geometry.dispose();
        this.graph.geometry=buildTubeGeometry(this.f,this.range,this.radius, this.res);
        this.minBall.position.set(this.range.min, this.f(this.range.min), 0);
        this.maxBall.position.set(this.range.max, this.f(this.range.max), 0);
    }

    resetRange(newRange){
        this.range=newRange;
        this.updateGraph();
    }

    resetFunction(newFunction){
        this.f=newFunction;
        this.updateGraph();
    }

}


export { Graph2D };