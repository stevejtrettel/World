
import{ BlackBoard } from "../components/calculus/Blackboard.js";
import {Graph2D } from "../components/calculus/Graph2D.js";
import {SecantLine} from "../components/calculus/SecantLine.js";



function getYRange(f, domain){
    let pts = [];
    let res=100;
    const spread = domain.max-domain.min;

    let x;
    for(let i=0;i<res;i++){
        x=domain.min+i/res*spread;
        pts.push(f(x));
    }

    const yMin = Math.min(...pts);
    const yMax = Math.max(...pts);

    return {
        min: yMin,
        max: yMax,
    };
}

function setX(percent, domain){
    let spread = domain.max-domain.min;
    let x = domain.min + percent * spread;
    return x;
}


class GraphPlotter{
    constructor(options){
        this.domain = options.domain;
        this.f = options.f;
        this.range = getYRange(this.f, this.domain);

        this.graph = new Graph2D(options);


        const boardOptions = {
            xRange: this.domain,
            yRange: this.range,
            radius:options.radius,
        }
        this.blackboard = new BlackBoard( boardOptions );


        const secantOptions = {
            x: setX(0.3, this.domain),
            f: this.f,
            h:0.5,
            mainColor: options.color,
            auxColor: 0xffffff,
            accentColor: options.accentColor,
            radius: options.radius,
        }
        this.secant = new SecantLine( secantOptions );
    }

    addToScene( scene ){
        this.graph.addToScene( scene);
        this.blackboard.addToScene(scene);
        this.secant.addToScene(scene);
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
        }

        //this refers to the UI inside of the following commands
        let obj = this;

        let domainFolder = ui.addFolder('Domain');
        let secantFolder = ui.addFolder('Secant');

        domainFolder.add(params.domain, 'min', -5,0,0.01).name('xMin').onChange(function(){
           obj.graph.resetRange(params.domain);
           params.yRange = getYRange(obj.f,params.domain);
           obj.blackboard.resetRange(params.domain,params.range);
        });

        domainFolder.add(params.domain, 'max', 0,3,0.01).name('xMax').onChange(function(){
            obj.graph.resetRange(params.domain);
            params.range = getYRange(obj.f,params.domain);
            obj.blackboard.resetRange(params.domain,params.range);
        });


        secantFolder.add(params, 'x', 0, 1,0.01).name('x').onChange(function(){
            const newX = params.domain.min+(params.domain.max-params.domain.min)*params.x
            obj.secant.resetX(newX);
        });

        secantFolder.add(params, 'h', 0.01, 2,0.01).name('h').onChange(function(){
            obj.secant.resetH(params.h);
        });

    }

    tick(time, dTime){}
}

export { GraphPlotter };


const data = {
    domain: { min:-5, max:3},
    f: (x)=> Math.cos(3*x)+Math.cos(x),
    res:300,
    radius:0.05,
    color:0x244f30,
    accentColor:0xa8a032,
};

let example = new GraphPlotter(data)


export default { example };