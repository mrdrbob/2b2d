import Update from "./Update";

export type System = (update: Update) => void;

export type FixedSystem = {
    fixed: System
}
