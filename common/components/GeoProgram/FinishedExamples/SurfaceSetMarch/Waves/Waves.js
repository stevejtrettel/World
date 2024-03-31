import Surface from "../_Components/Surface.js";


class Waves extends Surface {
    constructor(domain) {
        super(domain);
    }



    setParamData(){
        this.params = {
            a: 0.5,
            b: 1.3,
        };

        this.paramData = {
            a: {
                min: 0,
                max: 0.75,
                step: 0.0001,
                name: 'Amplitude'
            },
            b: {
                min: 0,
                max: 2,
                step: 0.0001,
                name: 'Frequency'
            },
        };
    }


    setFunctionData() {
        super.setFunctionData();

        const a = this.params.a;
        const b = this.params.b;


        let F = function (u, v) {
            return  a*(Math.sin(b*(u+v)));
        }
        this.F = F;

        this.name = 'Wave';
        this.Ftxt = `f(u,v)=${a}*(sin(${b}*(u+v)))`;

    }
}


export default Waves;