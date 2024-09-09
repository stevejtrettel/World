
import GradientField2D from "../../../code/items/vector-calculus/GradientField2D.js";
import ContourPlot2D from "../../../code/items/vector-calculus/ContourPlot2D.js";

//using GLOBAL object math.parser: this is from the 3rd party math file loaded in the html
const parser = math.parser();



const defaultSetup = {
    fn: 'u*v-sin(u-t)*v',

    range: {
        x:{ min:-10,max:10},
        y:{min:-10,max:10},
    }

};



class GradientPlotter2D {
    constructor( renderer, setup = defaultSetup ){

        this.renderer = renderer;

        //the range in x,y of the plot {x:{min:,max:},y:{min:max:}}
        this.range = setup.range;
        this.fnText = setup.fn;

        //things that are editable by the UI
        this.params = {
            res: 50,
            a:1,
            b:1,
            c:1,
            t:0,
            fnText: setup.fn,
        };

        //uniforms that are accessible in the texture shader
        this.uniforms = {
            t:{value:this.params.t},
            a:{value:this.params.a},
            b:{value:this.params.b},
            c:{value:this.params.c},
        };

        this.uniformsString = `
        uniform float t;
        uniform float a;
        uniform float b;
        uniform float c;
        `;

        let fn = parser.evaluate('fn(u,v,t,a,b,c)='.concat(this.params.fnText));
        this.scalarFn = function(pos, params){
            return fn(pos.x,pos.y,params.t,params.a,params.b,params.c);
        }

        //make the gradient vector field
        this.gradientField = new GradientField2D( this.scalarFn, this.range );

        //make the contour plot
        this.contourPlot = new ContourPlot2D(this.renderer, this.params.fnText,this.range, this.uniforms);
        this.contourPlot.setPosition(0,-0.1,0);


        //make the parametric surface:
       // this.surface = new Graph3D(this.fnText,this.range);
    }

    addToScene(scene){
        this.gradientField.addToScene(scene);
        this.contourPlot.addToScene(scene);
       // this.surface.addToScene(scene);
    }

    addToUI(ui){

        let thisObj = this;
        let thisField = this.gradientField;

        ui.add(this.params,'fnText').name('f=').onFinishChange(
            function(value){

                thisObj.params.fnText = value;
                thisObj.params.t=0.;

                let fn = parser.evaluate('fn(u,v,t,a,b,c)='.concat(value));

                let eqn = function(pos,params){
                    return fn(pos.x,pos.y,params.t,params.a,params.b,params.c);
                }

                thisObj.scalarFn = eqn;
                thisObj.gradientField.setFunction(eqn);
                thisObj.contourPlot.setFunction(value);
            }
        );

        ui.add(this.params, 'res', 10, 100, 1).name('res').onChange(function(value){
            let res ={ x: value, y:value};
            thisField.setRes(res);
        });

        let paramFolder =ui.addFolder('Parameters');

        paramFolder.add(this.params, 'a', -2, 2, 0.01).name('a').onChange(function(value){
            thisObj.contourPlot.uniforms['a'].value=value;
        });
        paramFolder.add(this.params, 'b', -2, 2, 0.01).name('b').onChange(function(value){
            thisObj.contourPlot.uniforms['b'].value=value;
        });
        paramFolder.add(this.params, 'c', -2, 2, 0.01).name('c').onChange(function(value){
            thisObj.contourPlot.uniforms['c'].value=value;
        });

    }

    tick(time,dTime){
        this.params.t=time;
        this.contourPlot.uniforms.t.value=time;
        this.gradientField.update(this.params);
        this.contourPlot.update();
    }

}



export default GradientPlotter2D;
