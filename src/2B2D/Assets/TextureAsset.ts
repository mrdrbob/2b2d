import Asset, { Handle } from "../Asset";

async function load(url: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  return createImageBitmap(blob, { colorSpaceConversion: 'none' });
}

/** Loads an image from a URL. */
export default function loadTextureAsset(name: Handle, url: string) {
  const promise = load(url);
  return new Asset<ImageBitmap>(name, promise);
}
