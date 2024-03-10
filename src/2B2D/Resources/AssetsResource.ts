import Asset, { Handle, UntypedAsset } from "../Asset";
import Resource from "../Resource";

export default class AssetsResource implements Resource {
  static readonly NAME = 'Assets';
  readonly name: string = AssetsResource.NAME;

  private assets = new Map<Handle, UntypedAsset>();

  add(asset: UntypedAsset) { this.assets.set(asset.name, asset); }

  get<T>(handle: Handle) {
    const asset = this.assets.get(handle);
    return asset ? (asset as Asset<T>) : undefined;
  }

  assume<T>(handle: Handle) {
    return (this.assets.get(handle)! as Asset<T>).get()!;
  }

  loaded(names: Handle[]) {
    return names.every(handle => {
      let asset = this.assets.get(handle);
      return asset && asset.isLoaded();
    });
  }
}
