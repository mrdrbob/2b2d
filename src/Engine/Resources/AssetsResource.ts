import Asset, { UntypedAsset } from "../Asset";
import Resource from "../Resource";

export default class AssetsResource implements Resource {
  public static readonly NAME:string = "AssetsResource";

  private assets:Map<string, UntypedAsset> = new Map<string, UntypedAsset>();

  name(): string { return AssetsResource.NAME; }

  add<T>(asset:Asset<T>) { this.assets.set(asset.name(), asset); }

  isAllLoaded(names:string[]) {
    for (const name of names) {
      if (!this.isLoaded(name))
        return false;
    }

    return true;
  }

  isLoaded(name:string) { 
    const asset = this.assets.get(name);
    if (!asset)
      return false;
    return asset.isLoaded();
  }

  get<T>(name:string) {
    const asset = this.assets.get(name);
    if (!asset)
      return null;
    return asset as Asset<T>;
  }

  assume<T>(name:string) {
    const asset = this.assets.get(name)! as Asset<T>;
    return asset.get()!;
  }
}
