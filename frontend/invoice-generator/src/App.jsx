import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import { Toaster } from 'react-hot-toast'; //for pop-up notifications
import LandingPage from './pages/LandingPage/LandingPage';
import Signup from './pages/Auth/Signup';
import Login from './pages/Auth/Login';
import Dashboard from "./pages/Dashboard/Dashboard";
import ProfilePage from "./pages/Profile/ProfilePage";
import AllInvoices from "./pages/invoices/AllInvoices";
import InvoiceDetail from "./pages/invoices/InvoiceDetail";
import CreateInvoice from "./pages/invoices/CreateInvoices";
import ProtectedRoute from "./components/auth/ProtectedRoute"

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage/> }/>
          <Route path="/Signup" element={<Signup/> }/>
          <Route path="/Login" element={<Login/>}/>

          {/* protected Routes */}
          <Route path="/" element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/invoices" element={<AllInvoices />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="invoices/:id" element={<InvoiceDetail />} />
            <Route path="invoices/new" element={<CreateInvoice />} />
          </Route>



          {/* Catch all route */}
          <Route path='*' element={<Navigate to="/" replace /> }/>
        </Routes>
      </Router>
      <Toaster 
        toastOptions={{
          className:"",
          style:{
            fontSize:"13px"
          },
        }}
      />
    </div>
  )
}

export default App