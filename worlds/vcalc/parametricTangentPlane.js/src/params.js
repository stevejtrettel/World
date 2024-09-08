let params = {
    animate: true,
    xEqn: "2.*sin(u)*cos(v)",
    yEqn: "2.*cos(u)",
    zEqn: "2.*sin(u)*sin(v)",
    range: {u: {min: 0, max: 3.14}, v:{min:-3.14, max:3.14}},
    showPos: true,
    tangentPlaneSize:2,
}


export default params;
