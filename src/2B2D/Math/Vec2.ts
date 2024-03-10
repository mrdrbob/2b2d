export default class Vec2 {
  constructor(
    public readonly x: number,
    public readonly y: number,
  ) { }

  public static readonly ZERO: Vec2 = new Vec2(0, 0);
  public static readonly ONE: Vec2 = new Vec2(1, 1);

  add(other: Vec2) { return new Vec2(this.x + other.x, this.y + other.y); }

  sub(other: Vec2) { return new Vec2(this.x - other.x, this.y - other.y); }

  multiply(other: Vec2) { return new Vec2(this.x * other.x, this.y * other.y); }

  inv() { return new Vec2(1 / this.x, 1 / this.y); }

  abs() { return new Vec2(Math.abs(this.x), Math.abs(this.y)); }

  scalarMultiply(value: number) { return new Vec2(this.x * value, this.y * value); }

  max(other: Vec2) { return new Vec2(Math.max(this.x, other.x), Math.max(this.y, other.y)); }

  min(other: Vec2) { return new Vec2(Math.min(this.x, other.x), Math.min(this.y, other.y)); }
}