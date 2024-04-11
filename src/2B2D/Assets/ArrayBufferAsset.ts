import Asset, { Handle } from "../Asset";

async function loadBuffer(url: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  const arrayBuffer = await blob.arrayBuffer();
  return arrayBuffer;
}

export default function loadArrayBufferAsset(handle: Handle, url: string) {
  const promise = loadBuffer(url);
  return new Asset<ArrayBuffer>(handle, promise);
}