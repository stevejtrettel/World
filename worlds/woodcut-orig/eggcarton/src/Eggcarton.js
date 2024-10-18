import Surface from "../../Surface.js";

class Eggcarton extends Surface {
    constructor(domain) {
        super(domain);
    }

    setParamData(){
        this.params = {
            a: 0.375,
            b: 5,
        };

        this.paramData = {
            a: {
                min: 0,
                max: 0.375,
                step: 0.0001,
                name: 'Amplitude'
            },
            b: {
                min: 0,
                max: 6,
                step: 0.0001,
                name: 'Frequency'
            },
        };
    }


    setFunctionData() {
        super.setFunctionData();

        const a = this.params.a;
        const kU = this.params.b*3.14159/this.domain.u.max;
        const kV = kU;

        let F = function (u, v) {
            return  a*(Math.sin(kU*u)+Math.sin(kV*v));
        }
        this.F = F;

        this.name = 'Sinusoid';
        this.Ftxt = `f(u,v)=${a}*(sin(${kU}*u)+sin(${kV}*v))`;

    }
}


export default Eggcarton;
