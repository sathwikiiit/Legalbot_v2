import { AlignmentType, Packer } from "docx";
import { DoxModule } from "./dox.module";
import { Suit } from "../suit";
import { doc } from "./document";
import { Parastyle, Proforma } from "./proforma";

export class SuitGen{
    doc: DoxModule;
    suit: Suit;
    suitSuffix: { pf: string; df: string; };
    petitionSuffix: { pf: string; df: string; };
    proforma: Proforma;
    constructor(suit:Suit=new Suit()){
        this.suit=suit;
        this.proforma=new Proforma()
        this.doc=new DoxModule();
        this.suitSuffix={
            pf:this.suit.plaintiffs.split('/n').length>1?"Plaintiffs":'Plaintiff',
            df:this.suit.defendants.split('/n').length>1?"Defendants":'Defendant',
        }
        this.petitionSuffix={
            pf:this.suit.plaintiffs.split('/n').length>1?"Petitioners":'Petitioner',
            df:this.suit.defendants.split('/n').length>1?"Respondents":'Respondent',
        }
    }
    save(elem: HTMLElement){
        const file=doc(this.doc.paras)
        Packer.toBlob(file).then((blob) => {
            const url=URL.createObjectURL(blob)
            const a=document.createElement('a')
            a.href=url
            a.download="Doc.docx"
            elem.appendChild(a)
            a.click()
        });
    }
    /**
     * type 0:suit | 1: petition
     */
    longCauseTitle(type:0|1){
        this.doc.addPara("IN THE COURT OF THE HON'BLE " + this.suit.court,Parastyle.BOLD,AlignmentType.CENTER)
        this.doc.addPara("AT " + this.suit.city,Parastyle.BOLD,AlignmentType.CENTER)
        this.doc.addPara("BETWEEN",Parastyle.BOLD,AlignmentType.LEFT)
        this.suit.plaintiffs.split('/n').forEach((val)=>{
            this.doc.addNumberedPara(val,"num")
        })
        this.doc.addPara(type==0 ?this.suitSuffix.pf:this.petitionSuffix.pf,Parastyle.NORMAL,AlignmentType.RIGHT)        
        this.suit.defendants.split('/n').forEach((val)=>{
            this.doc.addNumberedPara(val,"num")
        })
        this.doc.addPara(type==0 ?this.suitSuffix.df:this.petitionSuffix.df,Parastyle.NORMAL,AlignmentType.RIGHT)        
    }
    /**
     * type 0:suit | 1: petition
     */
    shortCauseTitle(type:0|1){
        this.doc.addPara("IN THE COURT OF THE HON'BLE " + this.suit.court,Parastyle.BOLD,AlignmentType.CENTER)
        this.doc.addPara("AT " + this.suit.city,Parastyle.BOLD,AlignmentType.CENTER)
        this.doc.addPara("BETWEEN",Parastyle.BOLD,AlignmentType.LEFT)
        this.doc.addPara(
            this.suit.plaintiff1 + (this.suit.plaintiffs.split('/n').length>1 ? (this.suit.plaintiffs.split('/n').length>2 ? " and others": " and another") : ""),
            Parastyle.NORMAL,AlignmentType.LEFT)
        this.doc.addPara(type==0 ?this.suitSuffix.pf:this.petitionSuffix.pf,Parastyle.NORMAL,AlignmentType.RIGHT)        
        this.doc.addPara(
            this.suit.defendant1 + (this.suit.defendants.split('/n').length>1 ? (this.suit.plaintiffs.split('/n').length>2 ? " and others": " and another") : ""),
            Parastyle.NORMAL,AlignmentType.LEFT)
        this.doc.addPara(type==0 ?this.suitSuffix.df:this.petitionSuffix.df,Parastyle.NORMAL,AlignmentType.RIGHT)        
        
    }
    addDate(){
        this.doc.addPara("Date:    -    -2024",Parastyle.NORMAL,AlignmentType.LEFT)
        this.doc.addPara("Place: "+ this.suit.city,Parastyle.NORMAL,AlignmentType.LEFT)
        this.doc.addPara(this.suitSuffix.pf,Parastyle.NORMAL,AlignmentType.RIGHT)
        this.doc.addPara("Counsel For "+ this.suitSuffix.pf,Parastyle.NORMAL,AlignmentType.CENTER)       
    }

    plaint(type:"SUIT FOR DECLARATION AND RECOVERY OF POSESSION"|"SUIT FOR PARTITION AND SEPERATE POSESSION"){
        this.longCauseTitle(0)
        this.doc.addPara("CLAIM: "+type,Parastyle.UNDERLINED,AlignmentType.CENTER)
        this.doc.addPara(this.proforma.plaintRule,Parastyle.UNDERLINED,AlignmentType.CENTER)
        this.doc.addPara('DESCRIPTION OF THE PARTIES',Parastyle.UNDERLINED,AlignmentType.LEFT)
        this.doc.addNumberedPara(this.proforma.descriptionOfplaintiffs,'alphalist')
        this.doc.addNumberedPara(this.proforma.descriptionOfDefendants,'alphalist')
        this.doc.addPara("BRIEF FACTS OF THE CASE ARE THAT:",Parastyle.UNDERLINED,AlignmentType.LEFT)
        this.doc.paras.push(
            
        )
        this.doc.addHeadedPara("JURISDICTION: ","")
        this.doc.addHeadedPara("COURT FEE: ","")
        this.doc.addHeadedPara("LIMITATION: ","")
        this.doc.addHeadedPara("DECLARATION",this.proforma.declaration)
        this.doc.addPara("PRAYER",Parastyle.UNDERLINED,AlignmentType.CENTER)
    }
    form8(){
        this.doc.addPara('Form No. 8',Parastyle.BOLD,AlignmentType.CENTER)
        this.doc.addPara('(Particulars of Value of Immovable Property)',Parastyle.NORMAL,AlignmentType.CENTER)
        this.doc.addPara('(R-11 and 87 of part-volume 1 C.R.P. and Co.)',Parastyle.NORMAL,AlignmentType.CENTER)
        this.shortCauseTitle(0)
        this.doc.addPara("Valuation of immovable property under section 10 of Telangana Court Fee and Suits Valuation Act",Parastyle.BOLD,AlignmentType.CENTER)
        this.doc.addTable([
            ["1","Sl. Item of Immovable Property","as mentioned above"],
            ["2","Registration District and Sub-District","a"],
            ["3","Taluk, Village where property is situated","a"],
            ["4","Survey No. Sub-Divisonal Number","a"],
            ["5","Extent","a"],
            ["6","Class if land Wet and Dry","a"],
            ["7","Rent Value of the Land","a"],
            ["8","Market Value of the Land",""],
            ["9","Value for purpose of Court Fee and Jurisdiction with the provision of law under which it is valued",""],
            ["10","Remarks",""]
        ])
        this.addDate()
    }
    docette(type:0|1,title:string){
        this.doc.addPageBreak()
        this.shortCauseTitle(type)
        this.doc.addPara(title,Parastyle.UNDERLINED,AlignmentType.CENTER)
        this.doc.addPara("Filed on: ",Parastyle.NORMAL,AlignmentType.LEFT)
        this.doc.addPara("Filed by: Counsel for " +(type==0?this.suitSuffix.pf:this.petitionSuffix.pf),Parastyle.NORMAL,AlignmentType.LEFT)
        this.doc.addPara("Address For Service",Parastyle.UNDERLINED,AlignmentType.LEFT)
    }
    notice(){
        this.suit.defendants.split('/n').forEach((val)=>{
            this.doc.addPara('NOTICE TO SHOW CAUSE',Parastyle.BOLD,AlignmentType.CENTER)
            this.shortCauseTitle(1)
            this.doc.addPara('To',Parastyle.UNDERLINED,AlignmentType.LEFT)
            this.doc.addPara(val,Parastyle.NORMAL,AlignmentType.LEFT)
            this.proforma.notice_content.forEach((cont: string)=>{this.doc.addPara(cont,Parastyle.NORMAL,AlignmentType.JUSTIFIED);this.doc.addPara('',Parastyle.NORMAL,AlignmentType.JUSTIFIED)})
            this.doc.addPageBreak()
        })
    }
    summons(){
        this.suit.defendants.split('/n').forEach((val)=>{
            this.doc.addPara('Form No. (1) Or.V, Rule: 1 or 5 of CPC',Parastyle.NORMAL,AlignmentType.CENTER)
            this.doc.addPara('SUMMONS FOR THE APPEARANCE OF THE DEFENDANT',Parastyle.BOLD,AlignmentType.CENTER)
            this.shortCauseTitle(0)
            this.doc.addPara('To',Parastyle.UNDERLINED,AlignmentType.LEFT)
            this.doc.addPara(val,Parastyle.NORMAL,AlignmentType.LEFT)
            this.proforma.notice_content.forEach((cont: string)=>{this.doc.addPara(cont,Parastyle.NORMAL,AlignmentType.JUSTIFIED);this.doc.addPara('',Parastyle.NORMAL,AlignmentType.JUSTIFIED)})
            this.doc.addPageBreak()
        })
    }
    
}