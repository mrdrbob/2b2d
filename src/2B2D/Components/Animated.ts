import Component from "../Component";

export interface AnimatedComponent extends Component {
  name: 'Animated',
  tag: string,
  time: number,
  previousTag: string | undefined
}

/** Animates a Sprite. Set the `tag` value to different values to change the animation.
 * Tags are based on the Atlas format exported by Aseprite.
 */
export default function Animated(tag:string) : AnimatedComponent {
  return {
    name: 'Animated',
    tag,
    time: 0,
    previousTag: undefined
  };
}
