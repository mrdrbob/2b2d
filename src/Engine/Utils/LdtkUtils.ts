import LdtkData from "../Assets/Ldtk";
import Vec2 from "../Math/Vec2";
import Collider from "./Collider";

export function processLdtkIntGrid(
  ldtk: LdtkData, 
  levelName: string, 
  layerName: string, 
  valueType: number, 
  process:(position:Vec2, size:Vec2) => void
) {
  const level = ldtk.levels.find((x: any) => x.identifier === levelName)!;
  const layer = level.layerInstances.find((x: any) => x.__identifier === layerName)!;


  const colliders = layer.intGridCsv.map((v: number, index: number) => {
    if (v != valueType)
      return null;
    const y = Math.floor(index / layer.__cWid);
    const x = index - (y * layer.__cWid);
    return Collider.create(x, y, 1, 1);
  }).filter((block: any) => block !== null) as Collider[];

  const simplified = Collider.simplifyColliders(colliders);
  const offset = new Vec2(level.pxWid, level.pxHei).scalarMultiply(-0.5);
  
  for (const collider of simplified) {
    const width = collider.getLength(Collider.HORIZONTAL) * layer.__gridSize;
    const height = collider.getLength(Collider.VERTICAL) * layer.__gridSize;
    const bottomLeftX = collider.getSide(Collider.HORIZONTAL, Collider.NEAR) * layer.__gridSize;
    const bottomLeftY = collider.getSide(Collider.VERTICAL, Collider.FAR) * layer.__gridSize;

    const size = new Vec2(width, height);
    const center = new Vec2(bottomLeftX, level.pxHei - bottomLeftY).add(size.scalarMultiply(0.5)).add(offset);
    const finalPosition = new Vec2(center.x, center.y);

    process(finalPosition, size);
  }
}
