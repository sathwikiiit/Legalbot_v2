
export class Suit {
    id:number=0;
    user!: string;
    plaintiff1:string='';
    plaintiffs:string='';
    defendant1:string='';
    defendants:string='';
    court:string='';
    city:string='';
    property:property[]=[];
    suitType:string='';
    date: any|undefined;
    json(){
        return JSON.stringify(this)
    }
    plaintiffsArray(){
        return this.plaintiffs.split("\n")
    }
    defendantsArray(){
        return this.defendants.split("\n")
    }
}

export class property{
    type!: string
    value!:string
    perAc:string | undefined
    perSqYards:string|undefined
    extent!:string
    syn:string|undefined
    hn:string|undefined
    plotNo:string|undefined
}


