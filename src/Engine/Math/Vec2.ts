
export interface DirectionMatch<T> {
  north: T,
  south: T,
  east: T,
  west: T,
  unknown: T
}

export default class Vec2 {
  constructor(
    public readonly x:number,
    public readonly y:number,
  ) { }

  public static readonly ZERO:Vec2 = new Vec2(0, 0);

  add(other:Vec2) { return new Vec2(this.x + other.x, this.y + other.y); }

  multiply(other:Vec2) { return new Vec2(this.x * other.x, this.y * other.y); }

  scalarMultiply(value:number) { return new Vec2(this.x * value, this.y * value); }

  matchDirection<T>(values:DirectionMatch<T>) {
    if (this.y < 0)
      return values.north;
    else if (this.x < 0)
      return values.west;
    else if (this.y > 0)
      return values.south;
    else if (this.x > 0)
      return values.east;
    return values.unknown;
  }
}
