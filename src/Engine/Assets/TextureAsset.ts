import Asset from "../Asset";

async function load(url:string) {
  const res = await fetch(url);
  const blob = await res.blob();
  return createImageBitmap(blob, { colorSpaceConversion: 'none' });
}

export default function loadTextureAsset(name:string, url:string) {
  const promise = load(url);
  return new Asset<ImageBitmap>(name, promise);
}