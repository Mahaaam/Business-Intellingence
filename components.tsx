import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from './App';
import type { AppContextType } from './types';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChevronUp, ChevronDown, Menu, X, Globe, Briefcase, DollarSign, Settings, Droplet, CheckSquare, Users, Truck, ShoppingCart, BrainCircuit, Activity, Wrench, ShieldAlert, BadgeCheck, FlaskConical, HardHat, Warehouse, Package, Target, TrendingUp, Wallet } from 'lucide-react';

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

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-md p-3 rounded-lg border border-blue-500/30">
        <p className="label text-blue-300">{`${label}`}</p>
        {payload.map((pld: any) => (
          <p key={pld.dataKey} style={{ color: pld.color }}>
            {`${pld.name}: ${pld.value.toLocaleString()}${unit ? ` ${unit}` : ''}`}
          </p>
        ))}
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