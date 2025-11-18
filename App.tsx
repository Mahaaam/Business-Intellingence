import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Sidebar, AIChatAssistant } from './components';
import { Header } from './components';
import { 
  ExecutiveDashboard, ProductionDashboard, FinanceDashboard, MaintenanceDashboard, 
  EnergyDashboard, QualityDashboard, HrDashboard, SupplyChainDashboard, 
  SalesDashboard, AiDashboard, PrivacyPolicy
} from './dashboards';
import { generateMockData } from './data';
import type { AppContextType, MockData, Language } from './types';

export const AppContext = React.createContext<AppContextType | null>(null);

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<string>('executive');
  const [language, setLanguage] = useState<Language>('fa');
  const [direction, setDirection] = useState<'rtl' | 'ltr'>('rtl');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const mockData: MockData = useMemo(() => generateMockData(), []);

  useEffect(() => {
    setDirection(language === 'fa' ? 'rtl' : 'ltr');
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => prev === 'en' ? 'fa' : 'en');
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case 'executive': return <ExecutiveDashboard />;
      case 'production': return <ProductionDashboard />;
      case 'finance': return <FinanceDashboard />;
      case 'maintenance': return <MaintenanceDashboard />;
      case 'energy': return <EnergyDashboard />;
      case 'quality': return <QualityDashboard />;
      case 'hr': return <HrDashboard />;
      case 'supply_chain': return <SupplyChainDashboard />;
      case 'sales': return <SalesDashboard />;
      case 'ai_predictive': return <AiDashboard />;
      case 'privacy': return <PrivacyPolicy />;
      default: return <ExecutiveDashboard />;
    }
  };

  const appContextValue: AppContextType = {
    language,
    toggleLanguage,
    mockData,
    activePage,
    setActivePage
  };

  return (
    <AppContext.Provider value={appContextValue}>
      <div className={`flex h-screen bg-black font-sans ${direction}`}>
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-4 sm:p-6 lg:p-8">
            {renderPage()}
          </main>
        </div>
        <AIChatAssistant />
      </div>
    </AppContext.Provider>
  );
};

export default App;