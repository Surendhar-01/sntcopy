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
import { hasAdminAccess, normalizeRole, USER_ROLES } from './utils/roles';
import { canRoleOpenPage, getRoleLayout } from './config/roleLayouts';
import './App.css';

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
  return getRoleLayout(role).defaultPage;
}

function resolvePageForRole(page, user) {
  return canRoleOpenPage(user, page) ? page : getRoleLayout(user).defaultPage;
}

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem('sri_nikil_current_page') || 'dashboard';
  });
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

  useEffect(() => {
    if (!isLoggedIn || !user?.user || !user?.role) return;

    let isMounted = true;

    const syncActiveShift = async () => {
      try {
        const activeShift = await erp.getActiveShift(user.user, user.role);
        if (!isMounted) return;

        if (activeShift && activeShift.success) {
          if (activeShift.active || normalizeRole(user.role) === USER_ROLES.ADMIN) {
            if (user.loginTime !== activeShift.shiftStart) {
              const updatedUser = {
                ...user,
                loginTime: activeShift.shiftStart
              };
              setUser(updatedUser);
              localStorage.setItem('sri_nikil_user', JSON.stringify(updatedUser));
            }

            if (activeShift.sessionId) {
              if (!session || session.id !== activeShift.sessionId || session.loginTime !== activeShift.shiftStart) {
                setSession({
                  id: activeShift.sessionId,
                  user: user.user,
                  role: user.role,
                  loginTime: activeShift.shiftStart,
                  logoutTime: null
                });
              }
            } else {
              if (session !== null) setSession(null);
            }
          } else {
            if (user.loginTime !== null) {
              const updatedUser = {
                ...user,
                loginTime: null
              };
              setUser(updatedUser);
              localStorage.setItem('sri_nikil_user', JSON.stringify(updatedUser));
            }
            if (session !== null) setSession(null);
          }
        }
      } catch (err) {
        console.error('Failed to sync active shift start time:', err);
      }
    };

    syncActiveShift();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn, user, session, erp]);

  useEffect(() => {
    localStorage.setItem('sri_nikil_current_page', currentPage);
  }, [currentPage]);

  const handleLogin = async (username, password) => {
    try {
      const userData = await erp.login(username, password);
      const defaultLoginTime = new Date().toISOString();
      const userWithSession = { ...userData, loginTime: defaultLoginTime };

      setUser(userWithSession);
      setIsLoggedIn(true);
      setCurrentPage(getDefaultPageForRole(userData.role));
      localStorage.setItem('sri_nikil_user', JSON.stringify(userWithSession));

      const lowerRole = normalizeRole(userData.role);
      try {
        const existingShift = await erp.getActiveShift(userData.user, userData.role);
        let shiftResult = null;

        if (existingShift && existingShift.success && existingShift.active) {
          shiftResult = existingShift;
        } else if (lowerRole === USER_ROLES.STAFF || lowerRole === USER_ROLES.MANAGER) {
          shiftResult = await erp.startShift({
            user: userData.user,
            role: userData.role,
            shiftStart: defaultLoginTime
          });
        }

        if (shiftResult && (shiftResult.shiftStart || shiftResult.success)) {
          const actualShiftStart = shiftResult.shiftStart || defaultLoginTime;
          const updatedUser = {
            ...userWithSession,
            loginTime: actualShiftStart
          };
          setUser(updatedUser);
          localStorage.setItem('sri_nikil_user', JSON.stringify(updatedUser));
          
          if (shiftResult.sessionId || existingShift?.sessionId) {
            setSession({
              id: shiftResult.sessionId || existingShift.sessionId,
              user: userData.user,
              role: userData.role,
              loginTime: actualShiftStart,
              logoutTime: null
            });
          }
        }
      } catch (shiftError) {
        console.error('Failed to handle shift on login:', shiftError);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error; 
    }
  };

  const handleLogout = React.useCallback(async () => {
    // We no longer automatically end shifts on logout. Shift only ends on user's manual action.
    setUser(null);
    setIsLoggedIn(false);
    setSession(null);
    localStorage.removeItem('sri_nikil_user');
    localStorage.removeItem('sri_nikil_current_page');
  }, []);



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
    customers: erp.db.customers,
    billSeq: erp.db.billSeq
  }), [erp.db.products, erp.db.settings, erp.db.bills, erp.db.customers, erp.db.billSeq]);

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
    fetchProducts: erp.fetchProducts,
    resetProductStock: erp.resetProductStock
  }), [stockDb, erp.addRefill, erp.clearRefills, erp.deleteRefill, erp.fetchRefills, erp.fetchProducts, erp.resetProductStock]);

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
    resetSalesData: erp.resetSalesData,
    fetchAccounts: erp.fetchAccounts
  }), [settingsDb, erp.updateSettings, erp.addStaff, erp.deleteStaff, erp.updateStaffPassword, erp.resetSalesData, erp.fetchAccounts]);

  const erpBilling = useMemo(() => ({
    db: billingDb,
    addBill: erp.addBill,
    refreshData: erp.refreshData,
    fetchBills: erp.fetchBills,
    fetchProducts: erp.fetchProducts
  }), [billingDb, erp.addBill, erp.refreshData, erp.fetchBills, erp.fetchProducts]);

  const erpDashboard = useMemo(() => ({
    db: dashboardDb,
    addRefill: erp.addRefill,
    fetchProducts: erp.fetchProducts
  }), [dashboardDb, erp.addRefill, erp.fetchProducts]);

  if (!erp || erp.loading || !erp.db) {
    return <div className="loading">Initializing System...</div>;
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const resolvedCurrentPage = resolvePageForRole(currentPage, user);
  const roleLayout = getRoleLayout(user);

  const renderPage = () => {
    const canManageAdminPages = hasAdminAccess(user);

    switch (resolvedCurrentPage) {
      case 'dashboard': return <Dashboard db={dashboardDb} erp={erpDashboard} user={user} />;
      case 'billing': return canManageAdminPages ? <Dashboard db={dashboardDb} erp={erpDashboard} user={user} /> : <Billing erp={erpBilling} user={user} />;
      case 'products': return <Products db={productsDb} erp={erpProducts} user={user} />;
      case 'stock': return <Stock db={stockDb} erp={erpStock} user={user} />;
      case 'pricing': return canManageAdminPages ? <Pricing db={pricingDb} erp={erpPricing} user={user} /> : <Dashboard db={dashboardDb} erp={erpDashboard} user={user} />;
      case 'priceboard': return <PriceBoard db={priceBoardDb} fetchPriceHistory={erp.fetchPriceHistory} />;
      case 'sales': return <Sales db={salesDb} fetchBills={erp.fetchBills} user={user} />;
      case 'customers': return <Customers db={customersDb} fetchCustomers={erp.fetchCustomers} />;
      case 'reports': return <Reports db={reportsDb} user={user} />;
      case 'loginlog': return canManageAdminPages ? <LoginActivity db={loginActivityDb} erp={erpLoginActivity} user={user} /> : <Dashboard db={dashboardDb} erp={erpDashboard} user={user} />;
      case 'settings': return <Settings db={settingsDb} erp={erpSettings} user={user} />;
      default: return <Dashboard db={dashboardDb} erp={erpDashboard} user={user} />;
    }
  };

  return (
    <SidebarProvider>
      <div className={`flex bg app-shell role-layout-${roleLayout.key}`} data-role={roleLayout.key}>
        <Sidebar
          currentPage={resolvedCurrentPage}
          setCurrentPage={setCurrentPage}
          user={user}
          onLogout={handleLogout}
        />
        <div className="main flex-1">
          <Topbar
            user={user}
            roleLayout={roleLayout}
            erp={erp}
            session={session}
            setUser={setUser}
            setSession={setSession}
            onLogout={handleLogout}
          />
          <div className="content">
            {erp.mutationNotice && (
              <div className={`app-toast ${erp.mutationNotice.type}`} role="status" aria-live="polite">
                {erp.mutationNotice.message}
              </div>
            )}
            {renderPage()}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default App;
