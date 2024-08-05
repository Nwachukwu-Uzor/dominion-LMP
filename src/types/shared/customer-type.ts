import { ProfileType } from "./profile-type";

export type CustomerType = ProfileType & {
  customerNumber: string;
};
