

let itemParams = {
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



let globalParams={
    name:'World',

    environment:{
        color: 0xffffff,
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