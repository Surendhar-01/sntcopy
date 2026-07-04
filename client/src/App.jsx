import React, { useEffect, useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardPage from './components/Dashboard/Dashboard';
import BillingPage from './components/Billing/Billing';
import ProductsPage from './components/Products/Products';
import StockPage from './components/Stock/Stock';
import PricingPage from './components/Pricing/Pricing';
import PriceBoardPage from './components/PriceBoard/PriceBoard';
import SalesPage from './components/Sales/Sales';
import CustomersPage from './components/Customers/Customers';
import ReportsPage from './components/Reports/Reports';
import LoginActivityPage from './components/LoginActivity/LoginActivity';
import SettingsPage from './components/Settings/Settings';
import Login from './components/Login';
import { SidebarProvider } from './context/SidebarContext';
import { useERPData } from './hooks/useERPData';
import { canAccessCustomers, canAccessSettings, hasAdminAccess } from './utils/roles';

// Memoize page components outside render loop to maintain component identities
const Dashboard = React.memo(DashboardPage);
const Billing = React.memo(BillingPage);
const Products = React.memo(ProductsPage);
const Stock = React.memo(StockPage);
const Pricing = React.memo(PricingPage);
const PriceBoard = React.memo(PriceBoardPage);
const Sales = React.memo(SalesPage);
const Customers = React.memo(CustomersPage);
const Reports = React.memo(ReportsPage);
const LoginActivity = React.memo(LoginActivityPage);
const Settings = React.memo(SettingsPage);

function getDefaultPageForRole(role) {
  const normalized = String(role || '').trim().toLowerCase();
  
  if (normalized === 'staff') {
    return 'billing';
  }
  return 'dashboard';
}

function resolvePageForRole(page, user) {
  if (page === 'customers' && !canAccessCustomers(user)) {
    return 'dashboard';
  }

  if (page === 'settings' && !canAccessSettings(user)) {
    return 'dashboard';
  }

  return page;
}

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sri_nikil_user');
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      if (parsed && !parsed.loginTime) {
        parsed.loginTime = new Date().toISOString();
        localStorage.setItem('sri_nikil_user', JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return null;
    }
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('sri_nikil_user') !== null;
  });
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem('sri_nikil_session');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });
  
  const erp = useERPData();

  useEffect(() => {
    const preventNumberScrollChange = (event) => {
      const activeElement = document.activeElement;

      if (
        activeElement instanceof HTMLInputElement &&
        activeElement.type === 'number' &&
        activeElement.contains(event.target)
      ) {
        event.preventDefault();
      }
    };

    document.addEventListener('wheel', preventNumberScrollChange, { passive: false });

    return () => {
      document.removeEventListener('wheel', preventNumberScrollChange);
    };
  }, []);

  useEffect(() => {
    if (session) {
      localStorage.setItem('sri_nikil_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('sri_nikil_session');
    }
  }, [session]);

  const handleLogin = async (username, password) => {
    try {
      const userData = await erp.login(username, password);
      const loginTime = new Date().toISOString();
      const userWithSession = { ...userData, loginTime };

      setUser(userWithSession);
      setIsLoggedIn(true);
      setCurrentPage(getDefaultPageForRole(userData.role));
      localStorage.setItem('sri_nikil_user', JSON.stringify(userWithSession));
      
      const newSession = {
        id: erp.db.loginLogs.length > 0 ? Math.max(...erp.db.loginLogs.map(item => item.id)) + 1 : 1,
        user: userData.user,
        role: userData.role,
        loginTime,
        logoutTime: null
      };
      
      try {
        const createdLog = await erp.addLoginLog(newSession);
        setSession({ ...newSession, id: createdLog.id });
      } catch (logError) {
        console.warn('Login logged locally only', logError);
        setSession(newSession);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error; 
    }
  };

  const handleLogout = async () => {
    if (session) {
      if (user?.role?.toLowerCase() === 'staff') {
        try {
          await erp.endShift({
            user: user.user,
            role: user.role,
            sessionId: session.id,
            shiftStart: user.loginTime
          });
        } catch (error) {
          console.error('Failed to auto-end shift on staff logout:', error);
          await erp.updateLoginLog(session.id).catch(() => {});
        }
      } else {
        await erp.updateLoginLog(session.id);
      }
    }
    setUser(null);
    setIsLoggedIn(false);
    setSession(null);
    localStorage.removeItem('sri_nikil_user');
  };

  // State-slice database selectors to prevent unnecessary component updates
  const dashboardDb = useMemo(() => ({
    bills: erp.db.bills,
    products: erp.db.products
  }), [erp.db.bills, erp.db.products]);

  const productsDb = useMemo(() => ({
    products: erp.db.products
  }), [erp.db.products]);

  const stockDb = useMemo(() => ({
    products: erp.db.products,
    refills: erp.db.refills
  }), [erp.db.products, erp.db.refills]);

  const pricingDb = useMemo(() => ({
    products: erp.db.products,
    priceHistory: erp.db.priceHistory
  }), [erp.db.products, erp.db.priceHistory]);

  const priceBoardDb = useMemo(() => ({
    products: erp.db.products,
    priceHistory: erp.db.priceHistory
  }), [erp.db.products, erp.db.priceHistory]);

  const salesDb = useMemo(() => ({
    bills: erp.db.bills
  }), [erp.db.bills]);

  const customersDb = useMemo(() => ({
    customers: erp.db.customers
  }), [erp.db.customers]);

  const reportsDb = useMemo(() => ({
    bills: erp.db.bills,
    products: erp.db.products,
    loginLogs: erp.db.loginLogs,
    priceHistory: erp.db.priceHistory,
    customers: erp.db.customers
  }), [erp.db.bills, erp.db.products, erp.db.loginLogs, erp.db.priceHistory, erp.db.customers]);

  const loginActivityDb = useMemo(() => ({
    loginLogs: erp.db.loginLogs
  }), [erp.db.loginLogs]);

  const settingsDb = useMemo(() => ({
    settings: erp.db.settings,
    accounts: erp.db.accounts
  }), [erp.db.settings, erp.db.accounts]);

  const billingDb = useMemo(() => ({
    products: erp.db.products,
    settings: erp.db.settings,
    bills: erp.db.bills,
    billSeq: erp.db.billSeq
  }), [erp.db.products, erp.db.settings, erp.db.bills, erp.db.billSeq]);

  // Wrap ERP references in sub-providers to isolate mutable values
  const erpProducts = useMemo(() => ({
    db: productsDb,
    addProduct: erp.addProduct,
    deleteProduct: erp.deleteProduct,
    updateProductPrice: erp.updateProductPrice,
    fetchProducts: erp.fetchProducts
  }), [productsDb, erp.addProduct, erp.deleteProduct, erp.updateProductPrice, erp.fetchProducts]);

  const erpStock = useMemo(() => ({
    db: stockDb,
    addRefill: erp.addRefill,
    clearRefills: erp.clearRefills,
    deleteRefill: erp.deleteRefill,
    fetchRefills: erp.fetchRefills,
    fetchProducts: erp.fetchProducts
  }), [stockDb, erp.addRefill, erp.clearRefills, erp.deleteRefill, erp.fetchRefills, erp.fetchProducts]);

  const erpPricing = useMemo(() => ({
    db: pricingDb,
    updateProductPrice: erp.updateProductPrice,
    deletePriceHistory: erp.deletePriceHistory,
    clearPriceHistory: erp.clearPriceHistory,
    fetchPriceHistory: erp.fetchPriceHistory,
    fetchProducts: erp.fetchProducts
  }), [pricingDb, erp.updateProductPrice, erp.deletePriceHistory, erp.clearPriceHistory, erp.fetchPriceHistory, erp.fetchProducts]);

  const erpLoginActivity = useMemo(() => ({
    db: loginActivityDb,
    deleteLoginLog: erp.deleteLoginLog,
    clearLoginLogs: erp.clearLoginLogs,
    fetchLoginLogs: erp.fetchLoginLogs
  }), [loginActivityDb, erp.deleteLoginLog, erp.clearLoginLogs, erp.fetchLoginLogs]);

  const erpSettings = useMemo(() => ({
    db: settingsDb,
    updateSettings: erp.updateSettings,
    addStaff: erp.addStaff,
    deleteStaff: erp.deleteStaff,
    updateStaffPassword: erp.updateStaffPassword,
    fetchAccounts: erp.fetchAccounts
  }), [settingsDb, erp.updateSettings, erp.addStaff, erp.deleteStaff, erp.updateStaffPassword, erp.fetchAccounts]);

  const erpBilling = useMemo(() => ({
    db: billingDb,
    addBill: erp.addBill,
    refreshData: erp.refreshData,
    fetchBills: erp.fetchBills,
    fetchProducts: erp.fetchProducts
  }), [billingDb, erp.addBill, erp.refreshData, erp.fetchBills, erp.fetchProducts]);

  if (!erp || erp.loading || !erp.db) {
    return <div className="loading">Initializing System...</div>;
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const resolvedCurrentPage = resolvePageForRole(currentPage, user);

  const renderPage = () => {
    const canManageAdminPages = hasAdminAccess(user);
    const canViewCustomers = canAccessCustomers(user);
    const canViewSettings = canAccessSettings(user);

    switch (resolvedCurrentPage) {
      case 'dashboard': return <Dashboard db={dashboardDb} user={user} />;
      case 'manager': return <Dashboard db={dashboardDb} user={user} />;
      case 'billing': return canManageAdminPages ? <Dashboard db={dashboardDb} user={user} /> : <Billing erp={erpBilling} user={user} />;
      case 'products': return <Products db={productsDb} erp={erpProducts} user={user} />;
      case 'stock': return <Stock db={stockDb} erp={erpStock} user={user} />;
      case 'pricing': return canManageAdminPages ? <Pricing db={pricingDb} erp={erpPricing} user={user} /> : <Dashboard db={dashboardDb} user={user} />;
      case 'priceboard': return <PriceBoard db={priceBoardDb} fetchPriceHistory={erp.fetchPriceHistory} />;
      case 'sales': return <Sales db={salesDb} fetchBills={erp.fetchBills} user={user} />;
      case 'customers': return canViewCustomers ? <Customers db={customersDb} fetchCustomers={erp.fetchCustomers} /> : <Dashboard db={dashboardDb} user={user} />;
      case 'reports': return <Reports db={reportsDb} user={user} />;
      case 'loginlog': return canManageAdminPages ? <LoginActivity db={loginActivityDb} erp={erpLoginActivity} user={user} /> : <Dashboard db={dashboardDb} user={user} />;
      case 'settings': return canViewSettings ? <Settings db={settingsDb} erp={erpSettings} user={user} /> : <Dashboard db={dashboardDb} user={user} />;
      default: return <Dashboard db={dashboardDb} user={user} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex bg">
        <Sidebar
          currentPage={resolvedCurrentPage}
          setCurrentPage={setCurrentPage}
          user={user}
          onLogout={handleLogout}
        />
        <div className="main flex-1">
          <Topbar
            title={resolvedCurrentPage.charAt(0).toUpperCase() + resolvedCurrentPage.slice(1)}
            user={user}
            erp={erp}
            session={session}
            setUser={setUser}
            setSession={setSession}
          />
          <div className="content">
            {renderPage()}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default App;
