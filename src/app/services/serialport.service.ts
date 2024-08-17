/**
 * If you're not familiar with TypeScript code, just ignore the `<TYPE>` and `:TYPE` parts.
 */
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class SerialPortService {
  reader: ReadableStreamDefaultReader | undefined;
  writer: WritableStreamDefaultWriter | undefined;
  encoder = new TextEncoder();
  decoder = new TextDecoder();
  port:any
  public currentValue:any = new Uint8Array(0)
  isActive = true
  constructor(){}
  /**
   * Triggers the menu where the user will pick a ice (it requires an user interaction to be triggered).
   * Opens the port selected by the user in the UI using a defined `baudRate`; this example uses a hard-coded value of 9600.
   * After opening the port, a `writer` and a `reader` are set; they will be used by the `write` and `read` methods respectively.
   */
  async init() {
    if ('serial' in navigator) {
      try {
        this.port = await (navigator as any).serial.requestPort();
        await this.port.open({ baudRate: 9600 }); // `baudRate` was `baudrate` in previous versions.
        const signals = await this.port.getSignals();
        const reader = this.port.readable.getReader();

        // Listen to data coming from the serial ice.
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            reader.releaseLock();
            this.isActive = false
            break;
          }

          const mergedArray = new Uint8Array(this.currentValue.length + value.length);
          mergedArray.set(this.currentValue);
          mergedArray.set(value,this.currentValue.length);
		      this.currentValue = mergedArray.slice(Math.max(mergedArray.length - 30, 0));
          this.isActive = true
          //console.log(value);
          //console.log(this.currentValue)
        }
      } catch(err) {
        console.error('There was an error opening the serial port:', err);
      }
    } else {
      console.error('Web serial doesn\'t seem to be enabled in your browser. Try enabling it by visiting:')
      console.error('chrome://flags/#enable-experimental-web-platform-features');
      console.error('opera://flags/#enable-experimental-web-platform-features');
      console.error('edge://flags/#enable-experimental-web-platform-features');
    }
  }



  /**
   * Gets data from the `reader`, decodes it and returns it inside a promise.
   * @returns A promise containing either the message from the `reader` or an error.
   */
  read(){
    try {
      return this.decoder.decode(this.currentValue);
    } catch (err) {
      const errorMessage = `error reading data: ${err}`;
      console.error(errorMessage);
      return errorMessage;
    }
  }

  async close() {
    try {
      this.reader?.releaseLock();
      this.port.close()
    } catch (e) {

    }

  }
}
