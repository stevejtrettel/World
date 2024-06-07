const params = {
    showPos:true,
    animate:true,
    xEqn: "(2.+sin(v))*cos(u)",
    yEqn: "v",
    zEqn: "(2.+sin(v))*sin(u)",
    range: {
        u: {min: 0, max: 6.29 },
        v: {min:-6.75, max:3.75}
    },
}

export default params;
