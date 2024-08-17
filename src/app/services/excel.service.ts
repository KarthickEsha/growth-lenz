import { Injectable } from '@angular/core'; 
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { HelperService } from './helper.service';
import * as FileSaver from 'file-saver';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {
  // npm install file-saver --save --force

  constructor( public helperService:HelperService) { }
  public exportAsExcelFile(json:any, excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }
  private saveAsExcelFile(buffer: any, fileName: string): void {
     const data: Blob = new Blob([buffer], {type: EXCEL_TYPE});
     FileSaver.saveAs(data, fileName + '_export_' + new  Date().getTime() + EXCEL_EXTENSION);
  }
public excel(data:any){
  const csvContent = this.convertToCSV(data);
  const csvFile = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  saveAs(csvFile, 'data.csv');
}

downloadFile(data:any, columns:any, header:any, filename:any ) {
  let csvData = this.ConverttoCSV(data, columns,header);
  let blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
  let dwldLink = document.createElement("a");
  let url = URL.createObjectURL(blob);
  let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
  if (isSafariBrowser) {  //if Safari open in new window to save file with random filename.
      dwldLink.setAttribute("target", "_blank");
  }
  dwldLink.setAttribute("href", url);
  dwldLink.setAttribute("download", filename + ".csv");
  dwldLink.style.visibility = "hidden";
  document.body.appendChild(dwldLink);
  dwldLink.click();
  document.body.removeChild(dwldLink);
}

ConverttoCSV(objArray:any, colList:any, headerList:any) {
  let data = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
  let str = '';
  let row = '';

  for (let index in headerList) {
      row += headerList[index] + ',';
  }
  row = row.slice(0, -1);
  str += row + '\r\n';
  for (let i = 0; i < data.length; i++) {
      let line = (i + 1) + '';
      colList.forEach((col:any)=>{
        line += ',"' + this.helperService.getDataFromRow(data[i], col["field"],col["type"])+'"'
      })
      str += line + '\r\n';
  }
  return str;
}

convertToCSV(array: string[]): string {
  const csvArray = array.map(item => item.replace(/,/g, '\\,')); // Escape commas in the array items

  const csvContent = csvArray.join(','); // Join the array items with commas

  return csvContent;
}
  }