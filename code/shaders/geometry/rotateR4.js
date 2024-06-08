

const rotateR4 = `
vec4 rotateR4( vec4 p, float x, float y, float u ){

    float cS=cos(y);
    float sS=sin(y);
    float cT=cos(x);
    float sT=sin(x);
    float cU=cos(u);
    float sU=sin(u);


    mat4 rotMatY=mat4(
    cS,0,-sS,0,
    0,cS,0,-sS,
    sS,0,cS,0,
    0,sS,0,cS
    );


    mat4 rotMatX=mat4(
    cT,0,0,-sT,
    0,cT,-sT,0,
    0,sT,cT,0,
    sT,0,0,cT
    );


    mat4 rotMatU=mat4(
    cU,-sU,0,0,
    sU,cU,0,0,
    0,0,cU,-sU,
    0,0,sU,cU
    );

    vec4 q=rotMatU*rotMatY*rotMatX*p;

    return q;
}
`;

export { rotateR4 };
