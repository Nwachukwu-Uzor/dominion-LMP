export const SESSION_STORAGE_KEY = "4f963b40-f332-49ba-bb92-df635584917a";
export const SELECTED_ACCOUNT_KEY = "b0fa517d-8be6-4f5e-8b8d-935ff56c1a0d";
export {
  FETCH_ALL_ADMINS,
  FETCH_ACCOUNTS_PAGINATED,
  FETCH_ACCOUNT_DETAILS_BY_ID,
  FETCH_ALL_TEMPLATES,
  FETCH_ALL_LOAN_REPAYMENTS,
  FETCH_LOAN_REPAYMENTS_BY_LOAN_ID,
  FETCH_ALL_LOAN_REQUESTS_PAGINATED,
  FETCH_LOAN_REQUEST_BY_ID,
  FETCH_STATS,
  FETCH_ALL_CUSTOMERS_PAGINATED,
  FETCH_ALL_LANGUAGES,
  FETCH_LOAN_FREQUENCY_SETTINGS,
  FETCH_PROFILE_INFORMATION_BY_CUSTOMER_ID,
} from "./query-keys";
export { templateParametersList } from "./template-parameters-lists";
export { GENDER_OPTIONS, GENDER_ENUM } from "./gender-options";
export { STATE_OPTIONS } from "./state-options";
export { TITLE_OPTIONS } from "./title-options";
export { NOTIFICATION_PREFERENCE_OPTIONS } from "./notification-preference-options";
export {
  LINK_STATUS_UPDATE_TYPE,
  LINK_STATUS_UPDATE_VALUE,
} from "./link-status-options";

export const USER_ROLES = {
  SUPER_ADMIN: "superAdmin",
  ADMIN: "admin",
  REVIEWER: "REVIEWER",
  AUTHORIZER: "AUTHORIZER",
};
