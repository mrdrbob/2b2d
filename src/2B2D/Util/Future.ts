import UntypedFuture from "./UntypedFuture";

export default class Future<T> implements UntypedFuture {
  private value: T | undefined = undefined;

  complete(value: T) { this.value = value; }

  ready(): boolean { return this.value !== undefined; }
  get(): T | undefined { return this.value; }
  assume(): T { return this.value!; }

  static create<T>(method: () => Promise<T>) {
    const future = new Future<T>();

    method().then(res => {
      future.complete(res);
    });

    return future;
  }
}
