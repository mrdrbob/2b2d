import Update from "./Update";

/** Represents something that must be ticked every frame but not during normal
 * systems execution. Currently only used for managing browser input.
 * Eh, kind of a hack, really. This should probably be a smarter, more specific
 * systems schedule of some kind. But this is easy.
 */
export default interface Ticker {
  tick(update: Update): void;
}
