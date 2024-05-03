import Component from "./Component";

export default class Animated implements Component {
  static readonly NAME: string = 'Animated';
  readonly name: string = Animated.NAME;

  /** Animates a Sprite. Set the `tag` value to different values to change the animation.
   * Tags are based on the Atlas format exported by Aseprite. Setting a tag resets the 
   * animation frame only if the tag is different than it was in the previous frame.
   */
  constructor(public tag: string) { }

  time: number = 0;
  previousTag: string | undefined = undefined;
}