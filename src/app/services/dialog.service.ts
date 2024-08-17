import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  animal!: string;
  name!: string;
  dialogRef: any;
  constructor(private dialog: MatDialog,
    private _snackBar: MatSnackBar,
  ) { }

  public openDialog(content: any, width?: any, height?: any, val?: any): void {

    if (width == null) width = '90%'
    if (height == null) height = 'auto'
    this.dialogRef = this.dialog.open(content, {
      width: width || '400px',
      height: height || '800px',
      data: val || null,
      disableClose: true
    });


    this.dialogRef.afterClosed().subscribe((result: any) => {
      console.log('The dialog was closed');
    });
  }

  public closeModal() {
    this.dialogRef.close()
  }

  public CloseALL(){
    this.dialog.closeAll()
    console.log("All Dialog box was closed")
  }
  


  public openSnackBar(message: string, action: string="OK") {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }
}
