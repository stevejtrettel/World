
import {
    Vector3,
    Mesh,
    Object3D,
} from "../../3party/three/build/three.module.js";
import {
    MeshLine,
    MeshLineMaterial,
} from "../../3party/MeshLine.js";



class FlowLine extends Object3D {

    constructor( integrator, iniState, lineLength ) {

        super();

        this.state = iniState;
        this.integrator = integrator;
        this.lineLength = lineLength;
        this.N = Math.floor(this.lineLength/this.integrator.ep);


        //an array with N copies of the initial state
        this.pts = new Array(this.N).fill(iniState);

        //the second argument (optional) that MeshLine can take is a thickness
        const widths =  p=> 0.05*(p*(1-p)+0.1);

        this.line = new MeshLine();
        this.line.setPoints(this.pts, p=> 0.05*(p*(1-p)+0.1));

        const matParams = {
            lineWidth:0.03,
        };
        this.material = new MeshLineMaterial( matParams );

        this.mesh = new Mesh( this.line, this.material );
        this.name = null;

    }

    setLineWidth( widths ){
        //keep points around
        this.line.setPoints(this.pts, widths);
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
