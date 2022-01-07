
//parameterization = {x: 'fn', y: 'fn', z: 'fn'}
//domain = {x: [a,b], y:[c,d] }
//gaussCurvature = 'fn(u,v)';
//meanCurvature = 'fn(u,v)';



//need to be able to interpret the inputs both as js and glsl commands

class Surface {

    constructor(parameterization, domain, extras, parser ) {

        this.parser = parser;
        this.parameterization = {}
        this.domain = undefined;
        this.normal = undefined;
        this.acceleration = undefined;
        this.gaussCurvature = undefined;
        this.meanCurvature = undefined;

    }



    getPoint( uv ) {

    }

    getPosGLSL(){

    }


    getNormal( uv ) {

    }


    getNormalGLSL(){

    }


    getGaussCurvature( uv ) {

    }


    getGaussCurvatureGLSL(){

    }


    getMeanCurvature( uv ) {

    }


    getMeanCurvatureGLSL(){

    }


    getAccceleration( state ){

    }

}


//example of what we want when building a surface

const Torus = new Surface(

    {
        x: `(b+a*cos(v))*cos(u)`,
        y: `(b+a*cos(v))*sin(u)`,
        z: `a*sin(v)`,
    },
    {
        u: [0,6.3],
        v: [0,6.3],
        a: [1,2],
        b: [2,3],
    },
    {
        gaussCurvature: `cos(u)/(a*(b+a*cos(u))`,
        meanCurvature: ``,
        acceleration: ``,
    },
);


export { Surface }
