import {
    BufferGeometry,
    Float32BufferAttribute,
} from "../../../3party/three/build/three.module.js";


//for ComputeMaterials, or other cases where we need PlaneGeometry
//but require the vertices to lie in (0,1)x(0,1) and not (-w/2,w/2)x(-h/2,h/2)
class UnitSquare extends BufferGeometry {

    constructor( widthSegments = 1, heightSegments = 1 ) {

        super();
        this.type = 'PlaneGeometry';

        this.parameters = {
            width: 1,
            height: 1,
            widthSegments: widthSegments,
            heightSegments: heightSegments
        };

        const width_half = 1 / 2;
        const height_half = 1 / 2;

        const gridX = Math.floor( widthSegments );
        const gridY = Math.floor( heightSegments );

        const gridX1 = gridX + 1;
        const gridY1 = gridY + 1;

        const segment_width = 1 / gridX;
        const segment_height = 1 / gridY;

        //

        const indices = [];
        const vertices = [];
        const normals = [];
        const uvs = [];

        for ( let iy = 0; iy < gridY1; iy ++ ) {

            const y = iy * segment_height;

            for ( let ix = 0; ix < gridX1; ix ++ ) {

                const x = ix * segment_width;

                //i do not know the need for the 1-y here and in the uv...
                //orig was just -y but my new surface is not symmetric around origin
                //and instead goes from 0 to 1...
                vertices.push( x, 1.-y, 0 );

                normals.push( 0, 0, 1 );

                uvs.push( ix / gridX );
                uvs.push( 1. - ( iy / gridY ) );

            }

        }

        for ( let iy = 0; iy < gridY; iy ++ ) {

            for ( let ix = 0; ix < gridX; ix ++ ) {

                const a = ix + gridX1 * iy;
                const b = ix + gridX1 * ( iy + 1 );
                const c = ( ix + 1 ) + gridX1 * ( iy + 1 );
                const d = ( ix + 1 ) + gridX1 * iy;

                indices.push( a, b, d );
                indices.push( b, c, d );

            }

        }

        this.setIndex( indices );
        this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
        this.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
        this.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );

    }
}

export { UnitSquare };
