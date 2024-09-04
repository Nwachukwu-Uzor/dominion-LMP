import { createBrowserRouter, RouterProvider } from "react-router-dom";
import {
  DashboardPage,
  AdminLoginPage,
  AdminSignUpPage,
  BulkNotificationsPage,
  NewBulkNotificationPage,
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
} from "./pages";
import { AuthLayout, LoanRequestLayout, MainLayout } from "./layout";

const router = createBrowserRouter([
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
        path: "/bulk-notifications",
        children: [
          {
            index: true,
            element: <BulkNotificationsPage />,
          },
          {
            path: "new",
            element: <NewBulkNotificationPage />,
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
        index: true,
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
