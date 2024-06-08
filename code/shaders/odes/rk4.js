
const rk4_vec3 = `

//run rk4 for a vector field
//REQUIRES A FUNCTION VFIELD(POS)

vec3 nudge(vec3 pos, vec3 dir, float amt){
    return pos+amt*dir;
}

vec3 rk4(vec3 pos, float dt){

        vec3 k1,k2,k3,k4;
        vec3 temp, shift;

        k1 = vecField(pos);
        k1 *= dt;

        //move the point a little
        temp = nudge(pos, k1, 0.5);
        k2 = vecField(temp);
        k2 *= dt;

        //get k3
        temp = nudge(pos, k2, 0.5);
        k3 = vecField(temp);
        k3 *= dt;

        //get k4
        temp = nudge(pos, k3, 1.);
        k4 = vecField(temp);
        k4 *= dt;

        //add up results:
        shift = k1 + 2.*k2 + 2.*k3 + k4;
        shift /= 6.;

        //move the initial position forward
        return pos + shift;

}
`;




const rk4_vec4 = `

//run rk4 for a vector field
//REQUIRES A FUNCTION VFIELD(POS)

vec4 nudge(vec4 pos, vec4 dir, float amt){
    return pos+amt*dir;
}

vec4 rk4(vec4 pos, float dt){

        vec4 k1,k2,k3,k4;
        vec4 temp, shift;

        k1 = vecField(pos);
        k1 *= dt;

        //move the point a little
        temp = nudge(pos, k1, 0.5);
        k2 = vecField(temp);
        k2 *= dt;

        //get k3
        temp = nudge(pos, k2, 0.5);
        k3 = vecField(temp);
        k3 *= dt;

        //get k4
        temp = nudge(pos, k3, 1.);
        k4 = vecField(temp);
        k4 *= dt;

        //add up results:
        shift = k1 + 2.*k2 + 2.*k3 + k4;
        shift /= 6.;

        //move the initial position forward
        return pos + shift;

}
`;







export { rk4_vec3, rk4_vec4 };
