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
            element: <AccountDetailsPage />,
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
            path: "requests/:stage/:requestId",
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
