import { Update } from "./Update";

export type System = (args: Update) => void;

export type Schedule = 'update' | 'entering' | 'exiting';
