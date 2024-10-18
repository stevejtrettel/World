
import Surface from "../Surface.js";


let gaussParams = {
    a: 1,
    b: 1,
    c: 0
};


class Gaussian extends Surface {
    constructor(domain) {
        super(domain);
    }

    setParamData(){
        this.settingsAndParams = {
            a: 1.5,
            b: 1,
            c: 0
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
            return  a*Math.exp(-b*((u-c) * (u-c) + v * v));
        }
        this.F = F;

        this.name = 'Gaussian';
        this.Ftxt = `f(u,v)=${a}*exp(-${b}*((u-${c})^2 + v^2))`;

        // this.derivatives = function (uv) {
        //     let u = uv.x;
        //     let v = uv.y;
        //     return {
        //         fu: -2 * (u-c) * b * F(u, v),
        //         fv: -2 * v * b * F(u, v),
        //         fuu: (4 * b * (u-c) * (u-c) - 2) * b * F(u, v),
        //         fvv: (4 * b * v * v - 2) * b * F(u, v),
        //         fuv: 4 * b * b * (u-c) * v * F(u, v)
        //     };
        // }

    }
}


export default Gaussian;