export type Handle = string;

// TODO: Is this is a thing? Would make asset references in
// components more clear?
// 
// export type TypedHandle<T> = string;

// An "asset" is basically anything that can be loaded
export interface UntypedAsset {
  name:Handle;
  isLoaded():boolean;
  getError():any;
}

export default class Asset<T> implements UntypedAsset {
  private promise:Promise<T>;
  private asset:T | null = null;
  private error:any = null;

  constructor(public name:Handle, promise:Promise<T>) {
    this.promise = promise;
    this.promise.then(x => {
      this.asset = x;
    }, (err) => {
      this.error = err;
    });
  }

  isLoaded() { return this.asset != null; }

  getError() { return this.error; }

  get() { return this.asset; }
}