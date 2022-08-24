import{ Vector3 } from "../../../3party/three/build/three.module.js";
import { Rod } from "./Rod.js";

function derivative(f, x){
    const dx = 0.001;
    const dy = f(x+dx/2)-f(x-dx/2);
    return dy/dx;
}


class TangentLine{
    constructor( options ){

       this.f = options.f;
       this.x = options.x;
       this.y = this.f(this.x);
       this.slope = derivative( this.f, this.x );

        this.length = options.length;
        this.radius = options.radius;
        this.color = options.color;

       //now have all the info needed for the point slope form of a line.
        //just need to use this to make a line segment centered at x, of length L

        const delta = Math.sqrt(1/(1+this.slope*this.slope))*this.length/2.;
        const xStart = this.x-delta;
        const xEnd = this.x+delta;


        const rodOptions = {
            end1: new Vector3(xStart, this.getPoint(xStart), 0),
            end2: new Vector3(xEnd, this.getPoint(xEnd), 0),
            radius: this.radius,
            color: options.color,
        }
        this.rod = new Rod( rodOptions );

    }


    getPoint(xNew){
        return this.y+this.slope*(xNew-this.x);
    }

    addToScene( scene ){
        this.rod.addToScene( scene );
    }

    resetX( newX ) {
        this.x=newX;
        this.y = this.f(this.x);
        this.slope = derivative( this.f, this.x );

        const delta = Math.sqrt(1/(1+this.slope*this.slope))*this.length/2.;
        const xStart = this.x-delta;
        const xEnd = this.x+delta;

        this.rod.resetRod(
            new Vector3(xStart, this.getPoint(xStart),0),
            new Vector3(xEnd, this.getPoint(xEnd),0)
        );

    }

    resetF( newF ){
        this.f=newF;
        this.y = this.f(this.x);
        this.slope = derivative( this.f, this.x );

        const delta = Math.sqrt(1/(1+this.slope*this.slope))*this.length/2.;
        const xStart = this.x-delta;
        const xEnd = this.x+delta;

        this.rod.resetRod(
            new Vector3(xStart, this.getPoint(xStart),0),
            new Vector3(xEnd, this.getPoint(xEnd),0)
        );
    }

    setVisibility(value){
        this.rod.setVisibility(value);
    }

    setPosition(x,y,z){
        this.rod.setPosition(x,y,z);
    }
}



export { TangentLine };