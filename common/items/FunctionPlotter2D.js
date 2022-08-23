import{
    Vector3,
    CatmullRomCurve3,
    DoubleSide,
    Mesh,
    MeshPhysicalMaterial,
    PlaneBufferGeometry,
    SphereBufferGeometry,
    TubeBufferGeometry,
} from "../../3party/three/build/three.module.js";


class Rod{
    constructor(options){
        this.end1=options.end1;
        this.end2=options.end2;
        this.radius = options.radius || 0.1;

        const sph = new SphereBufferGeometry(1.5*this.radius,32,16);
        const material = new MeshPhysicalMaterial(
            {
                opacity: 0,
                transmission: 0.9,
                clearcoat: 1,
                side: DoubleSide,
            });

        this.ball1 = new Mesh(sph,material);
        this.ball1.position.set(this.end1.x,this.end1.y,this.end1.z);

        this.ball2 = new Mesh(sph,material);
        this.ball2.position.set(this.end2.x,this.end2.y,this.end2.z);

        const curve = new CatmullRomCurve3([this.end1, this.end2]);
        const geom = new TubeBufferGeometry(curve, 1 ,this.radius, 8);

        this.tube = new Mesh(geom, material);

    }

    addToScene( scene ){
        scene.add(this.tube);
        scene.add(this.ball1);
        scene.add(this.ball2);
    }

    setPosition(x,y,z){
       this.tube.position.set(x,y,z);
       this.ball1.position.set(x,y,z);
       this.ball2.position.set(x,y,z);
    }

    resetRod(end1, end2){
        this.end1=end1;
        this.end2=end2;

        this.ball1.position.set(this.end1.x,this.end1.y,this.end1.z);
        this.ball2.position.set(this.end2.x,this.end2.y,this.end2.z);

        this.tube.geometry.dispose();
        const curve = new CatmullRomCurve3([this.end1, this.end2]);
        this.tube.geometry = new TubeBufferGeometry(curve, 1 ,this.radius, 8);
    }

}

class GlassPanel{
    constructor(options) {

        //right now only required options are an xRange and yRange of the form
        //xRange:{min:x1, max:x2}
        this.xRange = options.xRange;
        this.yRange = options.yRange;

        let glassMaterial = new MeshPhysicalMaterial(
            {
                opacity: 0,
                transmission: 1.,
                clearcoat: 1,
                side: DoubleSide,
            });

        let xSpread = (this.xRange.max - this.xRange.min);
        let ySpread = (this.yRange.max - this.yRange.min);

        let glassGeometry = new PlaneBufferGeometry(xSpread, ySpread);

        //right now centered at (0,0,0);
        this.glass = new Mesh(glassGeometry, glassMaterial);

        this.glass.position.set(
            (this.xRange.min+this.xRange.max)/2,
            (this.yRange.min+this.yRange.max)/2,
            0,
        );

    };

    addToScene( scene ){
        scene.add(this.glass);
    }

    resetRange(xRange, yRange){
        this.xRange=xRange;
        this.yRange=yRange;
        let xSpread = (this.xRange.max - this.xRange.min);
        let ySpread = (this.yRange.max - this.yRange.min);

        this.glass.geometry.dispose();
        this.glass.geometry = new PlaneBufferGeometry(xSpread, ySpread);
        this.glass.position.set(
            (this.xRange.min+this.xRange.max)/2,
            (this.yRange.min+this.yRange.max)/2,
            0,
        );
    }
}




class BlackBoard{
    constructor(options){
        this.xRange=options.xRange;
        this.yRange=options.yRange;

        this.xSpread = this.xRange.max-this.xRange.min;
        this.ySpread = this.yRange.max-this.yRange.min;

        //build the blackboard
        const boardOptions={
            xRange:{
                min: this.xRange.min-0.5,
                max: this.xRange.max+0.5,
            },
            yRange:{
                min: this.yRange.min-0.5,
                max: this.yRange.max+0.5
            }
        }
        this.board = new GlassPanel(boardOptions);

        //build the x axis
        const xOptions = {
            end1: new Vector3(this.xRange.min,0,0),
            end2: new Vector3(this.xRange.max,0,0),
            radius:0.05,
        }
        this.xAxis = new Rod(xOptions);


        //build the y axis
        const yOptions = {
            end1: new Vector3(0,this.yRange.min,0),
            end2: new Vector3(0,this.yRange.max,0),
            radius:0.05,
        }
        this.yAxis = new Rod(yOptions);
    }

    addToScene( scene ){
        this.board.addToScene(scene);
        this.xAxis.addToScene(scene);
        this.yAxis.addToScene(scene);
    }

    resetRange(xRange, yRange){
        this.xRange=xRange;
        this.yRange=yRange;
        this.xSpread = this.xRange.max-this.xRange.min;
        this.ySpread = this.yRange.max-this.yRange.min;

        //build the blackboard
        const newXRange ={
            min: this.xRange.min-0.5,
            max: this.xRange.max+0.5,
        };
            const newYRange = {
                min: this.yRange.min-0.5,
                max: this.yRange.max+0.5,
            };
        this.board.resetRange(newXRange, newYRange);

        const xEnd1 = new Vector3(this.xRange.min,0,0);
        const xEnd2 = new Vector3(this.xRange.max,0,0);
        this.xAxis.resetRod(xEnd1,xEnd2);

        const yEnd1 = new Vector3(0,this.yRange.min,0);
        const yEnd2 = new Vector3(0,this.yRange.max,0);
        this.yAxis.resetRod(yEnd1,yEnd2);


    }

    addToUI(ui){}

    tick(){}
}




function buildTubeGeometry(f,range, radius, res){
    let pts = [];
    let x,y;
    const spread = range.max-range.min;
    for(let i=0;i<res;i++){
        x=range.min+i/res*spread;
        y=f(x);
        pts.push(new Vector3(x,y,0));
    }
    let curve = new CatmullRomCurve3(pts);

    return new TubeBufferGeometry(curve, res,radius,8);
}

class Graph2D{
    constructor(options){

        //range is an object {min:x, max:y}
        this.range = options.xRange;

        //f is a function that takes in x and spits out y
        this.f=options.f

        let material = new MeshPhysicalMaterial(
            {
                clearcoat:1,
                color:0xffffff,
            }
        );

        this.res = 100 || options.res;

        let geometry = buildTubeGeometry(this.f, this.range, 0.1,this.res);

        this.graph = new Mesh(geometry, material);

        let sph = new SphereBufferGeometry(0.15,32,16);

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
        this.graph.geometry=buildTubeGeometry(this.f,this.range,0.1, this.res);
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

    addToUI(ui){}

    tick(time,dTime){}

}







const data = {
    xRange: { min:-3, max:1},
    yRange: {min:-5, max:5},
    f: (x)=> Math.cos(x),
    res:100,
};


class GraphPlotter{
    constructor(options){
        this.xRange=options.xRange;
        this.yRange=options.yRange;

        this.graph = new Graph2D(options);
        this.blackboard = new BlackBoard(options);
    }

    addToScene( scene ){
        this.graph.addToScene( scene);
        this.blackboard.addToScene(scene);
    }

    addToUI( ui ){
        let params ={
            xRange:{
                min:this.xRange.min,
                max:this.xRange.max
            },
            yRange:{
                min:this.yRange.min,
                max:this.yRange.max,
            }
        }

        //this refers to the UI inside of the following commands
        let obj = this;

        let rangeFolder = ui.addFolder('Range');

        rangeFolder.add(params.xRange, 'min', -3,0,0.01).name('xMin').onChange(function(){
           obj.graph.resetRange(params.xRange);
            obj.blackboard.resetRange(params.xRange,params.yRange);
        });

        rangeFolder.add(params.xRange, 'max', 0,3,0.01).name('xMax').onChange(function(){
            obj.graph.resetRange(params.xRange);
            obj.blackboard.resetRange(params.xRange,params.yRange);
        });

        rangeFolder.add(params.yRange, 'min', -3,0,0.01).name('yMin').onChange(function(){
            obj.graph.resetRange(params.xRange);
            obj.blackboard.resetRange(params.xRange,params.yRange);
        });

        rangeFolder.add(params.yRange, 'max', 0,3,0.01).name('yMax').onChange(function(){
            obj.graph.resetRange(params.xRange);
            obj.blackboard.resetRange(params.xRange,params.yRange);
        });

    }

    tick(time, dTime){}
}



let example = new GraphPlotter(data)


export default { example };