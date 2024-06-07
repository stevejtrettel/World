import Surface from "../_Components/Surface.js";



class Ripples extends Surface {
    constructor(domain) {
        super(domain);
    }

    setParamData(){
        this.settingsAndParams = {
            a: 0.75,
            b: 2,
            c: 0
        };

        this.paramData = {
            a: {
                min: 0,
                max: 0.75,
                step: 0.001,
                name: 'Amplitude'
            },
            b: {
                min: 0,
                max: 4,
                step: 0.001,
                name: 'Frequency'
            },
            c: {
                min: -3,
                max: 3,
                step: 0.01,
                name: 'Position'
            }
        };
    }

    setFunctionData() {
        super.setFunctionData();

        let a = this.params.a;
        let b = this.params.b;
        let c = this.params.c;

        this.F = function (u, v) {
            let r = Math.sqrt(u*u+(v-c)*(v-c));
            return  a*Math.cos(b*r*r/3.)*(0.15+1.5/(1+r*r));
        }

        this.name ='CosR';
        this.Ftxt = `f(u,v)=${a}*cos(${b}*(u^2+(v-c)^2)/3.)*(0.15+1.5/(1+u^2-(v-c)^2)`;
    }
}


export default Ripples;