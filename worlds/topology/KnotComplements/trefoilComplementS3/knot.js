let trefoilKnot = `vec4 knot( float t ) {
    //the knot lying on the Clifford torus
    float freq1=3.;
    float freq2=2.;
    float r1=1.;
    float r2=1.;
    vec2 uCirc=vec2(cos(freq1*t), sin(freq1*t));
    vec2 vCirc=vec2(cos(freq2*t), sin(freq2*t));

    //rescaling to lie on the rU-rV torus
    vec4 p=normalize(vec4(r1*uCirc, r2*vCirc));

    return p;
}`

let trefoilUniforms = {};

export { trefoilKnot, trefoilUniforms};