
let globalParams={
    name:'ParametricCurveAnimation',
    bkgColor:0xffffff,
    bkgCube:true,
};

let params = {
    globalParams: globalParams,
    sMin:-3.14,
    sMax:3.14,
    animate:true,
    xEqn: "cos(s)",
    yEqn: "s",
    zEqn: "sin(s)",
    a:0,
    b:0,
    c:0,
    homotopy: 1,
    time:0,
}


export default params;