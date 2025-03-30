
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
import './App.css';

function App() {
  return (
    <ExpenseProvider>
      <Toaster />
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Index />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="budgets" element={<Budgets />} />
            <Route path="categories" element={<Categories />} />
            <Route path="reports" element={<Reports />} />
            <Route path="test" element={<TestPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </ExpenseProvider>
  );
}

export default App;
