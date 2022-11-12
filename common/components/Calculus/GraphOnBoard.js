import {getRange} from "../../math/functions_singleVar.js";
import Graph2D from "./Graph2D.js";
import {BlackBoard} from "./Blackboard.js";

//class to draw a graph on a board, and automatically deal with resizing the range/domain etc
//required options: f, domain
//also good to include: res, color, radius

class GraphOnBoard{
    constructor( options ){

        this.f = options.f;
        this.domain = options.domain;

        //only compute the range if its not provided
        if('range' in options){
            this.range = options.range;
        }
        else {
            this.range = getRange(this.f, this.domain);
        }

        this.res = options.res || 100;
        this.radius = options.radius || 0.02;
        this.color = options.color || 0xfffff;


        //make the graph:
        const graphOptions = {
            domain: this.domain,
            f: this.f,
            radius: this.radius,
            color: this.color,
            res: this.res,
        }
        this.graph = new Graph2D( graphOptions );


        const boardOptions = {
            xRange: this.domain,
            yRange: this.range,
            radius: this.radius,
        }
        this.blackboard = new BlackBoard( boardOptions );

    }

    addToScene( scene ){
        this.graph.addToScene( scene);
        this.blackboard.addToScene(scene);
    }

    setVisibility(value){
        this.graph.setVisibility(value);
        this.blackboard.setVisibility(value);
    }

    setDomain( newDomain ){
        this.graph.setDomain(this.domain);
        this.range = getRange(this.f,this.domain);
        this.blackboard.resize(this.domain,this.range);
    }

    setFunction( newFunction ){
        this.f=newFunction;
        this.graph.update();
        this.range = getRange(this.f, this.domain);
        this.blackboard.resize(this.domain, this.range);
    }



}



export { GraphOnBoard };