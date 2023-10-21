
import Surface from "./Surface.js";


class SinxSiny extends Surface {
    constructor(domain) {
        super(domain);
    }



    setParamData(){
        this.params = {
            a: 1,
            b: 1,
        };

        this.paramData = {
            a: {
                min: 0,
                max: 5,
                step: 0.01,
                name: 'Amplitude'
            },
            b: {
                min: 0,
                max: 5,
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
            return  a*Math.cos(kU*u)*Math.sin(kV*v);
        }
        this.F = F;

        this.name = 'Sinusoid';
        this.Ftxt = `f(u,v)=${a}*cos(${kU}*u)*sin(${kV}*v)`;

    }
}


export default SinxSiny;