// Used to construct collision information.
// This is mostly a temporary class used to simplify a bunch of
// individual collider tiles into a smaller collection of collider
// rectangles. For example, three square colliders in a row would 
// become one 3x1 collider rectangle.
export default class Collider {
  public static readonly NEAR: number = 0; // Near the origin of the box (south west)
  public static readonly FAR: number = 1;  // Far from the origin (north east)

  public static readonly HORIZONTAL: number = 0; // Index of the X axis
  public static readonly VERTICAL: number = 1;   // Index of the y axis

  readonly pos: [number, number];
  readonly size: [number, number];

  constructor(pos: [number, number], size: [number, number]) {
    this.pos = pos;
    this.size = size;
  }

  getSide(axis: number, side: number) {
    return this.pos[axis] + (this.size[axis] * side);
  }

  getLength(axis: number) {
    return this.size[axis];
  }

  extend(axis: number, side: number, length: number) {
    const pos: [number, number] = [this.pos[0], this.pos[1]];
    const size: [number, number] = [this.size[0], this.size[1]];
    size[axis] += length;
    pos[axis] -= length * side;

    return new Collider(pos, size);
  }

  static create(x: number, y: number, width: number, height: number) {
    return new Collider([x, y], [width, height]);
  }

  checkSideCollision(other: Collider, axis: number, side: number) {
    const otherAxis = axis == 1 ? 0 : 1;

    if (this.getSide(otherAxis, Collider.NEAR) > other.getSide(otherAxis, Collider.FAR))
      return null;

    if (this.getSide(otherAxis, Collider.FAR) < other.getSide(otherAxis, Collider.NEAR))
      return null;

    let sideValue = this.getSide(axis, side);
    if (sideValue < other.getSide(axis, Collider.NEAR))
      return null;

    if (sideValue > other.getSide(axis, Collider.FAR))
      return null;

    const otherSide = side == 1 ? 0 : 1;
    let distance = other.getSide(axis, otherSide) - sideValue;
    return distance;
  }

  static simplifyColliders(colliders: Collider[]) {
    // Combine colliders that share a vertical edge.
    const simplified = Collider._simplifyColliders(colliders, Collider.HORIZONTAL);

    // Now combine colliders that share a horizontal edge
    return Collider._simplifyColliders(simplified, Collider.VERTICAL);
  }

  private static _simplifyColliders(colliders: Collider[], axis: number) {
    const solved: Collider[] = [];
    const otherAxis = axis == 1 ? 0 : 1;

    while (colliders.length > 0) {
      let popped = colliders.pop()!;

      let solvedItem = [Collider.NEAR, Collider.FAR].reduce((acc, side) => {
        let otherSide = side == 1 ? 0 : 1;

        let matched = solved.findIndex((c) => {
          return c.getSide(axis, otherSide) == acc.getSide(axis, side)
            && c.getSide(otherAxis, otherSide) == acc.getSide(otherAxis, otherSide)
            && c.getSide(otherAxis, side) == acc.getSide(otherAxis, side)
        });

        if (matched < 0) {
          return acc;
        }

        let removedItem = solved.splice(matched, 1)[0];
        let extended_item = acc.extend(axis, otherSide, removedItem.getLength(axis));
        return extended_item;
      }, popped);

      solved.push(solvedItem);
    }

    return solved;
  }
}
