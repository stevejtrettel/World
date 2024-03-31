
import Surface from "../_Components/Surface.js";


class BumpCenter extends Surface {
    constructor(domain) {
        super(domain);
    }

    setParamData(){
        this.params = {
            a: 1.4,
            b: 0.5,
            c: 0
        };

        this.paramData = {
            a: {
                min: 0,
                max: 1.5,
                step: 0.001,
                name: 'Amplitude'
            },
            b: {
                min: 0,
                max: 3,
                step: 0.001,
                name: 'Concentration'
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

        let F = function (u, v) {
            return  a*Math.exp(-b*((u) * (u) + (v-c) * (v-c)));
        }
        this.F = F;

        this.name = 'BumpDown';
        this.Ftxt = `f(u,v)=-${a}*exp(-${b}*((u-${c})^2 + (v-${c})^2))`;

    }
}


export default BumpCenter;