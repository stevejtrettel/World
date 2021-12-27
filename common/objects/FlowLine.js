
import {
    Vector3,
    Mesh,
    Object3D,
} from "../../3party/three/build/three.module.js";
import {
    MeshLine,
    MeshLineMaterial,
} from "../../3party/MeshLine.js";


function createFlow( integrator, state, length ) {

    let N = length / integrator.ep;
    let pts = [];

    for( let i=0; i<N; i++ ) {
       // state = integrator.step(state);
        pts.push(state);
    }

    //state has been updated to the final point along the curve
    return pts;
}


function reFill(pts, val){
    let newPts = new Array(pts.length);
    for( let i=0; i<pts.length; i++){
        newPts[i]=new Vector3(val.x,val.y,val.z);
    }
    return newPts;
}


class FlowLine extends Object3D {

    constructor( integrator, iniState, N ) {

        super();

        this.state = iniState;
        this.integrator = integrator;
        this.N = N;


        //an array with N copies of the initial state
        this.pts = new Array(this.N).fill(iniState);

        this.line = new MeshLine();
        this.line.setPoints(this.pts);

        const matParams = {
            lineWidth:0.03,
        };
        this.material = new MeshLineMaterial( matParams );

        this.mesh = new Mesh( this.line, this.material );
        this.name = null;

    }


    setName(name){
        this.name=name;
    }

    restart( iniState ){
        //CANT FIGURE OUT WHAT TO DO HERE
    }


    step(){
        //pop off the first point on the list:
        this.pts.shift();
       //get a new point, by integrating the current state
        this.state = this.integrator.step( this.state );
        this.pts.push( this.state );
        //update the mesh line
        this.line.setPoints( this.pts );
    }

    addToScene( scene ){
        scene.add(this.mesh);
    }

    addToUI( ui ){

    }

    tick(){
        this.step();
    }


}



export { FlowLine };
