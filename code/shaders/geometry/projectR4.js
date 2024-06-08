


const projectR4 = `
vec3 orthographicProj(vec4 p){
    //JUST DELETE THE W COORDINATE
    return p.xyz;
}


vec3 stereographicProj(vec4 p){

   // if(p.w>-0.999){

        return p.xyz/(p.w+1.0);
   // }
  //  else{//delete the triangle
        //return vec3(0./0.);
   // }
}


vec4 invStereographicProj(vec3 p){
    float r2=dot(p,p);
    vec4 q = vec4(2.*p, r2-1.)/(r2+1.);
    return q;
}


vec3 stereographicProjX(vec4 p){

    if(p.x>-0.999){

        return p.yzw/(p.x+1.0);
    }
    else{//delete the triangle
        return vec3(0./0.);
    }
}


vec3 perspectiveProj(vec4 p){
    vec4 offset=vec4(0,0,0,2.);
    p=p+offset;

    return 2.*p.xyz/p.w;

}

`;


export { projectR4 };
