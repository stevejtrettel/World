
import { Surface } from "../../../common/math/Surface.js";
import { ParametricSurface } from "../../../common/objects/ParametricSurface.js";


const torusEqn = new Surface(

    {
        x: `(b+a*cos(v))*cos(u)`,
        y: `(b+a*cos(v))*sin(u)`,
        z: `a*sin(v)`,
    },
    {
        u: [0,6.3],
        v: [0,6.3],
    },
    {
        a: {
            type: `float`,
            value: 1,
            range: [0, 2, 0.01],
        },
        b: {
            type: `float`,
            value: 2,
            range: [1, 3, 0.01],
        }
    },
    {
        gaussCurvature: `cos(v)/(a*(b+a*cos(v)))`,
        meanCurvature: `(b+2.*a*cos(v))/(a*(b+a*cos(v)))`,
        acceleration: ``,
    },
);




//make the parametric surface!
const torus = new ParametricSurface( torusEqn, 'gaussCurvature' );
torus.surface.setName(`Torus`);



export { torus };



