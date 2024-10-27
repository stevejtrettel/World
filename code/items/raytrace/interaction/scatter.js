
import TVec from "../TVec.js";


function reflectIn(incident,normal){

    let proj = incident.dir.dot(normal.dir);
    let dir = incident.dir.clone().sub(normal.dir.clone().multiplyScalar(2. * proj));

    return new TVec(incident.pos,dir);

}

function refractIn(incident, normal, n){
    //n is the ior ratio current/entering:

    let cosX = -normal.dot(incident);
    let sinT2 = n*n*(1-cosX*cosX);

    if(sinT2>1.){//TIR
        return reflectIn(incident,normal);
    }

    let cosT= Math.sqrt(Math.abs(1.0 - sinT2));
    let v1 = incident.dir.clone().multiplyScalar(n);
    let v2 = normal.dir.clone().multiplyScalar(n*cosX - cosT);
    let dir = v1.add(v2);

    return new TVec(incident.pos,dir);
}




function mix(vec1, vec2, t){
    //convex combo of the TVecs if t=0 gives first vec
    let v1 = vec1.clone().multiplyScalar(1-t);
    let v2 = vec2.clone().multiplyScalar(t);
    let newVec = v1.add(v2);
    return newVec;
}

function FresnelReflectAmount(n, normal, incident, f0, f90)
{
    //n=ratio of indices of refraction, current/entering

    // Schlick aproximation
    let r0 = (n-1.)/(n+1.);
    r0 *= r0;
    let cosX = - normal.dot(incident);
    if (n>1.)
    {
        let sinT2 = n*n*(1.0-cosX*cosX);
        // Total internal reflection
        if (sinT2 > 1.0){
            return f90;
        }
        cosX = Math.sqrt(1.0-sinT2);
    }
    let x = 1.0-cosX;
    let ret = Math.max(0,r0+(1.0-r0)*x*x*x*x*x);
    ret = Math.min(ret,1);

    // adjust reflect multiplier for object reflectivity
    //return mix(f0, f90, ret);
    return  f0 + (f90-f0)*ret;
}


//boolean for if we totally internally reflect
function TIR(n,incident,normal){
    //n=ratio of current/enterting
    //n is normal pointed *at* incident*
    let cosX = -normal.dot(incident);
    let sinT2 = n * n * (1 - cosX * cosX);
    return (sinT2 > 1.)
}



function bisect(tv,dt,obj){
    let dist = 0.;
    let testDist = dt;
    let temp = new TVec();

    for(let i=0; i<10; i++){
        testDist = testDist/2.;
        //test flow by this:
        temp = tv.clone();
        temp.flow(dist+testDist);
        //if you are still inside, add the dist
        if(obj.inside(temp.pos)){
            dist += testDist;
        }
        //if not, dont! divide in half and try again
    }
    return dist;
}



export {reflectIn, refractIn, mix, FresnelReflectAmount, TIR,bisect};
