import {
    Vector2,
    Vector3,
    Group,
    MeshPhysicalMaterial,
    SphereBufferGeometry,
    Mesh,
} from "../../../3party/three/build/three.module.js";

import { Rod } from "../basic-shapes/Rod.js";


function secantSlope(f, x, deltaX){
    let y = f(x);
    let y2 = f(x+deltaX);
    let deltaY = y2-y;
    return deltaY/deltaX;
}


//options require the following:
//f,x,h,length,radius,color
class SecantLine{
    constructor(options){

        this.f = options.f;

        this.x = options.x;
        this.y = this.f(this.x);

        this.h = options.h;
        this.x2 = this.x+this.h;
        this.y2 = this.f(this.x2);

        this.slope = (this.y2-this.y)/this.h;

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

        this.secantSegment = new Rod( rodOptions );



        const accentMaterial = new MeshPhysicalMaterial(
            {
                color: options.accentColor,
                clearcoat:1,
            }
        );

        const ballGeometry = new SphereBufferGeometry(1.5*this.radius,32,16);

        //ball at x
        this.ballX = new Mesh(ballGeometry, accentMaterial);
        this.ballX.position.set(this.x, this.y, 0);

        //ball at x+h
        this.ballXH =  new Mesh(ballGeometry, accentMaterial);
        this.ballXH.position.set(this.x2, this.y2, 0);

        this.balls = new Group();
        this.balls.add(this.ballX);
        this.balls.add(this.ballXH);


        this.run = new Rod(
            {
                end1: new Vector3(this.x, this.y, 0),
                end2: new Vector3(this.x2, this.y, 0),
                radius: 0.3*this.radius,
                color: options.auxColor
            }
        );

        this.rise = new Rod(
            {
                end1: new Vector3(this.x2, this.y, 0),
                end2: new Vector3(this.x2, this.y2, 0),
                radius: 0.3*this.radius,
                color:options.auxColor,
            }
        );


    }

    getPoint(xNew){
        return this.y+this.slope*(xNew-this.x);
    }

    addToScene( scene ){
       scene.add(this.balls);

       this.secantSegment.addToScene(scene);
       this.rise.addToScene(scene);
       this.run.addToScene(scene);
    }

    setX( newX ){
        this.x = newX;
        this.update();
     }

    setH( newH ){
        this.h = newH;
        this.update();
    }

    setF( newF ){
        this.f=newF;
        this.update();
    }

    setVisibility(value){
        this.secantSegment.setVisibility(value);
        this.rise.setVisibility(value);
        this.run.setVisibility(value);

        this.balls.visible = value;
    }

    setPosition(x,y,z){
        this.secantSegment.setPosition(x,y,z);
        this.rise.setPosition(x,y,z);
        this.run.setPosition(x,y,z);

        this.balls.position.set(x,y,z);
    }


    update(params){
        this.y = this.f(this.x,params);
        this.x2 = this.x+this.h;
        this.y2 = this.f(this.x2,params);
        this.slope = (this.y2-this.y)/this.h;

        //move the balls around
        this.ballX.position.set(this.x, this.y, 0);
        this.ballXH.position.set(this.x2, this.y2, 0);


        const delta = Math.sqrt(1/(1+this.slope*this.slope))*this.length/2.;
        const xStart = this.x-delta;
        const xEnd = this.x+delta;

        this.secantSegment.resize(
            new Vector3(xStart, this.getPoint(xStart),0),
            new Vector3(xEnd, this.getPoint(xEnd),0)
        );

        //redraw the rods
        const rise1 = new Vector3(this.x2,this.y,0);
        const rise2 = new Vector3(this.x2, this.y2,0);
        this.rise.resize(rise1, rise2);

        const run1 = new Vector3(this.x, this.y,0);
        const run2 = new Vector3(this.x2, this.y, 0);
        this.run.resize(run1, run2);
    }

}

export default SecantLine;
