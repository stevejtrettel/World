import RiemannSum2D from "../components/VectorCalculus/RiemannSum2D.js";

//using GLOBAL object math.parser: this is from the 3rd party math file loaded in the html
const parser = math.parser();



class RiemannSum2DPlotter{
    constructor(range,res){

        this.params = {
            xMin: range.x.min,
            xMax: range.x.max,

            yMin: range.y.min,
            yMax: range.y.max,

            xRes:res.x,
            yRes:res.y,

            a:1,
            b:1,
            c:1,

            time:0,

            functionText: 'x/5+sin(y*x/5)',

            showCurve:true,

            reset: function(){
                console.log('reset');
            }
        };

        //define the function which gives our curve:
        let func = parser.evaluate('f(x,y,t,a,b,c)='.concat(this.params.functionText));

        //the function with all the variables:
        this.f = function(coords, params={time:0,a:0,b:0,c:0}){
            let z = func(coords.x, coords.y, params.time, params.a, params.b, params.c);
            return z;
        }

        this.riemannSum = new RiemannSum2D(this.f, range, res);
    }

    addToScene(scene){
        this.riemannSum.addToScene(scene);
    }

    addToUI(ui){

        let thisObj = this;
        let thisBarGraph = this.riemannSum;

        // let domainFolder =ui.addFolder('Domain');
        //
        // domainFolder.add(this.params, 'xMin', -10, 10, 0.01).name('xMin').onChange(function(value){
        //     let rng = {min:value,max:thisBarGraph.range.max};
        //     thisBarGraph.setRange(rng);
        //
        // });
        //
        // domainFolder.add(this.params, 'xMax', -10, 10, 0.01).name('xMax').onChange(function(value){
        //     let rng = {min: thisBarGraph.range.min, max: value};
        //     thisBarGraph.setRange(rng);
        // });

        ui.add(this.params,'xRes', 1,200,1).name('BarsX').onChange(function(value){
            thisBarGraph.setRes({x:value, y:thisObj.params.yRes});
        });

        ui.add(this.params,'yRes', 1,200,1).name('BarsY').onChange(function(value){
            thisBarGraph.setRes({x:thisObj.params.xRes, y:value});
        });


        ui.add(this.params,'functionText').name('z=');

        ui.add(this.params, 'reset').onChange(
            function(){

                let curve = parser.evaluate('f(x,y,t,a,b,c)='.concat(thisObj.params.functionText));
                let eqn = function(coords ,params={time:0,a:0,b:0,c:0}){
                    let z = curve(coords.x, coords.y, params.time, params.a, params.b, params.c);
                    return z;
                }

                thisObj.params.time=0;
                thisObj.curve = eqn;
                thisBarGraph.setFunction(eqn);
            }
        );


        let paramFolder =ui.addFolder('Parameters');

        paramFolder.add(this.params, 'a', -2, 2, 0.01).name('a').onChange(function(value){
        });
        paramFolder.add(this.params, 'b', -2, 2, 0.01).name('b').onChange(function(value){
        });
        paramFolder.add(this.params, 'c', -2, 2, 0.01).name('c').onChange(function(value){
        });

    }

    tick(time,dTime){
        this.params.time += dTime;
        this.riemannSum.update(this.params);

    }
}







let range = {x:{ min:-10,max:10},
    y:{ min:-10,max:10}};
let res = {x:20,y:20};

let example = new RiemannSum2DPlotter(range, res);

export default {example};