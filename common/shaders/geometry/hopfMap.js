

const hopfMapTools = `
vec3 sphCoords(vec2 p){
    float phi=p.x;
    float theta=p.y;

    float x=cos(theta)*sin(phi);
    float y=sin(theta)*sin(phi);
    float z=cos(phi);

    return vec3(x,y,z);
}


vec4 hopfLift(vec3 p){
    //a lift of the curve on the 2 sphere to S3
    //such that the lift lives in the S2 det'd by i-comp=0.
    float x=p.x;
    float y=p.y;
    float z=p.z;

    //this has problems when x=-1 but only there
    float a=sqrt((z+1.)/2.);

    float c=y/(2.*a);
    float d=x/(2.*a);

    return vec4(a,0,c,d);
}



vec4 hopfFiber(vec4 q, float s){
    //gives a parameterization, in terms of s, of the hopf fiber passing thru p
    //this is the curve of quaterions e^(is)*p

    //i*p
    vec4 r=vec4(q.y,-q.x,-q.w,q.z);

    return cos(s)*q+sin(s)*r;
}
`;






const hopfSurface =
`
//TO USE HOPF SURFACE, WE NEED TO IMPLEMENT A FUNCTION "SPHERECURVE"
    vec4 hopfSurface(float t, float s){
    //t is on curve, s is fiber

    //get coordinates along curve
    vec2 coords=sphereCurve(t);

    //get point on S2
    vec3 p=sphCoords(coords);

    //lift to S2 in S3:
    vec4 q=hopfLift(p);

    //get point along fiber:
    vec4 r=hopfFiber(q,s);

    return r;
}
`;


export { hopfMapTools, hopfSurface };
