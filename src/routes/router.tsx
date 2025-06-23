import { createBrowserRouter } from "react-router-dom";
import ListIncomeCalculations from "../pages/income/ListIncomeCalculations";
import IncomeCalculator from "../pages/income/IncomeCalculator";
import PreviewIncomeCalculation from "../pages/income/PreviewIncomeCalculation";
import ListCIBCalculations from "../pages/cib/ListCIBCalculations";
import CIBCalculator from "../pages/cib/CIBCalculator";
import PreviewCIBCalculation from "../pages/cib/PreviewCIBCalculation";
import App from "../App";
import Dashboard from "../pages/Dashboard";
import NotFoundPage from "../pages/error/NotFound";
import InternalErrorPage from "../pages/error/InternalError";
import Login from "../pages/Login";
import ProtectedRoute from "./ProtectedRoute";
import Currency from "../pages/Currency";
import Wording from "../pages/Wording";
import UserPage from "../pages/User";
import MyProfilePage from "../pages/MyProfile";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/my-profile",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    errorElement: <InternalErrorPage />,
    children: [
      {
        index: true,
        element: <MyProfilePage />,
        errorElement: <InternalErrorPage />,
      },
    ],
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    errorElement: <InternalErrorPage />,
    children: [
      {
        index: true,
        element: <Dashboard />,
        errorElement: <InternalErrorPage />,
      },
    ],
  },
  {
    path: "income-calculations",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    errorElement: <InternalErrorPage />,
    children: [
      {
        path: "",
        index: true,
        element: <ListIncomeCalculations />,
        errorElement: <InternalErrorPage />,
      },
      {
        path: ":number",
        element: <PreviewIncomeCalculation />,
        errorElement: <InternalErrorPage />,
      },
      {
        path: "new",
        element: <IncomeCalculator />,
        errorElement: <InternalErrorPage />,
      },
    ],
  },
  {
    path: "cib-calculations",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    errorElement: <InternalErrorPage />,
    children: [
      {
        path: "",
        index: true,
        element: <ListCIBCalculations />,
        errorElement: <InternalErrorPage />,
      },
      {
        path: ":number",
        element: <PreviewCIBCalculation />,
        errorElement: <InternalErrorPage />,
      },
      {
        path: "new",
        element: <CIBCalculator />,
        errorElement: <InternalErrorPage />,
      },
    ],
  },
  {
    path: "system-management-currency",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    errorElement: <InternalErrorPage />,
    children: [
      {
        index: true,
        element: <Currency />,
        errorElement: <InternalErrorPage />,
      },
    ],
  },
  {
    path: "system-management-wording",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    errorElement: <InternalErrorPage />,
    children: [
      {
        index: true,
        element: <Wording />,
        errorElement: <InternalErrorPage />,
      },
    ],
  },
  {
    path: "user-management",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    errorElement: <InternalErrorPage />,
    children: [
      {
        index: true,
        element: <UserPage />,
        errorElement: <InternalErrorPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
