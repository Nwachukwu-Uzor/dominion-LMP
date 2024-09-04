import { dummyStates } from "@/data";

export const STATE_OPTIONS = dummyStates.map((state) => ({
  ...state,
  value: state.name,
  label: state.name,
}));
