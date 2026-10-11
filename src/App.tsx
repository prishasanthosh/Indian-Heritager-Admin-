import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import { RequireAdmin } from "./components/RequireAdmin";
import { AdminLayout } from "./components/AdminLayout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Products } from "./pages/Products";
import { ProductForm } from "./pages/ProductForm";
import { Categories } from "./pages/Categories";
import { Orders } from "./pages/Orders";
import { Users } from "./pages/Users";
import { Donations } from "./pages/Donations";
import { Messages } from "./pages/Messages";
import { VolunteerApplications } from "./pages/VolunteerApplications";
import { Newsletter } from "./pages/Newsletter";
import { BookDonations } from "./pages/BookDonations";
import { BookRequests } from "./pages/BookRequests";
import { Projects } from "./pages/Projects";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/new" element={<ProductForm />} />
            <Route path="/products/:id/edit" element={<ProductForm />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/book-donations" element={<BookDonations />} />
            <Route path="/book-requests" element={<BookRequests />} />
            <Route path="/donations" element={<Donations />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/volunteers" element={<VolunteerApplications />} />
            <Route path="/newsletter" element={<Newsletter />} />
            <Route path="/users" element={<Users />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </AuthProvider>
  );
}
