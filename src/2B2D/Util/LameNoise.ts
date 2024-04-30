
// These aren't really "seeds", but rather strech 
// a few sin waves which are then mixed together to make
// something similar to noise.
// I provide two sets so you can generate random motion in
// 2 dimensions without them being identical.
const seeds = [
  [0.7, 1.5, 2.3],
  [2.1, 1.7, 1.3]
];

// Pretty sure this is a real word. The sin sums
// should return a number between -x.length and +x.length.
// So we divide by length to get a number between -1 and +1.
const avergizers = seeds.map(x => 1 / x.length);

function sum(agg: number, x: number) {
  return agg + x;
}

/** Returns something that kind of looks like noise but isn't really. 
 * Look, I googled "Perlin noise", saw dozens of lines of code, and decided 
 * "nah". Maybe in the future I'll add a proper noise function, but for now,
 * if you mix a few random sin waves and squint, it kind of looks like 
 * noise. And frankly it works fine for camera shake.
 */
export default function getLameNoise(seedIndex: number, time: number) {
  const index = seedIndex % seeds.length;

  return seeds[index].map(x => Math.sin(time * x)).reduce(sum) * avergizers[index];
}
