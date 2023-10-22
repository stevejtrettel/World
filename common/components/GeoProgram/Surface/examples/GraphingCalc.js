
import Surface from "../Surface.js";

//using GLOBAL object math.parser: this is from the 3rd party math file loaded in the html
const parser = math.parser();



class GraphingCalc extends Surface {
    constructor(domain) {
        super(domain);

    }

    setParamData(){
        this.params = {
            a: 1,
            b: 1,
            c: 1,
            func: `a*exp(-b*u^2-c*v^2)`
        };

        this.paramData = {
            a: {
                min: 0,
                max: 5,
                step: 0.01,
                name: 'a'
            },
            b: {
                min: 0,
                max: 5,
                step: 0.01,
                name: 'b'
            },
            c: {
                min: 0,
                max: 5,
                step: 0.01,
                name: 'c'
            }
        };



    }

    setFunctionData() {
        super.setFunctionData();

        let a = this.params.a;
        let b = this.params.b;
        let c = this.params.c;

        this.name = 'GraphingCalc';
        this.Ftxt = this.params.func;

        let func = parser.evaluate('f(u,v,a,b,c)='.concat(this.Ftxt));
        //the function with all the variables:
        this.F = function(u,v){
            let z = func(u,v, a,b,c);
            return z;
        }
    }


    buildUIFolder(ui, resetScene) {
        super.buildUIFolder(ui, resetScene);

        let surf = this;
        let a = this.params.a;
        let b = this.params.b;
        let c = this.params.c;
        //now add in a text box for the function
       ui.add(surf.params,'func').name(`f(u,v)=`).onFinishChange(
            function(value){
                surf.Ftxt=value;
                let func = parser.evaluate('f(u,v,a,b,c)='.concat(surf.Ftxt));
                surf.F = function(u,v){
                    let z = func(u,v, a,b,c);
                    return z;
                }
                surf.update({});
                resetScene();
            });
     }
 }


export default GraphingCalc;