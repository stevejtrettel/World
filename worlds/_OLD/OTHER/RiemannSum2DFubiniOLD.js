import {
    BoxBufferGeometry,
    DoubleSide,
    MeshPhysicalMaterial,
    Mesh, Color,
} from "../../../3party/three/build/three.module.js";


import RiemannSum2D from "../../../code/items/vector-calculus/RiemannSum2D.js";

import {
    IteratedIntegralX,
    IteratedIntegralY,
} from "../../../code/items/vector-calculus/IteratedIntegral.js";

import {posNegColor } from "../../../code/utils/colors.js";


//using GLOBAL object math.parser: this is from the 3rd party math file loaded in the html
const parser = math.parser();




class TotalVolume{
    constructor(range,thickness){
        this.range=range;
        this.thickness=thickness;

        //total area inside the entire region:
        let mat = new MeshPhysicalMaterial({
            side:DoubleSide,
        });
        let geom = new BoxBufferGeometry(1,1,1);

        this.block = new Mesh(geom,mat);

    }

    addToScene(scene){
        scene.add(this.block);
    }

    setRange(range){
        this.range=range;
    }
    setThickness(thickness){
        this.thickness=thickness;
    }

    update(height){

        //update position based on range, and height based on the new integral's value
        this.block.position.set(2*this.range.x.max,height/2,-2*this.range.y.max);
        this.block.scale.set(this.thickness,Math.abs(height),this.thickness);
        this.block.material.color=posNegColor(height);
    }

}



let defaultSetup = {
    fnText: 'x/5+sin(y*x/5)+sin(x*y/5+t)',
    range: {x:{ min:-10,max:10},
        y:{ min:-10,max:10}},
    res: {x:20,y:20},
    thickness:4,
};

class RiemannSum2DFubini {
    constructor(setup=defaultSetup){

        this.thickness = setup.thickness;

        this.params = {
            xMin: setup.range.x.min,
            xMax: setup.range.x.max,

            yMin: setup.range.y.min,
            yMax: setup.range.y.max,

             numBars: setup.res.x*setup.res.y,
             xRes:setup.res.x,
             yRes:setup.res.y,

            a:1,
            b:1,
            c:1,

            time:0,

            functionText: setup.fnText,

            // reset: function(){
            //     console.log('reset');
            // }
        };

        //define the function which gives our curve:
        let func = parser.evaluate('f(x,y,t,a,b,c)='.concat(this.params.functionText));

        //the function with all the variables:
        this.f = function(coords, params={time:0,a:0,b:0,c:0}){
            let z = func(coords.x, coords.y, params.time, params.a, params.b, params.c);
            return z;
        }

        let matProps = {
            side:DoubleSide,
           // transparent:true,
           // opacity:0.2,
        }


        this.riemannSum = new RiemannSum2D(this.f, setup.range, setup.res, matProps );

        this.xIntegral = new IteratedIntegralX(this.f, setup.range, setup.res, this.thickness);
        this.yIntegral = new IteratedIntegralY(this.f, setup.range, setup.res, this.thickness);

        this.totalIntegral = new TotalVolume(setup.range,setup.thickness);


    }




    addToScene(scene){
        this.riemannSum.addToScene(scene);
        this.xIntegral.addToScene(scene);
        this.yIntegral.addToScene(scene);
        this.totalIntegral.addToScene(scene);
    }

    addToUI(ui){

        //for some reason cant call"this" inside the ui functions
        let thisObj = this;

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

        ui.add(this.params,'numBars', 4, 10000, 1).name('Bars').onChange(function(value){
            let xBars = Math.ceil(Math.sqrt(value));
            let yBars = xBars;//square right now
            thisObj.riemannSum.setRes({x:xBars, y:yBars});
            thisObj.xIntegral.setRes({x:xBars,y:yBars});
            thisObj.yIntegral.setRes({x:xBars,y:yBars});
        });

        // ui.add(this.params,'yRes', 1,200,1).name('BarsY').onChange(function(value){
        //     thisBarGraph.setRes({x:thisObj.params.xRes, y:value});
        // });


        ui.add(this.params,'functionText').name('z=').onFinishChange(
            function(value){
                thisObj.params.functionText=value;
                let curve = parser.evaluate('f(x,y,t,a,b,c)='.concat(thisObj.params.functionText));
                let eqn = function(coords ,params={time:0,a:0,b:0,c:0}){
                    let z = curve(coords.x, coords.y, params.time, params.a, params.b, params.c);
                    return z;
                }

                thisObj.params.time=0;
                thisObj.f = eqn;
                thisObj.riemannSum.setFunction(eqn);
                thisObj.xIntegral.setF(eqn);
                thisObj.yIntegral.setF(eqn);
            }
        );

        // ui.add(this.params, 'reset').onChange(
        //     function(){
        //
        //         let curve = parser.evaluate('f(x,y,t,a,b,c)='.concat(thisObj.params.functionText));
        //         let eqn = function(coords ,params={time:0,a:0,b:0,c:0}){
        //             let z = curve(coords.x, coords.y, params.time, params.a, params.b, params.c);
        //             return z;
        //         }
        //
        //         thisObj.params.time=0;
        //         thisObj.f = eqn;
        //         thisObj.riemannSum.setFunction(eqn);
        //         thisObj.xIntegral.setF(eqn);
        //         thisObj.yIntegral.setF(eqn);
        //     }
        // );


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
        this.xIntegral.update(this.params);
        this.yIntegral.update(this.params);
        this.totalIntegral.update(this.xIntegral.value/this.thickness);
    }
}



export default RiemannSum2DFubini;
