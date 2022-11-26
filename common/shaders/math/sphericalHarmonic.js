
//require some implementation of the associated Legendre polynomials:
import legendre from "./legendre.js";

//real spherical harmonic
// Y_l_m(s), where l is the band and m the range in [-l..l]
let sphericalHarmonic = legendre + `
float sphericalHarmonic( in int l, in int m, in vec3 s )
{
    vec3 ns = normalize(s);

    if (m < 0) {
        float c = ns.x;
        ns.x = ns.z;
        ns.z = c;
        m = -m;
    }

    // spherical coordinates
    float cosphi = ns.y;
    float theta = atan(ns.z, ns.x)+PI/2.;

    float asscLegendre = legendre(l, m, cosphi);
    
    float sign = 1.;
    if( mod(float(m),2.) < 1. ){
         sign = -1.;
     }

    float r = sign * cos(float(m) * theta) * asscLegendre;

    return r;
}`;

export default sphericalHarmonic;