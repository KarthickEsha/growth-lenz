import { Injectable } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  pdfMake: any
  _header:any
  constructor(
      ) {
  }

  async loadPdfMaker() {
    if (!this.pdfMake) {
      const pdfMakeModule = await import('pdfmake/build/pdfmake');
      const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
      this.pdfMake = pdfMakeModule.default;
      this.pdfMake.vfs = pdfFontsModule.default.pdfMake.vfs;
    }
  }

  async generatePdf(content:any,reportTitle:any,orientation:any) {
    await this.loadPdfMaker();
    const def = this.getDocumentDefinition(content,reportTitle,orientation);
    this.pdfMake.createPdf(def).open();
  }


private getDocumentDefinition(content:any,reportTitle:any, orientation:any) {
    return {
      pageMargins: [40, 20, 40, 60],
      pageOrientation: orientation,
      info: {
        title: reportTitle,
        author: 'Professional Courier by KriyaTec',
        subject: reportTitle,
        filename: `${reportTitle}.pdf`,
        application: 'Professional Courier'
      },
      header: this._header,
      pageBreakBefore: function(currentNode:any, followingNodesOnPage:any) {
        return currentNode.headlineLevel === 1 && followingNodesOnPage.length === 0;
      },
      footer: function (currentPage: any, pageCount: any) {
        return [
          {
            margin: [40, 40],
            columns: [
              {
                text: "",
                alignment: 'left'
              },
              {
                text: 'Report generated on ' +  moment().format('DD/MM/yy hh:mm a'),
                alignment: 'center'
              },
              {
                text: 'Page ' + currentPage.toString() + ' of ' + pageCount + '  ',
                fontSize: "7",
                alignment: 'right'
              }
            ]
          }
        ]
      },
      content: content,
      styles: {
        subheader: {
          fontSize: 10,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        reportTable: {
          margin: [0, 5, 0, 15],
          alignment: 'center',
        },
        tableHeader: {
          bold: true,
          fontSize: 9,
          color: 'black',
          height: 15,
          border: [false, true, false, false]
        },
        header: {
          margin: [35, 0, 35, 0]
        }
      },
      defaultStyle: {
        columnGap: 20,
        fontSize: 9
      },
      decoration: 'underline'
    }
}
}