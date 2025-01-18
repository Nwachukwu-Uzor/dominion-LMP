import {
  createHashRouter,
  RouterProvider,
} from "react-router-dom";
import {
  DashboardPage,
  AdminLoginPage,
  AdminSignUpPage,
  SingleRequestPage,
  AdminPage,
  AccountsPage,
  AccountDetailsPage,
  MessagingPage,
  NewTemplatePage,
  LoanRepaymentByLoanIdPage,
  LoanRequestPage,
  LoanRequestsPage,
  LoanRequestDetailsPage,
  CustomersPage,
  SettingsPage,
  LoanFrequencyPage,
  IPPISDataPage,
  IPPISUploadPage,
  EditDetailsPage,
  LinkStatusPage,
  RepaymentTrackerPage,
  NewRepaymentUploadPage,
  RejectedRequestsPage,
  EditRejectedRequestsPage,
} from "./pages";
import { AuthLayout, LoanRequestLayout, MainLayout } from "./layout";

const router = createHashRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "/accounts",
        children: [
          {
            index: true,
            element: <AccountsPage />,
          },
          {
            path: ":customerId",
            children: [
              {
                index: true,
                element: <AccountDetailsPage />,
              },
              {
                path: "edit",
                element: <EditDetailsPage />,
              },
            ],
          },
          {
            path: "loan/:loanId",
            element: <LoanRepaymentByLoanIdPage />,
          },
        ],
      },
      {
        path: "/customers",
        children: [
          {
            index: true,
            element: <CustomersPage />,
          },
        ],
      },
      {
        path: "/loan",
        children: [
          {
            path: "requests/rejected",
            element: <RejectedRequestsPage />,
          },
          {
            path: "requests/rejected/edit/:accountId",
            element: <EditRejectedRequestsPage />,
          },
          {
            path: "requests/:stage",
            element: <LoanRequestsPage />,
          },
          {
            path: "requests/:stage/:requestId/:accountId",
            element: <LoanRequestDetailsPage />,
          },
        ],
      },
      {
        path: "/repayment-tracker",
        children: [
          {
            index: true,
            element: <RepaymentTrackerPage />,
          },
          {
            path: "new",
            element: <NewRepaymentUploadPage />,
          },
          {
            path: ":id",
            element: <SingleRequestPage />,
          },
        ],
      },
      {
        path: "users",
        element: <AdminPage />,
      },
      {
        path: "messaging",
        children: [
          {
            index: true,
            element: <MessagingPage />,
          },
          {
            path: "new-template",
            element: <NewTemplatePage />,
          },
        ],
      },
      {
        path: "settings",
        children: [
          {
            index: true,
            element: <SettingsPage />,
          },
          {
            path: "loan-frequency",
            element: <LoanFrequencyPage />,
          },
          {
            path: "link-status",
            element: <LinkStatusPage />,
          },
        ],
      },
      {
        path: "ippis",
        children: [
          {
            index: true,
            element: <IPPISDataPage />,
          },
          {
            path: "new-upload",
            element: <IPPISUploadPage />,
          },
        ],
      },
    ],
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "signup",
        element: <AdminSignUpPage />,
      },
      {
        path: "login",
        element: <AdminLoginPage />,
      },
    ],
  },
  {
    path: "/loan-request",
    element: <LoanRequestLayout />,
    children: [
      {
        path: "",
        element: <LoanRequestPage />,
      },
    ],
  },
]);
const App = () => {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};

export default App;
