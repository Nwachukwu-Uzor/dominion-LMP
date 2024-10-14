import { PageLoader } from "@/components/shared";
import { lazy, Suspense } from "react";

// Auth
const AdminSignUpComponent = lazy(() => import("./admin-sign-up"));
export const AdminSignUpPage = () => (
  <Suspense fallback={<PageLoader />}>
    <AdminSignUpComponent />
  </Suspense>
);

const AdminLoginComponent = lazy(() => import("./admin-login"));
export const AdminLoginPage = () => (
  <Suspense fallback={<PageLoader />}>
    <AdminLoginComponent />
  </Suspense>
);

// Dashboard
const DashboardComponent = lazy(() => import("./dashboard"));
export const DashboardPage = () => (
  <Suspense fallback={<PageLoader />}>
    <DashboardComponent />
  </Suspense>
);

// Bulk Notifications
const BulkNotificationsComponent = lazy(() => import("./bulk-notifications"));

export const BulkNotificationsPage = () => (
  <Suspense fallback={<PageLoader />}>
    <BulkNotificationsComponent />
  </Suspense>
);

// New Bulk Notification
const NewBulkNotificationComponent = lazy(
  () => import("./bulk-notifications/new"),
);
export const NewBulkNotificationPage = () => (
  <Suspense fallback={<PageLoader />}>
    <NewBulkNotificationComponent />
  </Suspense>
);

// Single Request
const SingleRequestComponent = lazy(
  () => import("./bulk-notifications/details"),
);

export const SingleRequestPage = () => (
  <Suspense fallback={<PageLoader />}>
    <SingleRequestComponent />
  </Suspense>
);

// Admin

const AdminComponent = lazy(() => import("./admins"));
export const AdminPage = () => (
  <Suspense fallback={<PageLoader />}>
    <AdminComponent />
  </Suspense>
);

// Accounts
const AccountsComponent = lazy(() => import("./accounts"));
export const AccountsPage = () => (
  <Suspense fallback={<PageLoader />}>
    <AccountsComponent />
  </Suspense>
);

// Account Details
const AccountDetailsComponent = lazy(
  () => import("./accounts/account-details"),
);
export const AccountDetailsPage = () => (
  <Suspense fallback={<PageLoader />}>
    <AccountDetailsComponent />
  </Suspense>
);

// Edit Customer Details
const EditDetailsComponent = lazy(
  () => import("./accounts/account-details/edit"),
);
export const EditDetailsPage = () => (
  <Suspense fallback={<PageLoader />}>
    <EditDetailsComponent />
  </Suspense>
);

// Customers
const CustomersComponent = lazy(() => import("./customers"));
export const CustomersPage = () => (
  <Suspense fallback={<PageLoader />}>
    <CustomersComponent />
  </Suspense>
);

// Loan Requests
const LoanRequestsComponent = lazy(() => import("./loan/requests"));

export const LoanRequestsPage = () => (
  <Suspense fallback={<PageLoader />}>
    <LoanRequestsComponent />
  </Suspense>
);

// Loan Request Details
const LoanRequestDetailsComponent = lazy(
  () => import("./loan/requests/requestId"),
);
export const LoanRequestDetailsPage = () => (
  <Suspense fallback={<PageLoader />}>
    <LoanRequestDetailsComponent />
  </Suspense>
);

// Loan Repayment by Loan Id
const LoanRepaymentByLoanIdComponent = lazy(
  () => import("./accounts/loan-repayments-by-loanId"),
);
export const LoanRepaymentByLoanIdPage = () => (
  <Suspense fallback={<PageLoader />}>
    <LoanRepaymentByLoanIdComponent />
  </Suspense>
);
// Messaging
const MessagingComponent = lazy(() => import("./messaging"));
export const MessagingPage = () => (
  <Suspense fallback={<PageLoader />}>
    <MessagingComponent />
  </Suspense>
);

// New Template
const NewTemplate = lazy(() => import("./messaging/new-template"));
export const NewTemplatePage = () => (
  <Suspense fallback={<PageLoader />}>
    <NewTemplate />
  </Suspense>
);

// Loan Request
const LoanRequestComponent = lazy(() => import("./loan-request"));
export const LoanRequestPage = () => (
  <Suspense fallback={<PageLoader />}>
    <LoanRequestComponent />
  </Suspense>
);

// Settings Page
const SettingsComponent = lazy(() => import("./settings"));

export const SettingsPage = () => (
  <Suspense fallback={<PageLoader />}>
    <SettingsComponent />
  </Suspense>
);

// Loan Frequency
const LoanFrequencyComponent = lazy(() => import("./settings/loan-frequency"));
export const LoanFrequencyPage = () => (
  <Suspense fallback={<PageLoader />}>
    <LoanFrequencyComponent />
  </Suspense>
);

// Link Status
const LinkStatusComponent = lazy(() => import("./settings/link-status"));
export const LinkStatusPage = () => (
  <Suspense fallback={<PageLoader />}>
    <LinkStatusComponent />
  </Suspense>
);

// IPPIS Data
const IPPISDataComponent = lazy(() => import("./ippis"));
export const IPPISDataPage = () => (
  <Suspense fallback={<PageLoader />}>
    <IPPISDataComponent />
  </Suspense>
);

// IPPIS Upload
const IPPISUploadComponent = lazy(() => import("./ippis/new-upload"));
export const IPPISUploadPage = () => (
  <Suspense fallback={<PageLoader />}>
    <IPPISUploadComponent />
  </Suspense>
);
