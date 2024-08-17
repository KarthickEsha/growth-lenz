import { Component, Input, Inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
    selector: "hello",
    template: `
        <div class="dialog-container">
            <div style="display: flex; justify-content: space-between; align-items: center;" class="dialog-header">
                <div style="margin: auto;text-align: center;">
                    <h3>Incoming Call</h3>
                </div>
                <div style="text-align: end;">
                    <mat-icon (click)="closeDialog()">close</mat-icon>
                </div>
            </div>
            <div class="dialog-content">
                <div style="margin: auto;text-align: center;padding:10px;">
                        <img src="{{data.image}}" width="100px" height="100px" style="border-radius: 25px;"/>
                        <p>{{ data.notificationMessage }}</p>
                </div>
                <div *ngIf="rejected" style="margin: auto;text-align: center;padding:5px;">
                    <form [formGroup]="form">
                        <mat-form-field style="width: 80%;">
                            <mat-label>Enter reason for rejection</mat-label>
                            <textarea matInput
                            cdkTextareaAutosize
                            formControlName="reason"
                            #autosize="cdkTextareaAutosize">
                            </textarea>
                        </mat-form-field>
                    </form>
                </div>
            </div>
            <div class="dialog-actions" mat-dialog-actions align="end">
                <span *ngIf="!rejected" style="margin: auto;text-align: center;padding:10px;">
                    <button mat-raised-button class="submitbtn" (click)="closeDialog()">Accept</button>
                    <button mat-raised-button class="submitbtn" (click)="reject()">Decline</button>
                </span>
                <span *ngIf="rejected">
                    <button mat-raised-button class="submitbtn" (click)="submitReason()">Submit</button>
                </span>
            </div>
        </div>
    `,
    styles: [`
        .dialog-container {
            border-radius: 10px;
            border: 1px solid #ccc;
            overflow: hidden;
        }
        
        .dialog-header {
            background-color: #f0f0f0;
            padding: 10px;
            border-bottom: 1px solid #ccc;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .dialog-content {
            padding: 20px;
        }
        
        .dialog-actions {
            padding: 10px;
            border-top: 1px solid #ccc;
        }
    `]
  })

  export class HelloComponent {
    rejected: boolean = false;
    form!: FormGroup;
    constructor(
      private _mdr: MatDialogRef<HelloComponent>,
      private fb: FormBuilder,
      @Inject(MAT_DIALOG_DATA) public data: { notificationMessage: string, image: string }
    ) {
        this.form = this.fb.group(
            {
              reason: ["", Validators.required]
            });
    }

    reject() {
        this.rejected = true;
    }

    submitReason() {
        this._mdr.close();
    }

    ngOnInit() {
        setTimeout(() => {
            this.closeDialog();
        }, 50000);
    }

    closeDialog() {
      this._mdr.close(false)
    }

  }