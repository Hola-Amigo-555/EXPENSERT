
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ExpenseProvider } from "./contexts/ExpenseContext";
import { Toaster } from "@/components/ui/toaster";
import MainLayout from './components/layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Categories from './pages/Categories';
import Reports from './pages/Reports';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import TestPage from './pages/TestPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Settings from './pages/Settings';
import AuthLayout from './components/layouts/AuthLayout';
import './App.css';

function App() {
  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('expenseTrackerUser') !== null;

  return (
    <ExpenseProvider>
      <Toaster />
      <Router>
        <Routes>
          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={!isLoggedIn ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!isLoggedIn ? <Register /> : <Navigate to="/dashboard" />} />
          </Route>
          
          {/* App routes - protected */}
          <Route path="/" element={isLoggedIn ? <MainLayout /> : <Navigate to="/login" />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="budgets" element={<Budgets />} />
            <Route path="categories" element={<Categories />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="welcome" element={<Index />} />
            <Route path="test" element={<TestPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </ExpenseProvider>
  );
}

export default App;
