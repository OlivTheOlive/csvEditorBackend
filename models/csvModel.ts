export class CsvDataDTO {
  private _data: object;

  constructor(data: object) {
    this._data = Array.isArray(data) ? data : Object.values(data);
  }

  public get data() {
    return this._data;
  }

  public set data(newData) {
    try {
      if (Array.isArray(newData)) {
        this._data = newData;
      } else {
        throw new TypeError("Data must be an array");
      }
    } catch (error: any) {
      console.error("Failed to set data:", error.message);
      throw error;
    }
  }
}
