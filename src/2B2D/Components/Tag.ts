import Component from "../Component";

/** A tag is a component with no associated data. Useful for things
 * like cleaning up, or making an entity more easily identifiable.
 * The `Camera` component is just a tag.
 */
export default function Tag(name:string) : Component {
  return { name };
}
