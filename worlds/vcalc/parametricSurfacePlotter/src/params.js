const params = {
    range: {
        u:{min:0, max:6.29},
        v:{min:0, max:6.29}
    },
    xEqn: "(1.25 *(1.-v/(2.*3.14159))*cos(2.*v)*(1.+cos(u))+cos(2.*v))",
    yEqn: "(10.*v/(2.*3.14159)+(1.-v/(2.*3.14159))*sin(u))-5.",
    zEqn: "-(1.25 *(1.-v/(2.*3.14159))*sin(2.*v)*(1.+cos(u))+sin(2.*v))",
    animate:false,
    a:0,
    b:0,
    c:0
};

export default params;
