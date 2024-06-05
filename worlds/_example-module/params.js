



let itemParams = {

    uiEqns:true,
    uiDomain:true,
    uiParameters:true,
    uiPos:true,

    animate:true,

    showDomain:true,
    showPos:true,
    showAxes:true,
    showTangent:false,

    resolution:[64,64],
    functionGraph:true,

    uMin:-3.14,
    uMax:3.14,
    vMin:-3.14,
    vMax:3.14,
    uPos:0.5,
    vPos:0.5,
    xEqn: "u",
    yEqn: "sin(u)*sin(v)",
    zEqn: "v",
    a:0,
    b:0,
    c:0,
};




let globalParams={
    name:'World',

    environment:{
        color: 0xffffff,
            ///0xffffff,
        cube: true,
    },

    camera:{
        animate:false,
        fov:55,
        pos:{x:0,y:1,z:8},
        look:{x:0,y:0,z:0},
        posAnimate: (t)=>{return {x:Math.cos(t),y:Math.sin(t),z:5}},
        lookAnimate: (t)=>{return {x:0,y:Math.sin(t),z:0}},
    },

    controls:{
        minDistance:0,
        maxDistance:100,
    }

};




export {
    globalParams,
    itemParams
};