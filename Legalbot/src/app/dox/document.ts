import {
  Document,
  convertInchesToTwip,
  AlignmentType,
  LevelFormat,
} from 'docx';

export function doc(paras: any[] = []) {
  return new Document({
    creator: 'Legal Bot Inc.',
    title: 'My Document',
    description: 'Document created by Legal bot',
    sections: [
      {
        children: paras,
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
            },
            size: {
              width: 11906, // in twips 1 inch = 1440 twips
              height: 16838, // 1 cm = 567 twips
            },
          },
        },
      },
    ],
    styles: {
      default: {
        document: {
          run: {
            size: 26,
            font: 'Times New Roman',
          },
          paragraph: {
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              line:260,  // 1pt = 26twips
              after:130, // linespacing 1.5 means 1 of line and after 0.5  | 1.5*260
              before:0,
            },
          },
        },
        listParagraph: {
          paragraph: {
            indent: {
              firstLine: 0,
              left: 0,
            },
          },
        },
      },
      paragraphStyles: [
        {
          id: 'bold',
          name: 'bold',
          basedOn: '',
          quickFormat: true,
          next: '',
          run:{bold:true},
        },
        {
          id: 'underline',
          name: 'underline',
          basedOn: '',
          quickFormat: true,
          next: '',
          run:{
            bold:true,
            underline:{
              type:"single"
            }
          },
        },
        {
          id: 'content',
          name: 'content',
          basedOn: '',
          quickFormat: true,
          next: '',
        },
      ],
    },
    numbering: {
      config: [
        {
          reference: 'num',
          levels: [
            {
              level: 0,
              text: '%1.',
              format: LevelFormat.DECIMAL,
              alignment: AlignmentType.START,
            },
          ],
        },
        {
          reference: 'alphalist',
          levels: [
            {
              level: 0,
              text: '%1.',
              format: LevelFormat.UPPER_LETTER,
              alignment: AlignmentType.START,
            },
          ],
        },
        {
          reference: 'roman',
          levels: [
            {
              level: 0,
              text: '%1.',
              format: LevelFormat.UPPER_ROMAN,
              alignment: AlignmentType.LEFT,
            },
          ],
        },
        {
          reference: 'para',
          levels: [
            {
              level: 0,
              text: '%1.',
              format: LevelFormat.DECIMAL,
              alignment: AlignmentType.START,
              style:{paragraph:{indent:{left:0,firstLine:0}}}
            },
          ],
        },
      ],
    },
  });
}
