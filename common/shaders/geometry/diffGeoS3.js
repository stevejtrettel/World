
const diffGeoS3 = `

vec4 expMap(vec4 p, vec4 v, float r){
    //exponentiates the vector rv onto the sphere from point p
    return cos(r)*p+sin(r)*v;
}



vec4 getBinormal(vec4 pos, vec4 tang, vec4 normal){
    //compute the unit vector orthogonal to the three given unit vectors in R4
    //just like cross product in R3, find by computing the "determinant"
    // of  e1,e2,e3,e4 followed by rows pos, tang, normal

    //glsl is column major, so acutally gonna compute the transpose of this
    mat3 M1=mat3(pos.yzw, tang.yzw, normal.yzw);
    mat3 M2=mat3(pos.xzw, tang.xzw, normal.xzw);
    mat3 M3=mat3(pos.xyw, tang.xyw, normal.xyw);
    mat3 M4=mat3(pos.xyz, tang.xyz, normal.xyz);

    float c1=determinant(M1);
    float c2=determinant(M2);
    float c3=determinant(M3);
    float c4=determinant(M4);

    vec4 biNorm=vec4(c1, -c2, c3, -c4);

    //again, this is already normalized but just to be safe
    return normalize(biNorm);

}


//given 3 points along a curve, get the Frenet frame at the middle point
mat4 frenetFrameS3(vec4 pos, vec4 pos1, vec4 pos2){

    //tangent is just direction of infinitesimal separation
    vec4 tangent=normalize(pos1-pos);
    //make sure it is orthogonal to position
    tangent=normalize(tangent-dot(tangent,pos)*pos);

    //direction of curvature in R4 is the second derivative
    vec4 curve=normalize(pos2-2.*pos1+pos);
    //to get the normal vector from this, we subtract the position/tangential component
    vec4 normal=normalize(curve-dot(curve,pos)*pos-dot(curve,tangent)*tangent);

    //get binormal by solving for the vector orthogonal to the previous 3
    vec4 binormal=getBinormal(pos,tangent,normal);

    // vec4 binormal=normalize(bin-dot(bin,pos)*pos-dot(bin,tangent)*tangent-dot(bin,normal)*normal);

    mat4 frame;
    frame[0]=pos1;
    frame[1]=tangent;
    frame[2]=normal;
    frame[3]=binormal;

    return frame;
}


//given frenet frame at a point along a curve, parameterize the normal circle there:
vec4 orthogonalCircle( mat4 frame, float rad, float theta ) {

    //get the frame at this point
    vec4 position=frame[0];
    vec4 normal=frame[2];
    vec4 binormal=frame[3];

    //now that we have an orthonormal frame at each point
    //get the vector along the tube in tangent space
    vec4 tubeDir=cos(theta)*normal+sin(theta)*binormal;

    //now exponentiate this from the position
    vec4 tubePos=expMap(position,tubeDir,rad);

    //return this tube position
    return tubePos;
}
`;


export { diffGeoS3 };
