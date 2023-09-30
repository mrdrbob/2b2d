import Asset from "../Asset";

async function loadJson(url:string) {
  const res = await fetch(url);
  const json = await res.json();
  return json;
}

export default function loadJsonAsset(name:string, url:string) {
  const promise = loadJson(url);
  return new Asset(name, promise);
}
