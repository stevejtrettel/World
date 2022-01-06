



//THIS CODE REQUIRES ONE ALSO INCLUDE PROJECTR4, OR IMPLEMENT ONE'S OWN INVSTEREOGRAPHICPROJ

const parameterizedKnots = `
//=============================================
//KNOTS IN R3
//=============================================



vec3 fig8R3(float t){
    float r=2.+cos(2.*t);
    vec3 p=vec3(r*cos(3.*t),r*sin(3.*t),sin(4.*t));
    return p;
}

vec3 fig8_2R3(float t){
    float x = 10.*(cos(t) + cos(3.*t)) + cos(2.*t) + cos(4.* t);
    float y = 6. * sin(t) + 10. * sin(3.* t);
    float z = 4. * sin(3.* t) * sin(5.* t / 2.) + 4. * sin(4. * t) - 2. * sin(6. * t);
    return vec3(x,y,z)/5.;
}


vec3 grannyR3(float u){
    float x = -22. * cos(u) - 128. * sin(u) - 44. * cos(3. * u) - 78. * sin(3. * u);
    float y = -10. * cos(2. * u) - 27. * sin(2. * u) + 38. * cos(4. * u) + 46. * sin(4. * u);
    float z = 70. * cos(3. * u) - 40. * sin(3. * u);
    return vec3(x,y,z)/100.;
}





//=============================================
//KNOTS IN R4
//=============================================

vec4 torusKnot( vec2 slope, float t ) {
    //the knot lying on the Clifford torus
    float freq1=slope.x;
    float freq2=slope.y;
    float r1=1.;
    float r2=1.;
    vec2 uCirc=vec2(cos(freq1*t), sin(freq1*t));
    vec2 vCirc=vec2(cos(freq2*t), sin(freq2*t));

    //rescaling to lie on the rU-rV torus
    vec4 p=normalize(vec4(r1*uCirc, r2*vCirc));

    return p;
}


vec4 trefoil( float t ) {
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
}

vec4 fig8( float t ) {
    vec3 p=fig8R3(t);
    vec4 q=invStereographicProj(p);
    return normalize(q);
}

vec4 fig8_2( float t ) {
    vec3 p=fig8_2R3(t);
    vec4 q=invStereographicProj(p);
    return normalize(q);
}

vec4 granny( float t ) {
    vec3 p=grannyR3(t);
    vec4 q=invStereographicProj(p);
    return normalize(q);
}
`;


export { parameterizedKnots };
