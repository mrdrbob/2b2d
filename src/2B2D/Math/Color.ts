export default class Color {
  constructor(public r: number, public g: number, public b: number, public a: number) { }

  public rgba() { return [this.r, this.g, this.b, this.a]; }

  public static Black(alpha?: number) { return new Color(0, 0, 0, alpha === undefined ? 1 : alpha); }
  public static White(alpha?: number) { return new Color(1, 1, 1, alpha === undefined ? 1 : alpha); }

  add(color: Color) {
    return new Color(
      this.r + color.r,
      this.g + color.g,
      this.b + color.b,
      this.a + color.a,
    );
  }

  sub(color: Color) {
    return new Color(
      this.r - color.r,
      this.g - color.g,
      this.b - color.b,
      this.a - color.a,
    );
  }

  scalarMultiply(value: number) {
    return new Color(
      this.r * value,
      this.g * value,
      this.b * value,
      this.a * value,
    );
  }
}
