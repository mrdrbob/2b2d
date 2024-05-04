export async function loadTexture(url: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  return createImageBitmap(blob, { colorSpaceConversion: 'none' });
}
