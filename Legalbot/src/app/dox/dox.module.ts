import { NgModule, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Document, Packer, PageBreak, Paragraph, Table, TableCell, TableRow, TextRun, convertMillimetersToTwip } from 'docx';
import { doc } from './document';

@NgModule({
  declarations: [],
  imports: [CommonModule],
})

export class DoxModule {
  paras: (Paragraph|Table|PageBreak)[];
  document!: Document;
  constructor() {
    this.paras = [];
  }
  /**
   * alignment:  "start" | "center" | "end" | "both" | "mediumKashida" | "distribute" | "numTab" | "highKashida" | "lowKashida" | "thaiDistribute" | "left" | "right" | undefined
   * style: 'content' | 'bold'
   * para: any text string
  */
  addPara(para: string, style: string,alignment: "start" | "center" | "end" | "both" | "mediumKashida" | "distribute" | "numTab" | "highKashida" | "lowKashida" | "thaiDistribute" | "left" | "right" | undefined) {
    this.paras.push(
      new Paragraph({
        text: para,
        style: style,
        alignment:alignment
      })
    );
  }
  /**
   * head: heading string
   * para: Paragraph
   */
  addHeadedPara(head:string,para:string ){
    this.paras.push(
      new Paragraph({
          children:[
              new TextRun({text:head,bold:true,underline:{type:"single"}}),
              new TextRun({text:para,bold:false})
          ]
      })
  )

  }

  /**
   * level: 'num'|'alphalist'|'roman'
   * para: any text string
  */

  addNumberedPara(para: string, ref: 'num'|'alphalist'|'roman') {
    this.paras.push(
      new Paragraph({
        text: para,
        style: 'content',
        numbering:{
          reference:ref,
          level:0
        }
      })
    );
  }
  addTable(rows:string[][]){
    const trows: TableRow[]=[];
    for (let i = 0; i < rows.length; i++) {
      const cells:TableCell[]=[]
      for (let j = 0; j < rows[i].length; j++){
        cells.push(new TableCell({children:[new Paragraph({text:rows[i][j]})]}))
      }
      trows.push(new TableRow({children:cells}))
    }
    this.paras.push(new Table({rows:trows,width:{size:8505},columnWidths:[505,4000,4000],}))
  }
  addPageBreak(){
    this.paras.push(new Paragraph({children:[new PageBreak()]}))
  }
}
