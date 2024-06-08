
//require some implementation of the associated Legendre polynomials:
import {legendreClenshaw, legendreClenshawAlt, legendreRecursive} from "./legendre.js";


// Y_l_m(s), where l is the band and m the range in [-l..l]
let sphericalHarmonic = legendreClenshaw + `
// spherical harmonics function
vec2 sphericalHarmonic(int l, int m, vec3 pos){

    //compute theta and phi:
    pos = normalize(pos);
    float cosPhi = pos.y;
    float theta = atan(-pos.z,pos.x);
    
    //the collection "legendreRecursive" has implemented factorials and everything we need below:
    //this is just directly implementing wikipedia's formula:
    //https://en.wikipedia.org/wiki/Associated_Legendre_polynomials
    float legPoly = legendre(l, m, cosPhi);
    float phase = float(m)*theta;
    
    float modulus = legPoly;
    vec2 argument = vec2(cos(phase),sin(phase));
   
    return modulus*argument;
}
`;


//real spherical harmonic
// Y_l_m(s), where l is the band and m the range in [-l..l]
let sphericalHarmonic2 = legendreClenshaw + `
vec2 sphericalHarmonic( in int l, in int m, in vec3 s )
{
    vec3 ns = normalize(s);

    //if m is negative: give the "counterpart" to m's harmonic:

    if (m < 0) {
        float c = ns.x;
        ns.x = ns.z;
        ns.z = c;
        m = -m;
    }

    // spherical coordinates
    float cosphi = ns.y;
    float theta = atan(ns.z, ns.x)+PI/2.;

    //the LATITUDE COMPONENT
    //the associated legendre polynomial with invariants l,m
    float phiDependence = legendre(l, m, cosphi);


    //THE LONGITUDE COMPONENT
    float M = float(m);
    vec2 argument = vec2(cos(M * theta), sin(M*theta));


    //deal with the sign when m is even
     float sign = 1.;
    if( mod(float(m),2.) < 1. ){
         sign = -1.;
     }

    vec2 res = sign * phiDependence * argument;

    return res;
}`;

export default sphericalHarmonic;