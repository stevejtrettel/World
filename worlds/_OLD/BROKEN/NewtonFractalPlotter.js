import NewtonFractal from "../../../code/items/geometry/NewtonFractal2.js";

let defaultFn = 'cmult(z-vec2(1,0),z-vec2(0,1),z-vec2(1,1))';

let defaultRange = {
    x:{ min:-10,max:10},
    y:{min:-10,max:10},
};


class NewtonFractalPlotter {
    constructor( fnText=defaultFn, range=defaultRange ){

        //the range in x,y of the plot {x:{min:,max:},y:{min:max:}}
        this.range = range;

        //things that are editable by the UI
        this.params = {
            a:1,
            b:1,
            c:1,
            t:0,
            fnText: fnText,
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

        //make newton Fractal
        this.fractal = new NewtonFractal( fnText, this.uniforms, this.uniformsString, range );
    }

    addToScene(scene){
        this.fractal.addToScene(scene);
    }

    addToUI(ui){

        let thisObj = this;

        ui.add(this.params,'fnText').name('f=').onFinishChange(
            function(value){
                thisObj.params.t=0.;
                thisObj.fractal.setFunction(value);
            }
        );

        let paramFolder =ui.addFolder('Parameters');

        paramFolder.add(this.params, 'a', -2, 2, 0.01).name('a').onChange(function(value){
            thisObj.fractal.uniforms['a'].value=value;
        });
        paramFolder.add(this.params, 'b', -2, 2, 0.01).name('b').onChange(function(value){
            thisObj.fractal.uniforms['b'].value=value;
        });
        paramFolder.add(this.params, 'c', -2, 2, 0.01).name('c').onChange(function(value){
            thisObj.fractal.uniforms['c'].value=value;
        });

    }

    tick(time,dTime){
        this.params.t=time;
        this.fractal.uniforms.t.value=time;
        this.fractal.update();
    }

}



export default NewtonFractalPlotter;
