import { Handle } from "../Handle";
import Future from "../Util/Future";

export default class Asset<T> extends Future<T> {
  constructor(public handle: Handle) {
    super();
  }

  static from<T>(handle: Handle, promise: Promise<T>) {
    const future = new Asset<T>(handle);

    promise.then(res => {
      future.complete(res);
    }, (err) => {
      throw err;
    });

    return future;
  }
}