import {Vector2} from "../../../../../3party/three/build/three.module.js";

let pointGrid = function(i, row,col, domain){
    let rowPos = Math.floor(i/row);
    let colPos = i-rowPos*row;

    let deltaRow = (domain.u.max-domain.u.min)/row;
    let deltaCol = (domain.v.max-domain.v.min)/col;

    let u = domain.u.min + deltaRow*rowPos+deltaRow/2;
    let v = domain.v.min + deltaCol*colPos+deltaCol/2;

    return new Vector2(u,v);
}

export default pointGrid;


