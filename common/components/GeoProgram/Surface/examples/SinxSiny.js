
import Surface from "../Surface.js";


class SinxSiny extends Surface {
    constructor(domain) {
        super(domain);
    }



    setParamData(){
        this.settingsAndParams = {
            a: 0.4,
            b: 4,
        };

        this.paramData = {
            a: {
                min: 0,
                max: 2,
                step: 0.01,
                name: 'Amplitude'
            },
            b: {
                min: 0,
                max: 6,
                step: 0.01,
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


export default SinxSiny;