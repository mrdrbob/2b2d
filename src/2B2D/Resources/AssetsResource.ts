import Asset from "../Assets/Asset";
import { Handle } from "../Handle";
import UntypedFuture from "../Util/UntypedFuture";
import Resource from "./Resource";

export default class AssetsResource implements Resource {
  static readonly NAME: string = 'AssetsResource';
  readonly name: string = AssetsResource.NAME;

  private readonly assets = new Map<Handle, UntypedFuture>();

  add<T>(asset: Asset<T>) { this.assets.set(asset.handle, asset); }

  get<T>(handle: Handle) {
    const asset = this.assets.get(handle);
    return asset ? (asset as Asset<T>) : undefined;
  }

  try<T>(handle: Handle) {
    const asset = this.assets.get(handle);
    if (!asset || !asset.ready())
      return undefined;
    const typed = asset as Asset<T>;
    return typed.get();
  }

  assume<T>(handle: Handle) {
    return (this.assets.get(handle)! as Asset<T>).get()!;
  }

  loaded(names: Handle[]) {
    return names.every(handle => {
      let asset = this.assets.get(handle);
      return asset && asset.ready();
    });
  }
}