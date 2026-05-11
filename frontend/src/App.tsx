import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AddDispatch } from "./pages/AddDispatch";
import { CreatePurchaseOrder } from "./pages/CreatePurchaseOrder";
import { Dashboard } from "./pages/Dashboard";
import { Dispatches } from "./pages/Dispatches";
import { ExistingPurchaseOrders } from "./pages/ExistingPurchaseOrders";
import { MasterPage } from "./pages/MasterPage";
import { Login } from "./pages/Login";
import { PurchaseOrderDetails } from "./pages/PurchaseOrderDetails";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Reports } from "./pages/Reports";
import { Transporters } from "./pages/Transporters";
import type { CoalSize, Customer, Supplier } from "./types";

export default function App() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="purchase-orders" element={<ExistingPurchaseOrders />} />
        <Route path="dispatches" element={<Dispatches />} />
        <Route path="reports" element={<Reports />} />
        <Route element={<ProtectedRoute adminOnly />}>
        <Route
          path="customers"
          element={
            <MasterPage<Customer>
              title="Customers"
              description="Manage coal purchase order customers."
              path="/customers"
              kind="party"
              emptyLabel="No customers found."
              columns={[
                { label: "Name", render: (customer) => customer.name },
                { label: "GST Number", render: (customer) => customer.gstNumber },
                { label: "Contact", render: (customer) => customer.contactPerson },
                { label: "Phone", render: (customer) => customer.phone },
                { label: "Email", render: (customer) => customer.email }
              ]}
            />
          }
        />
        <Route
          path="suppliers"
          element={
            <MasterPage<Supplier>
              title="Suppliers"
              description="Manage dispatch suppliers and purchase sources."
              path="/suppliers"
              kind="party"
              emptyLabel="No suppliers found."
              columns={[
                { label: "Name", render: (supplier) => supplier.name },
                { label: "GST Number", render: (supplier) => supplier.gstNumber },
                { label: "Contact", render: (supplier) => supplier.contactPerson },
                { label: "Phone", render: (supplier) => supplier.phone },
                { label: "Email", render: (supplier) => supplier.email }
              ]}
            />
          }
        />
        <Route
          path="coal-sizes"
          element={
            <MasterPage<CoalSize>
              title="Coal Sizes"
              description="Manage coal size masters used on purchase orders."
              path="/coal-sizes"
              kind="coalSize"
              emptyLabel="No coal sizes found."
              columns={[
                { label: "Name", render: (coalSize) => coalSize.name },
                { label: "Description", render: (coalSize) => coalSize.description }
              ]}
            />
          }
        />
        <Route path="transporters" element={<Transporters />} />
        <Route path="purchase-orders/create" element={<CreatePurchaseOrder />} />
        <Route path="dispatches/new" element={<AddDispatch />} />
        <Route path="purchase-orders/:id/dispatches/new" element={<AddDispatch />} />
        </Route>
        <Route path="purchase-orders/:id" element={<PurchaseOrderDetails />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
