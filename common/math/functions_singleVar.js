
//get the range of a function, given its domain
function getRange(f, domain){
    let pts = [];
    let res=100;
    const spread = domain.max-domain.min;

    let x;
    for(let i=0;i<res;i++){
        x=domain.min+i/res*spread;
        pts.push(f(x));
    }

    const yMin = Math.min(...pts);
    const yMax = Math.max(...pts);

    return {
        min: yMin,
        max: yMax,
    };
}

//get the derivative of a function numerically
function differentiate(f){
    return function(x){
        const h = 0.001;
        const dy = f(x+h/2)-f(x-h/2);
        return dy/h;
    }
}


function setX(percent, domain){
    let spread = domain.max-domain.min;
    let x = domain.min + percent * spread;
    return x;
}



export{
    getRange,
    differentiate,
    setX,
};