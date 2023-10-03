export default class Color {
  constructor(public r:number, public g:number, public b:number, public a:number) {}

  public static Black(alpha?:number) { return new Color(0, 0, 0, alpha === undefined ? 1 : alpha); }
  public static While(alpha?:number) { return new Color(1, 1, 1, alpha === undefined ? 1 : alpha); }
}
