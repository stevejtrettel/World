

import GradientField2D from "../components/VectorCalculus/GradientField2D.js";

//using GLOBAL object math.parser: this is from the 3rd party math file loaded in the html
const parser = math.parser();


class GradientField2DPlotter{
    constructor( fnText, range ){

        this.params = {

            xMin: range.x.min,
            xMax: range.x.max,
            yMin: range.y.min,
            yMax: range.y.max,

            res: 50,

            a:1,
            b:1,
            c:1,

            time:0,

            fnText: fnText,

            reset: function(){
                console.log('reset');
            }
        };

        let fn = parser.evaluate('fn(x,y,t,a,b,c)='.concat(this.params.fnText));
        this.scalarFn = function(pos, params){
            return fn(pos.x,pos.y,params.time,params.a,params.b,params.c);
        }

        this.gradientField = new GradientField2D( this.scalarFn, range );
    }

    addToScene(scene){
        this.gradientField.addToScene(scene);
    }

    addToUI(ui){

        let thisObj = this;
        let thisField = this.gradientField;

        // let domainFolder =ui.addFolder('Domain');
        //
        //
        // domainFolder.add(this.params, 'xMin', -10, 10, 0.01).name('xMin').onChange(function(value){
        //     let rng = {
        //         x:{min:value,max:thisField.range.x.max},
        //         y:{min:thisField.range.y.min, max:thisField.range.y.max}
        //     };
        //     thisField.setRange(rng);
        // });
        //
        //
        // domainFolder.add(this.params, 'xMax', -10, 10, 0.01).name('xMax').onChange(function(value){
        //     let rng = {
        //         x:{min: thisField.range.x.min, max: value},
        //         y:{min: thisField.range.y.min, max: thisField.range.y.max}
        //     };
        //     thisField.setRange(rng);
        // });
        //
        // domainFolder.add(this.params, 'yMin', -10, 10, 0.01).name('yMin').onChange(function(value){
        //     let rng = {
        //         x:{min:thisField.range.x.min, max: thisField.range.x.max},
        //         y:{min:value, max:thisField.range.y.max}
        //     };
        //     thisField.setRange(rng);
        // });
        //
        // domainFolder.add(this.params, 'yMax', -10, 10, 0.01).name('yMin').onChange(function(value){
        //     let rng = {
        //         x:{min:thisField.range.x.min, max: thisField.range.x.max},
        //         y:{min:thisField.range.y.min, max:value }
        //     };
        //     thisField.setRange(rng);
        // });


        ui.add(this.params,'fnText').name('f=');


        ui.add(this.params, 'reset').onChange(
            function(){

                let fn = parser.evaluate('fn(x,y,t,a,b,c)='.concat(thisObj.params.fnText));


                let eqn = function(pos,params){
                    return fn(pos.x,pos.y,params.time,params.a,params.b,params.c);
                }

                thisObj.scalarFn = eqn;
                thisField.setFunction(eqn);
            }
        );

        ui.add(this.params, 'res', 10, 100, 1).name('res').onChange(function(value){
            let res ={ x: value, y:value};
            thisField.setRes(res);
        });



        let paramFolder =ui.addFolder('Parameters');

        paramFolder.add(this.params, 'a', -2, 2, 0.01).name('a').onChange(function(value){
        });
        paramFolder.add(this.params, 'b', -2, 2, 0.01).name('a').onChange(function(value){
        });
        paramFolder.add(this.params, 'c', -2, 2, 0.01).name('a').onChange(function(value){
        });



    }

    tick(time,dTime){

        this.params.time=time;
        this.gradientField.update(this.params);
    }

}




let fn = 'x^2+y^2';

let range = {
    x:{ min:-10,max:10},
    y:{min:-10,max:10},
};

let example = new GradientField2DPlotter(fn, range );

export default  { example };