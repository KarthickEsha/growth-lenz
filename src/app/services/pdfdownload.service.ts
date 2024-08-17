import { Component, Injectable } from '@angular/core';
import * as moment from 'moment';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Content } from 'pdfmake/interfaces';

@Injectable({
    providedIn: 'root'
})
export class PdfExportComponent {
    formattedDate: any
    txn_color:any
  

     formatText = (text: string | null): string => {
        return text !== null ? text : '-';
    };

    formatDate = (text: string | null): string => {
      return moment(text).format("DD-MM-YYYY, hh:mm A");
      // return text !== null ? hh : '-';
  };

    downloadPdf(datas: any, contact:any, balance:any) {

        (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

        const inputDate = new Date();
        // Format the date as dd/mm/yyyy hh:mm
        this.formattedDate = inputDate.toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

       let _id =  new Array(contact._id.length - 3).join('X') + contact._id[contact._id.length - 3]+contact._id[contact._id.length - 2]+ contact._id[contact._id.length - 1]
     
      
       if (datas.txn_type) {
        const txn_type = datas.txn_type;
        this.txn_color = txn_type === 'Cr' ? 'green' : 'red';
    }

        const content5 = [
            [
                { text: "Transaction ID", style: 'column1', fillColor: 'lightblue' },
                { text: "Transaction On", style: 'column1', fillColor: 'lightblue' },
                { text: "Transaction Amount", style: 'column1', fillColor: 'lightblue' },
                { text: "Transaction Type", style: 'column1', fillColor: 'lightblue' },
                { text: "Payment Status", style: 'column1', fillColor: 'lightblue' },
                { text: "Opening Balance", style: 'column1', fillColor: 'lightblue' },
                { text: "Closing Balance", style: 'column1', fillColor: 'lightblue' },
                { text: "Payment Mode", style: 'column1', fillColor: 'lightblue' },
                { text: "Job ID", style: 'column1', fillColor: 'lightblue' },

            ],
            ...datas.map((data:any) => [
                { text: this.formatText(data.transaction_id), style: 'column1',fontSize: 10 },
                { text: this.formatDate(data.date), style: 'column1',fontSize: 10 },
                { text: this.formatText(data.amount), style: 'column1',  alignment: 'right',fontSize: 10 },
                { text: this.formatText(data.txn_type), style: 'column1',fontSize: 10, color: data.txn_type === 'Cr' ? 'green' : 'red' },
                { text: this.formatText(data.payment_status), style: 'column1',fontSize: 10 },
                { text: this.formatText(data.opening_balance), style: 'column1', alignment: 'right',fontSize: 10 },
                { text: this.formatText(data.closing_balance), style: 'column1', alignment: 'right' ,fontSize: 10},
                { text: this.formatText(data.payment_mode), style: 'column1',fontSize: 10 },
                { text: this.formatText(data.job_id), style: 'column1',fontSize: 10 },
            ])      
        ]

        const documentDefinition: {
            content: Content[],
            pageOrientation: 'landscape',
            styles: any,
            header?: (currentPage: number, pageCount: number) => Content[]
          } = {
            pageOrientation: 'landscape',
            header: function (currentPage, pageCount) {
              return [
                { text: `${currentPage} of ${pageCount}`, alignment: 'right', margin: [0, 10, 20, 0] }
              ];
            },
            content: [
              {
                columns: [
                  { text: "", alignment: 'left', },
                  { text: "Account Statement", style: 'header' },
                  { text: `${this.formattedDate}`, style: 'dateTime' },
                ],
                style: 'headerrow'
              },
              {
                columns: [
                     { text: `User ID - ${_id}`, alignment: 'left' },
                 
                ]
              },
              {
                columns: [
                  { text: `${contact.contact.first_name} - ${contact.contact.last_name}`, alignment: 'left' }, 
                ]
              },
              {
                columns: [
                     { text: `${contact.contact.email_id}`, alignment: 'left' },            
                ]
              },
              {
                columns: [
                 { text: `${contact.contact.mobile_number}`, alignment: 'left' },
                 
                ]
              },
              {
                columns: [
                  { text: `Account Balance : ${balance}`, alignment: 'left' },
                //   { text: `: ${balance}`,  alignment: 'left' },
                ]
                
              },
            
            
             {
                style: 'tableExample',
                margin: [0, 30, 0, 0] as [number, number, number, number],
                table: {
                  widths: ['10%', '15%', '15%', '10%', '10%', '10%', '10%', '10%', '10%'],
                  body: [
                    ...content5,
                  ],
                },
                layout: {
                    fillColor: function (rowIndex, node, columnIndex) {  
                        return (rowIndex % 2 === 0) ? '#E9EAEC' : null;
                    }
                }
              }
            ],
            styles: {
              headerrow: {
                margin: [0, 0, 0, 30] as [number, number, number, number],
              },
              dateTime: {
                alignment: 'right',
                margin: [50, 0, 0, 0] as [number, number, number, number],
              },
              header: {
                fontSize: 18,
                bold: true,
                margin: [0, 0, 0, 0] as [number, number, number, number],
              },
              subheader: {
                fontSize: 14,
                bold: true,
                margin: [0, 10, 0, 5]}}}

        pdfMake.createPdf(documentDefinition).download(`Account Statement.pdf`);
    }
}

