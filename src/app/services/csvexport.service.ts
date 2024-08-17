import { HelperService } from 'src/app/services/helper.service';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CsvExportService {
    constructor(
      private helperService:HelperService
    ) {

    }

    downloadFile(data:any, columns:any, header:any, filename = 'data') {
        let csvData = this.ConvertToCSV(data, columns,header);
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

    ConvertToCSV(objArray:any, colList:any , headerList:any) {
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
              line += ',' + this.helperService.getDataFromRow(data[i], col["field"],col["type"])
            })
            str += line + '\r\n';
        }
        return str;
    }

    getData(row:any,col:any):any{
        if(row) {
            const head = col.split('.')
            if (head.length>1) {
                return this.getData(row[head[0]],head[1])
            } else {
                return row[col] ? '"' + row[col] + '"':'""'
            }
        } else {
            return "";
        }
    }
}