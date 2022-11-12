
import { GraphOnBoard } from "../components/calculus/GraphOnBoard.js";
import { SecantLine } from "../components/calculus/SecantLine.js";
import { TangentLine } from "../components/calculus/TangentLine.js";

import { getRange, differentiate } from "../math/functions_singleVar.js";
import {RiemannRectangle} from "../components/Depreciated/RiemannRectangle.js";

function setX(percent, domain){
    let spread = domain.max-domain.min;
    let x = domain.min + percent * spread;
    return x;
}


class SecantLinePlotter{
    constructor(options){

        this.domain = options.domain;
        this.f = options.f
        this.range = getRange(this.f, this.domain);

        const graphOptions = {
            domain: this.domain,
            range: this.range,
            f: this.f,
            radius: options.radius,
            color: options.color,
            res:500,
        }
        this.graph = new GraphOnBoard( graphOptions );


        const secantOptions = {
            x: setX(0.3, this.domain),
            f: this.f,
            h:0.5,
            length:5,
            mainColor: options.color,
            auxColor: 0xffffff,
            accentColor: options.accentColor,
            radius: 0.5*options.radius,
        }
        this.secant = new SecantLine( secantOptions );
        this.secant.setPosition(0,0,this.graph.radius);

        const tangentOptions = {
            x:setX(0.3,this.domain),
            f:this.f,
            length: 5,
            radius: 0.75*options.radius,
            color: options.accentColor,
        }
        this.tangent = new TangentLine( tangentOptions );
        this.tangent.setPosition(0,0,-this.graph.radius);

    }

    addToScene( scene ){
        this.graph.addToScene( scene);
        this.secant.addToScene(scene);
        this.tangent.addToScene(scene);
    }

    addToUI( ui ){

        let params ={
            domain:{
                min:this.domain.min,
                max:this.domain.max
            },
            range:{
                min:this.range.min,
                max:this.range.max,
            },
            x:this.secant.x,
            h:this.secant.h,
            drawSecant:true,
            drawTangent:true,
        }

        //this refers to the UI inside of the following commands
        let obj = this;

        let domainFolder = ui.addFolder('Domain');
        let secantFolder = ui.addFolder('Secant');

        domainFolder.add(params.domain, 'min', -5,0,0.01).name('xMin').onChange(function(){
           obj.graph.resetDomain(params.domain);
        });

        domainFolder.add(params.domain, 'max', 0,3,0.01).name('xMax').onChange(function(){
            obj.graph.resetDomain(params.domain);
        });


        secantFolder.add(params, 'x', 0, 1,0.001).name('x').onChange(function(){
            const newX = setX(params.x, params.domain);
            obj.secant.resetX(newX);
            obj.tangent.resetX(newX);
        });

        secantFolder.add(params, 'h', 0.01, 2,0.01).name('h').onChange(function(){
            obj.secant.resetH(params.h);
        });

        ui.add(params, 'drawSecant').name('Secant').onChange(function(value) {
            obj.secant.setVisibility(value);
        });

        ui.add(params, 'drawTangent').name('Tangent').onChange(function(value) {
            obj.tangent.setVisibility(value);
        });

    }

    tick(time, dTime){}
}

export { SecantLinePlotter };


const data = {
    domain: { min:-5, max:3},
    f: (x)=> Math.cos(3*x)+Math.cos(x),
    res:300,
    radius:0.05,
    color:0x244f30,
    accentColor:0xa8a032,
};

let example = new SecantLinePlotter(data)


export default { example };