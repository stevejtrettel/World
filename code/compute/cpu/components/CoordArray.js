
//extend array (which can be filled with numbers, Vec3, etc: anything that allows use of add sub multiplyScalar and clone)


class CoordArray extends Array{
    constructor() {
        super();
    }

    add( arr ){
        for(let i=0; i<this.length; i++){
            this[i].add(arr[i]);
        }
    }

    multiplyScalar(k){
        for(let i=0; i<this.length; i++){
            this[i].multiplyScalar(k);
        }
    }

    sub(arr){
        for(let i=0; i<this.length; i++){
            this[i].add(arr[i].clone().multiplyScalar(-1));
        }
    }

    clone(){
        let res = new CoordArray();
        for(let i=0; i<this.length; i++){
            if(typeof this[i] === 'number'){
                res.push(this[i]);
            }
            else {
                res.push(this[i].clone());
            }
        }
        return res;
    }

}



export default CoordArray;
