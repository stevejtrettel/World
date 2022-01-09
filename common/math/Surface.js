
//equation = {x: 'fn', y: 'fn', z: 'fn'}
//domain = {x: [a,b], y:[c,d] }
//gaussCurvature = 'fn(u,v)';
//meanCurvature = 'fn(u,v)';



//need to be able to interpret the inputs both as js and glsl commands

class Surface {

    constructor(equation, domain, parameters, extras ) {

        //this.parser = parser;
        this.equation = equation;
        this.parameters = parameters;
        this.domain = domain;
        this.normal = extras.normal||null;
        this.acceleration = extras.acceleration||null;
        this.gaussCurvature = extras.gaussCurvature||'0.';
        this.meanCurvature = extras.meanCurvature||'0.';

    }



    getPoint( uv ) {
        //use parser to evaluate the point
    }

    displaceGLSL(){

        //make the domain part:
        const uRng = this.domain.u[1]-this.domain.u[0];
        const vRng = this.domain.v[1]-this.domain.v[0];

        const displace = `
        vec3 displace( vec2 uv ){
            float u = float(${uRng})*uv.x + float(${this.domain.u[0]});
            float v = float(${vRng})*uv.y + float(${this.domain.v[0]});
            
            float x = ${this.equation.x};
            float y = ${this.equation.y};
            float z = ${this.equation.z};
            
            return vec3(x,y,z);
           }
           `;

        return displace;

    }

    getGaussCurvature( uv ) {
        //use parser to evaluate
    }


    gaussCurvatureGLSL() {
        //make the domain part:
        const uRng = this.domain.u[1] - this.domain.u[0];
        const vRng = this.domain.v[1] - this.domain.v[0];

        const curvature = `
        float gaussCurvature( vec2 uv ){
            float u = float(${uRng})*uv.x + float(${this.domain.u[0]});
            float v = float(${vRng})*uv.y + float(${this.domain.v[0]});
            
            return ${this.gaussCurvature};
        }
        `;

        return curvature;
    }

    getMeanCurvature( uv ) {
        //use parser to evaluate
    }


    meanCurvatureGLSL(){
        //make the domain part:
        const uRng = this.domain.u[1] - this.domain.u[0];
        const vRng = this.domain.v[1] - this.domain.v[0];

        const curvature = `
        float meanCurvature( vec2 uv ){
            float u = float(${uRng})*uv.x + float(${this.domain.u[0]});
            float v = float(${vRng})*uv.y + float(${this.domain.v[0]});
            
            return ${this.meanCurvature};
        }
        `;

        return curvature;

    }


    getAccceleration( state ){
        //use parser to get the acceleration
    }

}



export { Surface }
