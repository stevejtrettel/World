


let settings = {

        ui:{
                eqns:true,
                domain:true,
                params:true,
                slice:true,
                discardOption:true,
        },

        scene:{
                slice:true,
        },

        config:{
                functionGraph:false,
                landscapeColor:false,
        }
}


let params =  {
        animate: false,
        mobius:false,
        slice: 1.5,
        discardTop:true,
        xEqn: "1.5*(2.+cos(v))*cos(u)",
        yEqn: "1.5*(2.+cos(v))*sin(u)",
        zEqn: "1.5*sin(v)",
        uMin:0.,
        uMax:6.29,
        vMin:-3.14,
        vMax:3.14,
        sliceMin:-5,
        sliceMax:5.,
        sliceWidth:0.01,
        a:0,
        //b:0,
        //c:0,
}


export {settings, params};

