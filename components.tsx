import React, { useContext, useState, useMemo, useEffect, useRef } from 'react';
import { AppContext } from './App';
import type { AppContextType } from './types';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChevronUp, ChevronDown, Menu, X, Globe, Briefcase, DollarSign, Settings, Droplet, CheckSquare, Users, Truck, ShoppingCart, BrainCircuit, Activity, Wrench, ShieldAlert, BadgeCheck, FlaskConical, HardHat, Warehouse, Package, Target, TrendingUp, Wallet, GripVertical, Bot, Send, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

// --- Reusable Components ---

const cardStyles = "bg-slate-900/40 backdrop-blur-lg p-6 rounded-2xl border border-[--brand-red-base]/20 shadow-lg shadow-[--brand-red-base]/10 transition-all duration-300 ease-in-out hover:border-[--brand-red-base]/50 hover:shadow-2xl hover:shadow-[--brand-red-base]/20 hover:-translate-y-2";

export const KpiCard: React.FC<{ title: string; value: string; change: number; description: string; icon: React.ReactNode }> = ({ title, value, change, description, icon }) => (
  <div className={cardStyles}>
    <div className="flex items-start justify-between">
      <div className="flex flex-col">
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
      </div>
      <div className="bg-[--brand-red-darkest]/50 p-3 rounded-full text-[--brand-red-bright]">
        {icon}
      </div>
    </div>
    <div className="flex items-center mt-4 text-sm">
      <div className={`flex items-center ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {change >= 0 ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        <span className="font-semibold mx-1">{Math.abs(change)}%</span>
      </div>
      <span className="text-gray-400 ml-2">{description}</span>
    </div>
  </div>
);

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f97316'];
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};


export const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className={`relative h-96 flex flex-col ${cardStyles}`}>
    <h3 className="text-lg font-semibold text-[--brand-red-bright] mb-4">{title}</h3>
    <div className="flex-grow">
      {children}
    </div>
  </div>
);

export const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-md p-3 rounded-lg border border-blue-500/30">
        <p className="label text-blue-300">{`${label}`}</p>
        {payload.map((pld: any) => {
          if (pld.value != null) {
            return (
              <p key={pld.dataKey} style={{ color: pld.color }}>
                {`${pld.name}: ${pld.value.toLocaleString()}${unit ? ` ${unit}` : ''}`}
              </p>
            );
          }
          return null;
        })}
      </div>
    );
  }
  return null;
};

export const BarChartComponent: React.FC<{
    data: any[], 
    xAxisKey: string, 
    barKeys: {key: string, color: string}[],
    onBarClick?: (payload: any) => void,
    tooltipUnit?: string
}> = ({data, xAxisKey, barKeys, onBarClick, tooltipUnit}) => (
    <ResponsiveContainer width="100%" height="100%">
        <BarChart 
            data={data} 
            onClick={(e: any) => onBarClick && e && e.activePayload && e.activePayload.length > 0 && onBarClick(e.activePayload[0].payload)}
        >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.2)" />
            <XAxis dataKey={xAxisKey} stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip content={<CustomTooltip unit={tooltipUnit} />} />
            <Legend />
            {barKeys.map(bar => <Bar key={bar.key} dataKey={bar.key} fill={bar.color} cursor={onBarClick ? "pointer" : "default"} />)}
        </BarChart>
    </ResponsiveContainer>
);

export const LineChartComponent: React.FC<{data: any[], xAxisKey: string, lineKeys: {key: string, color: string}[]}> = ({data, xAxisKey, lineKeys}) => (
     <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.2)" />
            <XAxis dataKey={xAxisKey} stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {lineKeys.map(line => <Line key={line.key} type="monotone" dataKey={line.key} stroke={line.color} strokeWidth={2} dot={{ r: 2, fill: line.color }} activeDot={{ r: 6 }} />)}
        </LineChart>
    </ResponsiveContainer>
);

export const PieChartComponent: React.FC<{data: any[], dataKey: string, nameKey: string}> = ({data, dataKey, nameKey}) => (
    <ResponsiveContainer width="100%" height="100%">
        <PieChart>
            <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey={dataKey}
                nameKey={nameKey}
            >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
        </PieChart>
    </ResponsiveContainer>
);


// --- Layout Components ---

const menuItems = [
  { id: 'executive', fa: 'داشبورد مدیریتی', en: 'Executive Dashboard', icon: Briefcase },
  { id: 'production', fa: 'تولید', en: 'Production', icon: Activity },
  { id: 'finance', fa: 'مالی', en: 'Finance', icon: DollarSign },
  { id: 'maintenance', fa: 'نگهداری و تعمیرات', en: 'Maintenance', icon: Settings },
  { id: 'energy', fa: 'انرژی', en: 'Energy', icon: Droplet },
  { id: 'quality', fa: 'کنترل کیفیت', en: 'Quality Control', icon: CheckSquare },
  { id: 'hr', fa: 'منابع انسانی', en: 'Human Resources', icon: Users },
  { id: 'supply_chain', fa: 'زنجیره تأمین', en: 'Supply Chain', icon: Truck },
  { id: 'sales', fa: 'فروش', en: 'Sales', icon: ShoppingCart },
  { id: 'ai_predictive', fa: 'هوش مصنوعی', en: 'AI & Predictive', icon: BrainCircuit },
];

export const Sidebar: React.FC<{ isOpen: boolean; setIsOpen: (isOpen: boolean) => void; }> = ({ isOpen, setIsOpen }) => {
  const { language, activePage, setActivePage } = useContext(AppContext) as AppContextType;

  const handleItemClick = (pageId: string) => {
    setActivePage(pageId);
    if(window.innerWidth < 768) setIsOpen(false);
  };

  const sidebarClasses = `
    bg-slate-900/60 backdrop-blur-xl text-white
    h-full flex flex-col transition-all duration-300 ease-in-out
    ${language === 'fa' ? 'border-l' : 'border-r'} border-[--brand-red-base]/20
    ${isOpen ? 'w-64' : 'w-0 overflow-hidden md:w-20'}
  `;
  
  return (
    <div className={sidebarClasses}>
      <div className={`flex items-center justify-center p-4 h-16 border-b border-[--brand-red-base]/20`}>
        <svg className="w-8 h-8 text-[--brand-red-base]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        <h1 className={`text-3xl font-bold ml-3 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>TOMM</h1>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <a
              key={item.id}
              href="#"
              onClick={(e) => { e.preventDefault(); handleItemClick(item.id); }}
              className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                isActive ? 'bg-[--brand-red-dark]/50 text-red-200 shadow-[inset_0_0_10px_rgba(255,0,0,0.4)]' : 'hover:bg-[--brand-red-darkest]/40'
              }`}
            >
              <Icon className="h-6 w-6 text-[--brand-red-bright]" />
              <span className={`mx-4 font-medium transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
                {language === 'fa' ? item.fa : item.en}
              </span>
            </a>
          );
        })}
      </nav>
      <div className={`p-4 border-t border-[--brand-red-base]/20 ${!isOpen && 'md:hidden'}`}>
        <div className="flex justify-between items-center">
            <p className="text-xs text-gray-400">© 2024 TOMM</p>
            <a href="#" onClick={(e) => { e.preventDefault(); handleItemClick('privacy'); }} className="text-xs text-gray-400 hover:text-[--brand-red-bright] transition-colors">
                {language === 'fa' ? 'حریم خصوصی' : 'Privacy'}
            </a>
        </div>
      </div>
    </div>
  );
};


export const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const { language, toggleLanguage, activePage } = useContext(AppContext) as AppContextType;
  const currentPage = menuItems.find(item => item.id === activePage);
  
  let pageTitle = '';
  if (currentPage) {
    pageTitle = language === 'fa' ? currentPage.fa : currentPage.en;
  } else if (activePage === 'privacy') {
    pageTitle = language === 'fa' ? 'سیاست حفظ حریم خصوصی' : 'Privacy Policy';
  }

  const userName = <span className="hidden sm:block text-sm font-medium text-white">{language === 'fa' ? 'مدیر سیستم' : 'Admin'}</span>;
  const avatar = <img className="h-8 w-8 rounded-full object-cover border-2 border-[--brand-red-base]/50" src="https://picsum.photos/100" alt="User" />;
  const langButton = (
      <button onClick={toggleLanguage} className="flex items-center text-gray-400 hover:text-white transition-colors">
          {language === 'en' && <Globe size={20} className="text-[--brand-red-bright]" />}
          <span className="mx-2 text-sm font-medium">{language === 'en' ? 'فارسی' : 'English'}</span>
          {language === 'fa' && <Globe size={20} className="text-[--brand-red-bright]" />}
      </button>
  );

  return (
    <header className="flex-shrink-0 bg-slate-900/60 backdrop-blur-xl border-b border-[--brand-red-base]/20 h-16 flex items-center justify-between px-6">
      <div className="flex items-center">
        <button onClick={onMenuClick} className="text-[--brand-red-bright] hover:text-red-300 md:hidden">
          <Menu size={24} />
        </button>
        <h2 className="text-xl font-semibold text-[--brand-red-bright] hidden md:block">{pageTitle}</h2>
      </div>
      
      <div className="flex items-center gap-3 sm:gap-4">
        {language === 'fa' ? (
            <>
                {userName}
                {avatar}
                {langButton}
            </>
        ) : (
            <>
                {langButton}
                {avatar}
                {userName}
            </>
        )}
      </div>
    </header>
  );
};

export const FilterControls: React.FC<{ onFilterChange: (filters: any) => void }> = ({ onFilterChange }) => {
    const { mockData, language } = useContext(AppContext) as AppContextType;
    const [selectedFactories, setSelectedFactories] = useState<number[]>(mockData.factories.map(f => f.id));

    const handleFactoryToggle = (factoryId: number) => {
        const newSelection = selectedFactories.includes(factoryId)
            ? selectedFactories.filter(id => id !== factoryId)
            : [...selectedFactories, factoryId];
        setSelectedFactories(newSelection);
        // In a real app, you would call onFilterChange here
    };

    return (
        <div className="bg-slate-900/40 backdrop-blur-md p-4 rounded-xl mb-6 flex flex-wrap items-center gap-4 border border-[--brand-red-base]/20">
            <span className="font-semibold text-[--brand-red-bright]">{language === 'fa' ? 'فیلتر کارخانه:' : 'Filter by Factory:'}</span>
            <div className="flex flex-wrap gap-2">
                {mockData.factories.map(factory => (
                    <button 
                        key={factory.id} 
                        onClick={() => handleFactoryToggle(factory.id)}
                        className={`px-3 py-1 text-sm rounded-full transition-all duration-300 ${selectedFactories.includes(factory.id) ? 'bg-[--brand-red-base] text-white shadow-[0_0_8px_var(--brand-red-bright)]' : 'bg-slate-800/80 text-slate-300 hover:bg-[--brand-red-dark]/60'}`}>
                        {factory.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export const KpiCustomizationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  allKpis: { [key: string]: { id: string; title: string; } };
  visibleIds: string[];
  onSave: (newIds: string[]) => void;
  language: 'fa' | 'en';
}> = ({ isOpen, onClose, allKpis, visibleIds, onSave, language }) => {
  type KpiConfigItem = { id: string; title: string; isVisible: boolean };
  const [kpiConfig, setKpiConfig] = useState<KpiConfigItem[]>([]);
  const draggedItem = React.useRef<number | null>(null);
  const dragOverItem = React.useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      // FIX: Safely map visibleIds to KPI objects, preventing crashes if an ID doesn't exist in allKpis.
      const orderedVisible = visibleIds
        .map(id => allKpis[id])
        .filter(kpi => !!kpi) // Filter out undefined KPIs
        .map(kpi => ({ ...kpi!, isVisible: true }));

      // FIX: Safely filter hidden KPIs, ensuring kpi object exists before accessing its properties.
      const hidden = Object.values(allKpis)
        .filter(kpi => kpi && !visibleIds.includes(kpi.id))
        .map(kpi => ({ ...kpi, isVisible: false }));
      setKpiConfig([...orderedVisible, ...hidden]);
    }
  }, [isOpen, allKpis, visibleIds]);

  const handleSave = () => {
    const newVisibleIds = kpiConfig.filter(k => k.isVisible).map(k => k.id);
    onSave(newVisibleIds);
    onClose();
  };
  
  const handleToggleVisibility = (id: string) => {
    setKpiConfig(prev => prev.map(k => k.id === id ? { ...k, isVisible: !k.isVisible } : k));
  };

  const handleDragSort = () => {
    if (draggedItem.current === null || dragOverItem.current === null) return;
    const kpiConfigClone = [...kpiConfig];
    const dragged = kpiConfigClone.splice(draggedItem.current, 1)[0];
    kpiConfigClone.splice(dragOverItem.current, 0, dragged);
    draggedItem.current = null;
    dragOverItem.current = null;
    setKpiConfig(kpiConfigClone);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-slate-900/80 border border-[--brand-red-base]/30 rounded-2xl shadow-2xl shadow-red-900/30 w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[--brand-red-bright]">
            {language === 'fa' ? 'سفارشی‌سازی KPIها' : 'Customize KPIs'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
        </div>
        <p className="text-gray-400 mb-6">{language === 'fa' ? 'KPIهای مورد نظر را انتخاب و ترتیب آن‌ها را مشخص کنید.' : 'Select KPIs to display and drag to reorder.'}</p>
        
        <div className="space-y-3">
          {kpiConfig.map((kpi, index) => (
            <div 
              key={kpi.id}
              className={`flex items-center p-3 rounded-lg transition-all duration-200 cursor-grab ${kpi.isVisible ? 'bg-slate-800' : 'bg-slate-800/50'}`}
              draggable
              onDragStart={() => draggedItem.current = index}
              onDragEnter={() => dragOverItem.current = index}
              onDragEnd={handleDragSort}
              onDragOver={e => e.preventDefault()}
            >
              <GripVertical className="text-gray-500 mr-3" />
              <input
                type="checkbox"
                checked={kpi.isVisible}
                onChange={() => handleToggleVisibility(kpi.id)}
                className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-[--brand-red-base] focus:ring-[--brand-red-base] cursor-pointer"
              />
              <span className={`flex-1 mx-4 ${kpi.isVisible ? 'text-white' : 'text-gray-500'}`}>{kpi.title}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors">
            {language === 'fa' ? 'انصراف' : 'Cancel'}
          </button>
          <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-[--brand-red-base] hover:bg-[--brand-red-bright] text-white font-semibold transition-colors shadow-[0_0_10px_var(--brand-red-base)]">
            {language === 'fa' ? 'ذخیره' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- AI Chat Assistant ---

type Message = {
  role: 'user' | 'model';
  text: string;
};

export const AIChatAssistant: React.FC = () => {
    const { mockData, language } = useContext(AppContext) as AppContextType;
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMessages([{
            role: 'model',
            text: language === 'fa' ? 'سلام! من دستیار هوش مصنوعی شما هستم. چگونه می‌توانم در تحلیل داده‌ها به شما کمک کنم؟' : 'Hello! I am your AI assistant. How can I help you analyze the data today?'
        }]);
    }, [language]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const newUserMessage: Message = { role: 'user', text: userInput };
        setMessages(prev => [...prev, newUserMessage]);
        const currentInput = userInput;
        setUserInput('');
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            const dataSummary = `
              You are a helpful BI analyst for TOMM GROUP. Your task is to answer questions based on the provided data summary. Keep your answers concise and professional. If you cannot answer with the provided summary, state that you need more specific data.
              Data Summary:
              - We have 4 factories: ${mockData.factories.map(f => `${f.name} (${f.type})`).join(', ')}.
              - We produce: ${mockData.products.map(p => p.name).join(', ')}.
              - The dataset covers the last 365 days.
              - Available data points include: Production (planned, actual, OEE), Finance (revenue, cost, profit), Energy (consumption), Maintenance (downtime), Quality (rejection rates), HR (employee count), Supply Chain (inventory), Sales (units sold).
            `;
            
            const contents = `${dataSummary}\n\nUser Question: ${currentInput}`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: contents,
            });

            const aiResponse: Message = { role: 'model', text: response.text };
            setMessages(prev => [...prev, aiResponse]);

        } catch (error) {
            console.error("Error calling Gemini API:", error);
            const errorMessage: Message = { role: 'model', text: language === 'fa' ? 'متاسفانه خطایی در ارتباط با سرویس هوش مصنوعی رخ داد. لطفا دوباره تلاش کنید.' : 'Sorry, an error occurred while contacting the AI service. Please try again.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const chatModalClasses = `
      fixed bottom-24 end-4 z-40
      w-[calc(100%-2rem)] max-w-md h-[70vh] max-h-[600px]
      flex flex-col
      bg-slate-900/60 backdrop-blur-xl border border-[--brand-red-base]/30 rounded-2xl shadow-2xl shadow-red-900/50
      transition-all duration-300 ease-in-out
      ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}
    `;

    return (
        <>
            <div className={chatModalClasses}>
                <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-[--brand-red-base]/20">
                    <h3 className="font-bold text-[--brand-red-bright] flex items-center gap-2">
                        <BrainCircuit size={20} />
                        {language === 'fa' ? 'دستیار هوش مصنوعی' : 'AI Assistant'}
                    </h3>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div ref={chatContainerRef} className="flex-1 p-4 space-y-4 overflow-y-auto">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && <Bot className="w-6 h-6 flex-shrink-0 text-[--brand-red-base]" />}
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                                msg.role === 'user'
                                ? 'bg-[--brand-red-base] text-white rounded-br-none'
                                : 'bg-slate-800 text-gray-200 rounded-bl-none'
                            }`}>
                                <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-end gap-2 justify-start">
                            <Bot className="w-6 h-6 flex-shrink-0 text-[--brand-red-base]" />
                            <div className="max-w-[80%] rounded-2xl px-4 py-2 text-sm bg-slate-800 text-gray-200 rounded-bl-none flex items-center">
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                <span>{language === 'fa' ? 'در حال پردازش...' : 'Thinking...'}</span>
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSendMessage} className="flex-shrink-0 p-4 border-t border-[--brand-red-base]/20">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder={language === 'fa' ? 'سوال خود را بپرسید...' : 'Ask a question...'}
                            className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[--brand-red-base]"
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading} className="bg-[--brand-red-base] hover:bg-[--brand-red-bright] disabled:bg-slate-700 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors shadow-[0_0_10px_var(--brand-red-base)]">
                            <Send size={16} />
                        </button>
                    </div>
                </form>
            </div>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 end-6 z-50 w-14 h-14 bg-[--brand-red-base] text-white rounded-full flex items-center justify-center shadow-lg shadow-red-900/50 hover:bg-[--brand-red-bright] transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-red-500/50"
                aria-label={language === 'fa' ? 'باز کردن چت هوش مصنوعی' : 'Open AI Chat'}
            >
                {isOpen ? <X size={28} /> : <Bot size={28} />}
            </button>
        </>
    );
};