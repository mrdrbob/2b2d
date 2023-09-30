export interface UntypedAsset {
  name():string;
  isLoaded():boolean;
  getError():any;
}

export default class Asset<T> implements UntypedAsset {
  private promise:Promise<T>;
  private asset:T | null = null;
  private error:any = null;
  private _name:string;

  constructor(name:string, promise:Promise<T>) {
    this._name = name;
    this.promise = promise;
    this.promise.then(x => {
      this.asset = x;
    }, (err) => {
      this.error = err;
    });
  }

  name() { return this._name; }

  isLoaded() { return this.asset != null; }

  getError() { return this.error; }

  get() { return this.asset; }
}