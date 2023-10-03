import Asset from "../Asset";

async function loadJson<T>(url:string) {
  const res = await fetch(url);
  const json = await res.json();
  return json as T;
}

export default function loadJsonAsset<T>(name:string, url:string) {
  const promise = loadJson<T>(url);
  return new Asset<T>(name, promise);
}
