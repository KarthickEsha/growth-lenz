import { DataService } from './data.service';
import { PdfService } from 'src/app/services/pdf.service';
import { HelperService } from 'src/app/services/helper.service';
import { Injectable } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';
import { CsvExportService } from './csvexport.service';
import { DialogService } from './dialog.service';
import * as JsBarcode from 'jsbarcode';
@Injectable({
  providedIn: 'root'
})

export class ReportService {
  selectedOrgId = localStorage.getItem('selectedOrgId');
  additionalData: any;
  config:any
  previousDataRow = {}
  previousTableRow = []
  constructor(
    private helperService : HelperService,
    private dataService : DataService,
    private pdfService : PdfService,
    private csvService: CsvExportService,
    private dialogService: DialogService
  ) {
  }

async generatePdf(reportName,data,groupBy,titles?, extra?) {
  this.dataService.loadReportConfigJson(reportName).subscribe(config=>{
    if (config == null) {
      this.dialogService.openSnackBar('Sorry! Something went wrong', 'OK');
      return
    }
      this.additionalData = extra;
      this.config = config
      titles = config.subTitle ? config.subTitle : null;
      var content = this.loadContent(data, groupBy, titles)
      var reportTitle = `${config["fileName"]}`
      this.pdfService.generatePdf(content,reportTitle, config["orientation"] || 'portrait')
  })
}

async generateCSV(reportName,data) {
    this.dataService.loadReportConfigJson(reportName).subscribe(config=>{
      if (config == null) {
        this.dialogService.openSnackBar('Sorry! Something went wrong', 'OK');
        return
      }
      this.csvService.downloadFile(
        data,
        config["csvColumns"],
        config["csvColHeader"],
        config["fileName"]
        )
    })
}

private loadContent(data,groupBy?,titles?) {
  var content =[]
  if (!data.length) { // No Records
    content.push({ text: "No Record Found"});
    return content
  }
    //data orderBy specific field
    var orderBy = this.config["orderBy"]
    if (orderBy) {
      data = _.orderBy(data,[orderBy],['asc'])
    }

  var grpDef = this.config["groupDef"] || null
  if (grpDef!=null) {
      // get group by function
      var groupField = item => item[grpDef.colName]
      if (grpDef.type == "date") {
          //group by specific field with required format
          groupField = item => moment(item[grpDef.colName]).format(grpDef.format);
      }
  }

  //get group result
  const dataGrpResult:any = _.groupBy(data,groupField)
  // Generate data table based on group field
  var tableCount=1
  var dataObject =  Object.keys(dataGrpResult)
  dataObject.forEach((key:any)=> {
      content.push(this.getPageData(dataGrpResult,key,grpDef,titles))
      tableCount++
      if (tableCount <= dataObject.length)
        //Page Break after group data
        content.push({ text: "", pageBreak: 'after' });
  })
  return content
}

getDummayCols(cols) {
  let result =[]
  for (let idx=0;idx < cols;idx++) {
    result.push({})
  }
  return result
}

private getPageHeader(data,key,grpCol,layoutColumns,titles?) {
  //header text top margin adjustment - 4 points per line
  var headTextMargin = (grpCol && grpCol.margin) ? grpCol.margin :[0,0,0,0]
  var colCount = this.config["pdfColHeader"].length
  var subTitles = [];
  subTitles.push(
    [{text: this.config['title']||'', style: 'title', bold: true, alignment: 'center', fontSize: '14', border: [false, false, false, false],}]
  )
  if (titles) {
    titles.forEach(element => {
      subTitles.push(
          [{ text: element, style: 'sub-title', alignment: 'center', fontSize: '9', border: [false, false, false, false]}]
        )
      });
  }
  if (grpCol!=null && grpCol.headFormat) {
      if (grpCol.type == "date") {
          subTitles.push(
              [{text: moment(key).format(grpCol.headFormat), style: 'title', bold: true, alignment: 'center', fontSize: '10', border: [false, false, false, false],}]
           )
      } else {
        if (typeof(grpCol.headFormat)=== 'string') {
            subTitles.push(
              [{text: eval(grpCol.headFormat), style: 'title', bold: true, alignment: 'center', fontSize: '10', border: [false, false, false, false],}]
          )
        } else { //array of heading
          grpCol.headFormat.forEach(e => {
            subTitles.push(
              [{text: eval(e), style: 'title', bold: true, alignment: 'center', fontSize: '10', border: [false, false, false, false],}]
          )
          });
        }
      }
  }
  return {
      table: {
        widths: ['*'],
        body: [
          [
            {
              alignment: 'center',
              border: [false, false, false, false],
              margin : headTextMargin,
              table: {
                widths: ['*'],
                body: subTitles,
              }
            }
          ]
        ]
      } , colSpan: colCount
      , border: [false, false, false, false]
    }
}

private getAdditionalData(data,layoutColumns) {
 //header text top margin adjustment - 4 points per line
var headTextMargin = [0,0,0,0]
var colCount = this.config["pdfColHeader"].length || 0
var subTitles = [];
let rptHeading = this.config["rptHeading"] || []

let row=[]
rptHeading.forEach((e:any) => {
  row.push(
    {text: e.text || '' +  data[e.field] || '', alignment: e.align || 'left', border: [false, false, false, false]}
  )
});
subTitles.push(row)

return {
    table: {
      widths: [250,'*'],
      body: [
        [
          {
            alignment: 'center',
            margin : headTextMargin,
            border: [false, false, false, false],
            table: {
              body: subTitles.length>0?subTitles: [{}]
            }
          },
          {image: this.textToBase64Barcode(data._id), height: 40, width: 170, alignment: 'right', border: [false, false, false, false]}
        ]
      ]
    } , colSpan: colCount
    , border: [false, false, false, false]
  }
}


//This getPageData method contains header and as well table body
private getPageData(data,key,grpCol,titles) {
  var tabledata = []
  var idx=1
  var headCols = this.config["pdfColHeader"]
  var colWidths = this.config["pdfColwidth"]
  var dataCols = this.config["pdfColumns"]
  var rowHeight = this.config["rowHeight"] || 'auto'
  var layoutColumns = this.config["layoutColumns"] || 1

  var widths=colWidths
  this.config["border"] = this.config["border"] || {default: true}

  //manipulate column width
  for(var c=1;c<layoutColumns;c++) {
    colWidths.forEach(e => widths.push(e))
  }

  //page header
  var pageHead = this.getPageHeader(data[key][0],key,grpCol,layoutColumns,titles)
  //tabledata.push(pageHead)
  if(this.additionalData) {
    var additionalData = this.getAdditionalData(this.additionalData,layoutColumns)
   // tabledata.push(additionalData)
  }
  //push table header
  tabledata.push(this.getTableHeader(headCols,layoutColumns))

  //generate table rows
  var val=[]
  debugger
  for(var r=1;r<=data[key].length;r++) {
    var doc = data[key][r-1]
    var v = this.getRowValue(dataCols,doc,r)
    val = _.union(val,v.data)
    if (r%layoutColumns==0) {
      if (!v.isSame) tabledata.push(val);
      val=[]
    }
  }
  if (val.length>0) {
    val = _.union(val,this.getDummayCols((dataCols.length +1) * layoutColumns-val.length))
    tabledata.push(val);
  }
  let borderWidth = (this.config.border.headerWidth || 1)
  return [
        pageHead,
        additionalData,
        {
          table: {
            widths: widths,

            heights: function (row) {
              return  row < 1 ? 'auto': rowHeight
            },
            headerRows: 1,
            body:tabledata
          }
          ,layout: this.config.border.default == false ? 'lightHorizontalLines' : {
            defaultBorder: true,
            hLineWidth: function (i, node) {
              return i<2 ? borderWidth : 0.1;
            },
            paddingBottom: function(i, node) {
              return 0;
            },
          }
        }
      ]
}



private getTableHeader(headCols,layoutColumns) {
   var data = []
  for(var idx=0;idx<layoutColumns;idx++) {
    headCols.forEach(element => {
      let cell = {
        text: element,
        style: 'tableHeader',
        bold: true,
        alignment: 'center',
        margin: [0, 5, 0, 5],
        fontSize: '9',
      }
      if (this.config.border.header)
        cell['border'] = this.config.border.header
      data.push(cell)
    });
  }
  return data
}

private getRowValue(cols,doc,idx) {
  var row = []
  var cellBorder = this.config.border.cell
  //check current orderby field is equal to previous row
   let isSameVal = false
  var surpressColNo = this.config["surpressColNo"]
  if (surpressColNo) {
    var checkField = cols[surpressColNo].field
      let rv = this.helperService.getDataFromRow(doc,checkField,cols[surpressColNo].type)
      isSameVal = this.previousDataRow['r'+ surpressColNo] && this.previousDataRow['r'+surpressColNo] === rv
      this.previousDataRow['r'+surpressColNo] = rv
  }
  if (isSameVal) {
    row = this.previousTableRow || []
    let cell = {
      text: idx,
      alignment:'center',
      border : cellBorder
    }
    row[0].push(cell);
    //other columns
    let i = 0
    cols.forEach(e => {
      i++
      let val = this.helperService.getDataFromRow(doc,e.field,e.type)
      let cell = {
        text: e.field == checkField && isSameVal ? '' : val,
        alignment:e.alignment,
        border : cellBorder
      }
      row[i].push(cell)
      });
  } else {
        let cell = {
        text: idx,
        alignment:'center',
        border : cellBorder
      }
      row.push([cell]);

      //other columns
      cols.forEach(e => {
        let val = this.helperService.getDataFromRow(doc,e.field,e.type)
        let cell = {
          text: e.field == checkField && isSameVal ? '' : val,
          alignment:e.alignment,
          border : cellBorder
        }
        row.push([cell])
        });
  }
  this.previousTableRow = row
  return {data:row, isSame: isSameVal}
}

private async getImage(url) {
  return await this.helperService.ImagetoDataURL(url).then(dataUrl => {
    if(dataUrl) {
      return dataUrl;
    }
  });
}

textToBase64Barcode(text){
  var canvas = document.createElement("canvas");
  JsBarcode(canvas, text, {format: "CODE39",fontSize:40});
  return canvas.toDataURL("image/png");
  }
}