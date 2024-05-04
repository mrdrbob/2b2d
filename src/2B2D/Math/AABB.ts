import Vec2 from "./Vec2";


/** Axis-aligned boundary box -- Basically unrotated rectangles, used for AABB collisions calculations */
export default class AABB {
  public static readonly NEAR: number = -1; // Negative direction
  public static readonly FAR: number = 1; // Positive direction

  public static readonly HORIZONTAL: number = 0; // Index of the X axis
  public static readonly VERTICAL: number = 1;   // Index of the y axis

  public pos: Vec2;
  public size: Vec2;

  constructor(pos: Vec2, size: Vec2) {
    this.pos = pos;
    this.size = size;
  }

  static create(x: number, y: number, width: number, height: number) {
    return new AABB(
      new Vec2(x, y),
      new Vec2(width, height)
    );
  }

  static signum(val: number) {
    // Stupid hack because Math.sign returns +0 for both +0 and -0. We want -1 or +1.
    if (val === 0 && 1 / val === -Infinity) {
      return -1;
    }
    return val < 0 ? -1 : 1;
  }

  contains(pos: Vec2) {
    return pos.x >= this.pos.x - this.size.x
      && pos.x <= this.pos.x + this.size.x
      && pos.y >= this.pos.y - this.size.y
      && pos.y <= this.pos.y + this.size.y;
  }

  detectRayCollision(pos: Vec2, ray: Vec2) {
    const raySign = new Vec2(AABB.signum(ray.x), AABB.signum(ray.y));
    const negRaySign = raySign.scalarMultiply(-1);

    const nearSide = this.pos.add(this.size.multiply(negRaySign));
    const farSide = this.pos.add(this.size.multiply(raySign));

    const nearDistance = nearSide.sub(pos);
    const farDistance = farSide.sub(pos);

    const rayInvert = ray.inv();
    const nearImpact = nearDistance.multiply(rayInvert);
    const farImpact = farDistance.multiply(rayInvert);


    if (nearImpact.x > farImpact.y || nearImpact.y > farImpact.x) {
      return null;
    }

    const impactMoment = Math.max(nearImpact.x, nearImpact.y);
    const exitMoment = Math.min(farImpact.x, farImpact.y);

    if (impactMoment > 1 || impactMoment <= 0) { return null; }
    if (impactMoment > exitMoment) { return null; }

    const reflection = ray.scalarMultiply(1 - impactMoment);

    const normal = nearImpact.x <= nearImpact.y
      ? new Vec2(0, -raySign.y)
      : new Vec2(-raySign.x, 0);

    const pointOfImpact = pos.add(reflection);
    const output = {
      point: pointOfImpact,
      normal,
      moment: impactMoment
    };

    return output;
  }

  getSide(axis: number, side: number) {
    const pos = axis == 0 ? this.pos.x : this.pos.y;
    const size = axis == 0 ? this.size.x : this.size.y;
    return pos + (size * side);
  }

  getLength(axis: number) { return (axis == 0 ? this.size.x : this.size.y) * 2; }

  static combineAxis(left: AABB, right: AABB, axis: number) {
    const near = Math.min(left.getSide(axis, this.NEAR), right.getSide(axis, this.NEAR));
    const far = Math.max(left.getSide(axis, this.FAR), right.getSide(axis, this.FAR));
    const size = (far - near) * 0.5;
    const pos = near + size;

    return { size, pos };
  }

  static combine(left: AABB, right: AABB) {
    const x = AABB.combineAxis(left, right, this.HORIZONTAL);
    const y = AABB.combineAxis(left, right, this.VERTICAL);

    const pos = new Vec2(x.pos, y.pos);
    const size = new Vec2(x.size, y.size);
    return new AABB(pos, size);
  }

  static matchingEdge(left: AABB, right: AABB, axis: number, side: number) {
    const otherAxis = axis == 0 ? 1 : 0;

    let nearEdge = left.getSide(otherAxis, this.NEAR) == right.getSide(otherAxis, this.NEAR);
    let farEdge = left.getSide(otherAxis, this.FAR) == right.getSide(otherAxis, this.FAR);
    let sharedEdge = left.getSide(axis, side) == right.getSide(axis, -side);

    return nearEdge && farEdge && sharedEdge;
  }

  static simplify(colliders: AABB[]) {
    let output = colliders;
    output = this.simplifyOnAxis(output, this.HORIZONTAL);
    output = this.simplifyOnAxis(output, this.VERTICAL);
    return output;
  }

  static simplifyOnAxis(colliders: AABB[], axis: number) {
    const solved = new Array<AABB>();

    for (const unsolved of colliders) {
      const solvedItem = [this.NEAR, this.FAR].reduce((acc, side) => {

        let matched = solved.findIndex(x => AABB.matchingEdge(x, acc, axis, side));
        if (matched < 0)
          return acc;

        let removedItem = solved.splice(matched, 1)[0];

        return AABB.combine(acc, removedItem);
      }, unsolved);

      solved.push(solvedItem);
    }

    return solved;
  }
}