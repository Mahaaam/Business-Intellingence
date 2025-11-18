import React, { useContext, useMemo, useState } from 'react';
// FIX: Import recharts components used in AiDashboard.
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import { AppContext } from './App';
import type { AppContextType, KpiData } from './types';
import { KpiCard, ChartCard, BarChartComponent, LineChartComponent, PieChartComponent, FilterControls } from './components';
import { Activity, DollarSign, Droplet, Wrench, ShieldAlert, BadgeCheck, FlaskConical, Users, HardHat, Warehouse, Truck, ShoppingCart, Target, TrendingUp, Wallet, BrainCircuit, Package } from 'lucide-react';
import { CUSTOMERS } from './data';

// FIX: Define CustomTooltip locally for AiDashboard chart, as it is not exported from components.tsx.
// Also added a null check for value to prevent crashes when hovering over data gaps.
const CustomTooltip = ({ active, payload, label, unit }: any) => {
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


const DashboardTitle: React.FC<{ title: string, subtitle: string }> = ({ title, subtitle }) => (
    <div className="mb-8">
        <h1 className="text-3xl font-bold text-[--brand-red-base]">{title}</h1>
        <p className="text-[--brand-red-bright]/70 mt-1">{subtitle}</p>
    </div>
);

export const ExecutiveDashboard: React.FC = () => {
    const { language, mockData } = useContext(AppContext) as AppContextType;
    const { production, finance } = mockData;

    const totalProduction = production.reduce((sum, item) => sum + item.actual, 0);
    const totalRevenue = finance.reduce((sum, item) => sum + item.revenue, 0);
    const totalProfit = finance.reduce((sum, item) => sum + item.netProfit, 0);
    const overallOee = production.reduce((sum, item) => sum + item.oee, 0) / production.length;


    const kpis: KpiData[] = [
        { title: language === 'fa' ? 'کل تولید (تن)' : 'Total Production (Tons)', value: (totalProduction / 1000).toFixed(2) + 'K', change: 5.2, description: language === 'fa' ? 'نسبت به ماه قبل' : 'vs. last month', icon: <Activity /> },
        { title: language === 'fa' ? 'درآمد کل' : 'Total Revenue', value: '$' + (totalRevenue / 1_000_000).toFixed(2) + 'M', change: 8.1, description: language === 'fa' ? 'نسبت به ماه قبل' : 'vs. last month', icon: <DollarSign /> },
        { title: language === 'fa' ? 'سود خالص' : 'Net Profit', value: '$' + (totalProfit / 1_000_000).toFixed(2) + 'M', change: 12.5, description: language === 'fa' ? 'نسبت به ماه قبل' : 'vs. last month', icon: <Wallet /> },
        { title: language === 'fa' ? 'راندمان کلی (OEE)' : 'Overall OEE', value: `${overallOee.toFixed(1)}%`, change: -1.3, description: language === 'fa' ? 'نسبت به ماه قبل' : 'vs. last month', icon: <TrendingUp /> },
    ];
    
    const productionByFactory = useMemo(() => {
        const factoryMap = new Map<string, number>();
        production.forEach(p => {
            const factory = mockData.factories.find(f => f.id === p.factoryId);
            if(factory) {
                factoryMap.set(factory.name, (factoryMap.get(factory.name) || 0) + p.actual);
            }
        });
        return Array.from(factoryMap, ([name, value]) => ({ name, 'تولید': value }));
    }, [production, mockData.factories]);
    
    const monthlyFinanceTrend = useMemo(() => {
        const monthMap = new Map<string, { revenue: number, profit: number }>();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 365);

        finance.filter(f => new Date(f.date) > thirtyDaysAgo).forEach(f => {
            const month = new Date(f.date).toLocaleString(language === 'fa' ? 'fa-IR' : 'en-US', { month: 'short' });
            const current = monthMap.get(month) || { revenue: 0, profit: 0 };
            current.revenue += f.revenue;
            current.profit += f.netProfit;
            monthMap.set(month, current);
        });
        // This is a simplified sort, for a real app a proper date sort is needed
        return Array.from(monthMap, ([name, values]) => ({ name, 'درآمد': values.revenue, 'سود': values.profit })).reverse();
    }, [finance, language]);


    return (
        <div>
            <DashboardTitle title={language === 'fa' ? 'داشبورد مدیریتی' : 'Executive Dashboard'} subtitle={language === 'fa' ? 'خلاصه عملکرد کل شرکت' : 'Overall company performance snapshot'} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {kpis.map(kpi => <KpiCard key={kpi.title} {...kpi} />)}
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title={language === 'fa' ? 'مقایسه تولید کارخانه‌ها' : 'Production by Factory'}>
                   <PieChartComponent data={productionByFactory} dataKey="تولید" nameKey="name" />
                </ChartCard>
                <ChartCard title={language === 'fa' ? 'روند درآمد و سود' : 'Revenue & Profit Trend'}>
                   <LineChartComponent data={monthlyFinanceTrend} xAxisKey="name" lineKeys={[{key: 'درآمد', color: '#8b5cf6'}, {key: 'سود', color: '#3b82f6'}]} />
                </ChartCard>
            </div>
        </div>
    );
};

export const ProductionDashboard: React.FC = () => {
    const { language, mockData } = useContext(AppContext) as AppContextType;
    const { production, factories } = mockData;

    const dailyProduction = useMemo(() => {
        const dataMap = new Map<string, { planned: number, actual: number }>();
        production.slice(0, 30).forEach(p => {
            const entry = dataMap.get(p.date) || { planned: 0, actual: 0 };
            entry.planned += p.planned;
            entry.actual += p.actual;
            dataMap.set(p.date, entry);
        });
        return Array.from(dataMap, ([date, values]) => ({ date, 'برنامه‌ریزی‌شده': values.planned, 'واقعی': values.actual })).reverse();
    }, [production]);
    
    const productionByFactory = useMemo(() => {
        return factories.map(factory => {
            const factoryProduction = production.filter(p => p.factoryId === factory.id);
            return {
                name: factory.name,
                'برنامه‌ریزی‌شده': factoryProduction.reduce((sum, p) => sum + p.planned, 0),
                'واقعی': factoryProduction.reduce((sum, p) => sum + p.actual, 0)
            }
        });
    }, [production, factories]);

    return (
        <div>
            <DashboardTitle title={language === 'fa' ? 'داشبورد تولید' : 'Production Dashboard'} subtitle={language === 'fa' ? 'تحلیل عملکرد تولید و راندمان' : 'Analysis of production performance and efficiency'} />
            <FilterControls onFilterChange={() => {}} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title={language === 'fa' ? 'تولید واقعی در مقابل برنامه‌ریزی شده (۳۰ روز اخیر)' : 'Actual vs. Planned Production (Last 30 Days)'}>
                    <LineChartComponent data={dailyProduction} xAxisKey="date" lineKeys={[{key: 'واقعی', color: '#3b82f6'}, {key: 'برنامه‌ریزی‌شده', color: '#1d4ed8'}]} />
                </ChartCard>
                <ChartCard title={language === 'fa' ? 'مقایسه تولید کارخانه‌ها' : 'Production Comparison by Factory'}>
                    <BarChartComponent data={productionByFactory} xAxisKey="name" barKeys={[{key: 'واقعی', color: '#3b82f6'}, {key: 'برنامه‌ریزی‌شده', color: '#1d4ed8'}]} />
                </ChartCard>
            </div>
        </div>
    );
};

export const FinanceDashboard: React.FC = () => {
    const { language, mockData } = useContext(AppContext) as AppContextType;
    const { finance, factories } = mockData;
    const [selectedFactory, setSelectedFactory] = useState<null | { id: number; name: string }>(null);

    const totalRevenue = useMemo(() => finance.reduce((sum, item) => sum + item.revenue, 0), [finance]);
    const totalCogs = useMemo(() => finance.reduce((sum, item) => sum + item.costOfGoods, 0), [finance]);
    const totalProfit = useMemo(() => finance.reduce((sum, item) => sum + item.netProfit, 0), [finance]);
    const grossMargin = useMemo(() => totalRevenue > 0 ? ((totalRevenue - totalCogs) / totalRevenue * 100).toFixed(1) : '0', [totalRevenue, totalCogs]);

    const kpis: KpiData[] = [
        { title: language === 'fa' ? 'درآمد کل' : 'Total Revenue', value: `$${(totalRevenue / 1_000_000).toFixed(2)}M`, change: 8.1, description: language === 'fa' ? 'نسبت به سال قبل' : 'vs. last year', icon: <TrendingUp /> },
        { title: language === 'fa' ? 'بهای تمام‌شده کالا' : 'Cost of Goods', value: `$${(totalCogs / 1_000_000).toFixed(2)}M`, change: 6.5, description: language === 'fa' ? 'نسبت به سال قبل' : 'vs. last year', icon: <Wallet /> },
        { title: language === 'fa' ? 'سود خالص' : 'Net Profit', value: `$${(totalProfit / 1_000_000).toFixed(2)}M`, change: 12.5, description: language === 'fa' ? 'نسبت به سال قبل' : 'vs. last year', icon: <DollarSign /> },
        { title: language === 'fa' ? 'حاشیه سود ناخالص' : 'Gross Margin', value: `${grossMargin}%`, change: 1.6, description: language === 'fa' ? 'نسبت به سال قبل' : 'vs. last year', icon: <TrendingUp /> },
    ];
    
    const revenueByFactory = useMemo(() => {
        return factories.map(factory => ({
            id: factory.id,
            name: factory.name,
            'درآمد': finance.filter(f => f.factoryId === factory.id).reduce((sum, f) => sum + f.revenue, 0),
            'سود': finance.filter(f => f.factoryId === factory.id).reduce((sum, f) => sum + f.netProfit, 0),
        }));
    }, [finance, factories]);

    const revenueByProductForFactory = useMemo(() => {
        if (!selectedFactory) return [];
        
        const factory = factories.find(f => f.id === selectedFactory.id);
        if (!factory) return [];

        const factoryProducts = mockData.products.filter(p => p.factoryType === factory.type);

        return factoryProducts.map(product => {
            const productFinance = finance.filter(f => f.factoryId === selectedFactory.id && f.productId === product.id);
            return {
                name: product.name,
                'درآمد': productFinance.reduce((sum, f) => sum + f.revenue, 0),
                'سود': productFinance.reduce((sum, f) => sum + f.netProfit, 0),
            };
        });
    }, [finance, mockData.products, factories, selectedFactory]);

    const costStructure = useMemo(() => {
        const totalProductionCost = totalCogs; // Simplified for demo
        return [
            { name: language === 'fa' ? 'مواد اولیه' : 'Raw Materials', value: totalProductionCost * 0.6 },
            { name: language === 'fa' ? 'انرژی' : 'Energy', value: totalProductionCost * 0.2 },
            { name: language === 'fa' ? 'نیروی انسانی' : 'Labor', value: totalProductionCost * 0.15 },
            { name: language === 'fa' ? 'سربار' : 'Overhead', value: totalProductionCost * 0.05 },
        ];
    }, [totalCogs, language]);
    
    const handleFactoryClick = (payload: any) => {
        if (payload && payload.id) {
            setSelectedFactory({ id: payload.id, name: payload.name });
        }
    };

    const handleBackClick = () => {
        setSelectedFactory(null);
    };

    return (
        <div>
            <DashboardTitle title={language === 'fa' ? 'داشبورد مالی و حسابداری' : 'Finance & Cost Dashboard'} subtitle={language === 'fa' ? 'تحلیل بهای تمام‌شده، سودآوری و عملکرد مالی' : 'Analysis of costs, profitability, and financial performance'} />
            <FilterControls onFilterChange={() => {}} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                 {kpis.map(kpi => <KpiCard key={kpi.title} {...kpi} />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard 
                     title={
                        selectedFactory 
                        ? `${language === 'fa' ? 'درآمد و سود محصولات در' : 'Product Revenue & Profit in'} ${selectedFactory.name}`
                        : (language === 'fa' ? 'درآمد و سود به تفکیک کارخانه' : 'Revenue & Profit by Factory')
                    }
                >
                    {selectedFactory && (
                         <button 
                            onClick={handleBackClick} 
                            className="absolute top-4 right-4 bg-[--brand-red-base]/50 hover:bg-[--brand-red-bright]/50 text-white text-xs font-bold py-1 px-3 rounded-full transition-colors z-10"
                            style={language === 'fa' ? { right: 'auto', left: '1rem' } : {}}
                        >
                            {language === 'fa' ? ' بازگشت' : 'Back'}
                        </button>
                    )}
                     {!selectedFactory ? (
                        <BarChartComponent 
                            data={revenueByFactory} 
                            xAxisKey="name" 
                            barKeys={[{key: 'درآمد', color: '#8b5cf6'}, {key: 'سود', color: '#3b82f6'}]}
                            onBarClick={handleFactoryClick}
                        />
                    ) : (
                        <BarChartComponent 
                            data={revenueByProductForFactory} 
                            xAxisKey="name" 
                            barKeys={[{key: 'درآمد', color: '#8b5cf6'}, {key: 'سود', color: '#3b82f6'}]} 
                        />
                    )}
                </ChartCard>
                 <ChartCard title={language === 'fa' ? 'ساختار هزینه‌ها' : 'Cost Structure'}>
                   <PieChartComponent data={costStructure} dataKey="value" nameKey="name" />
                </ChartCard>
            </div>
        </div>
    );
};

export const MaintenanceDashboard: React.FC = () => {
    const { language, mockData } = useContext(AppContext) as AppContextType;
    const { maintenance, factories } = mockData;

    const totalDowntime = useMemo(() => maintenance.reduce((sum, item) => sum + item.durationHours, 0), [maintenance]);
    const emergencyStops = useMemo(() => maintenance.filter(item => item.downtimeType === 'emergency').length, [maintenance]);
    const totalCost = useMemo(() => maintenance.reduce((sum, item) => sum + item.cost, 0), [maintenance]);

    const kpis: KpiData[] = [
        { title: language === 'fa' ? 'کل توقفات (ساعت)' : 'Total Downtime (hrs)', value: totalDowntime.toLocaleString(), change: -5, description: language === 'fa' ? 'کاهش نسبت به ماه قبل' : 'down vs. last month', icon: <Wrench /> },
        { title: language === 'fa' ? 'توقفات اضطراری' : 'Emergency Stops', value: emergencyStops.toString(), change: 10, description: language === 'fa' ? 'افزایش نسبت به ماه قبل' : 'up vs. last month', icon: <ShieldAlert /> },
        { title: language === 'fa' ? 'هزینه تعمیرات' : 'Maintenance Cost', value: `$${(totalCost / 1000).toFixed(1)}K`, change: 15, description: language === 'fa' ? 'نسبت به بودجه' : 'vs. budget', icon: <Wallet /> },
        { title: language === 'fa' ? 'شاخص MTBF (ساعت)' : 'MTBF (hrs)', value: '450', change: 2.3, description: language === 'fa' ? 'بهبود عملکرد' : 'improved performance', icon: <TrendingUp /> },
    ];

    const downtimeByType = useMemo(() => {
        const planned = maintenance.filter(m => m.downtimeType === 'planned').reduce((s, m) => s + m.durationHours, 0);
        const emergency = maintenance.filter(m => m.downtimeType === 'emergency').reduce((s, m) => s + m.durationHours, 0);
        return [
            { name: language === 'fa' ? 'برنامه‌ریزی‌شده' : 'Planned', value: planned },
            { name: language === 'fa' ? 'اضطراری' : 'Emergency', value: emergency },
        ];
    }, [maintenance, language]);

    const downtimeByFactory = useMemo(() => {
        return factories.map(factory => ({
            name: factory.name,
            'ساعات توقف': maintenance.filter(m => m.factoryId === factory.id).reduce((sum, m) => sum + m.durationHours, 0)
        }));
    }, [maintenance, factories]);

    return (
        <div>
            <DashboardTitle title={language === 'fa' ? 'داشبورد نگهداری و تعمیرات' : 'Maintenance & Reliability'} subtitle={language === 'fa' ? 'تحلیل توقفات و شاخص‌های قابلیت اطمینان' : 'Downtime analysis and reliability metrics'} />
            <FilterControls onFilterChange={() => {}} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                 {kpis.map(kpi => <KpiCard key={kpi.title} {...kpi} />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title={language === 'fa' ? 'توقفات به تفکیک نوع' : 'Downtime by Type'}>
                    <PieChartComponent data={downtimeByType} dataKey="value" nameKey="name" />
                </ChartCard>
                 <ChartCard title={language === 'fa' ? 'توقفات به تفکیک کارخانه' : 'Downtime by Factory'}>
                   <BarChartComponent data={downtimeByFactory} xAxisKey="name" barKeys={[{key: 'ساعات توقف', color: '#ec4899'}]} />
                </ChartCard>
            </div>
        </div>
    );
};

export const EnergyDashboard: React.FC = () => {
    const { language, mockData } = useContext(AppContext) as AppContextType;
    const { energy, production, products, factories } = mockData;

    const totalEnergyConsumption = useMemo(() => 
        energy.reduce((sum, item) => sum + item.energyConsumptionKwh, 0), 
    [energy]);
    
    const overallEnergyIntensity = useMemo(() => {
        const totalProduction = production.reduce((sum, item) => sum + item.actual, 0);
        return totalProduction > 0 ? (totalEnergyConsumption / totalProduction).toFixed(0) : '0';
    }, [totalEnergyConsumption, production]);

    const kpis: KpiData[] = [
        { title: language === 'fa' ? 'کل مصرف انرژی (MWh)' : 'Total Energy Use (MWh)', value: (totalEnergyConsumption / 1_000).toLocaleString(undefined, { maximumFractionDigits: 0 }), change: 2.5, description: language === 'fa' ? 'نسبت به ماه قبل' : 'vs. last month', icon: <Droplet /> },
        { title: language === 'fa' ? 'شدت انرژی (kWh/ton)' : 'Energy Intensity (kWh/ton)', value: overallEnergyIntensity, change: -1.1, description: language === 'fa' ? 'بهبود نسبت به ماه قبل' : 'improvement vs. last month', icon: <Droplet /> },
        { title: language === 'fa' ? 'هزینه انرژی' : 'Energy Cost', value: '$' + (totalEnergyConsumption * 0.12 / 1_000_000).toFixed(2) + 'M', change: 3.0, description: language === 'fa' ? 'نسبت به ماه قبل' : 'vs. last month', icon: <DollarSign /> },
        { title: language === 'fa' ? 'انتشار CO₂ (تخمین)' : 'CO₂ Emissions (Est.)', value: (totalEnergyConsumption * 0.475 / 1000).toFixed(1) + ' tCO₂e', change: 2.5, description: language === 'fa' ? 'افزایش انتشار' : 'emissions up', icon: <TrendingUp /> },
    ];

    const energyByFactory = useMemo(() => {
        return factories.map(factory => ({
            name: factory.name,
            'مصرف (MWh)': energy.filter(e => e.factoryId === factory.id).reduce((sum, e) => sum + e.energyConsumptionKwh, 0) / 1000
        }));
    }, [energy, factories]);

    const energyIntensityByProduct = useMemo(() => {
        return products.map(product => {
            const productProduction = production.filter(p => p.productId === product.id).reduce((sum, p) => sum + p.actual, 0);
            const productEnergy = energy.filter(e => e.productId === product.id).reduce((sum, e) => sum + e.energyConsumptionKwh, 0);
            return {
                name: product.name,
                'شدت (kWh/ton)': productProduction > 0 ? (productEnergy / productProduction).toFixed(0) : 0
            };
        });
    }, [energy, production, products]);


    return (
        <div>
            <DashboardTitle title={language === 'fa' ? 'داشبورد انرژی و محیط زیست' : 'Energy & Environment'} subtitle={language === 'fa' ? 'تحلیل مصرف انرژی، هزینه‌ها و انتشار آلاینده‌ها' : 'Analysis of energy consumption, costs, and emissions'} />
            <FilterControls onFilterChange={() => {}} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {kpis.map(kpi => <KpiCard key={kpi.title} {...kpi} />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title={language === 'fa' ? 'مصرف انرژی به تفکیک کارخانه' : 'Energy Consumption by Factory'}>
                   <BarChartComponent data={energyByFactory} xAxisKey="name" barKeys={[{key: 'مصرف (MWh)', color: '#10b981'}]} tooltipUnit="MWh" />
                </ChartCard>
                <ChartCard title={language === 'fa' ? 'شدت انرژی به تفکیک محصول' : 'Energy Intensity by Product'}>
                   <BarChartComponent data={energyIntensityByProduct} xAxisKey="name" barKeys={[{key: 'شدت (kWh/ton)', color: '#f97316'}]} tooltipUnit="kWh/ton" />
                </ChartCard>
            </div>
        </div>
    );
};

export const QualityDashboard: React.FC = () => {
    const { language, mockData } = useContext(AppContext) as AppContextType;
    const { quality, factories } = mockData;

    const avgRejectionRate = useMemo(() => quality.reduce((sum, item) => sum + item.rejectionRate, 0) / quality.length, [quality]);
    const avgCpkIndex = useMemo(() => quality.reduce((sum, item) => sum + item.cpkIndex, 0) / quality.length, [quality]);
    const avgLabTime = useMemo(() => quality.reduce((sum, item) => sum + item.labTurnaroundTimeHours, 0) / quality.length, [quality]);
    
    const kpis: KpiData[] = [
        { title: language === 'fa' ? 'نرخ مردودی' : 'Rejection Rate', value: `${avgRejectionRate.toFixed(2)}%`, change: -0.5, description: language === 'fa' ? 'بهبود کیفیت' : 'quality improved', icon: <BadgeCheck /> },
        { title: language === 'fa' ? 'شاخص Cpk' : 'Cpk Index', value: avgCpkIndex.toFixed(2), change: 0.1, description: language === 'fa' ? 'پایداری فرآیند' : 'process stability', icon: <Target /> },
        { title: language === 'fa' ? 'زمان پاسخ آزمایشگاه' : 'Lab Turnaround', value: `${avgLabTime.toFixed(1)}h`, change: -2, description: language === 'fa' ? 'کاهش زمان' : 'time reduced', icon: <FlaskConical /> },
        { title: language === 'fa' ? 'انحراف از استاندارد' : 'Standard Deviation', value: '0.8%', change: 0.2, description: language === 'fa' ? 'افزایش جزئی' : 'slight increase', icon: <TrendingUp /> },
    ];

    const rejectionByFactory = useMemo(() => {
        return factories.map(factory => {
            const factoryQuality = quality.filter(q => q.factoryId === factory.id);
            const avgRejection = factoryQuality.reduce((sum, q) => sum + q.rejectionRate, 0) / factoryQuality.length;
            return { name: factory.name, 'نرخ مردودی (%)': avgRejection.toFixed(2) };
        });
    }, [quality, factories]);

    const cpkByFactory = useMemo(() => {
        return factories.map(factory => {
            const factoryQuality = quality.filter(q => q.factoryId === factory.id);
            const avgCpk = factoryQuality.reduce((sum, q) => sum + q.cpkIndex, 0) / factoryQuality.length;
            return { name: factory.name, 'شاخص Cpk': avgCpk.toFixed(2) };
        });
    }, [quality, factories]);

    return (
        <div>
            <DashboardTitle title={language === 'fa' ? 'داشبورد کنترل کیفیت' : 'Quality Control Dashboard'} subtitle={language === 'fa' ? 'شاخص‌های کیفیت محصول و فرآیند' : 'Product and process quality metrics'} />
            <FilterControls onFilterChange={() => {}} />
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {kpis.map(kpi => <KpiCard key={kpi.title} {...kpi} />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title={language === 'fa' ? 'نرخ مردودی به تفکیک کارخانه' : 'Rejection Rate by Factory'}>
                    <BarChartComponent data={rejectionByFactory} xAxisKey="name" barKeys={[{key: 'نرخ مردودی (%)', color: '#FF0000'}]} tooltipUnit="%" />
                </ChartCard>
                <ChartCard title={language === 'fa' ? 'شاخص Cpk به تفکیک کارخانه' : 'Cpk Index by Factory'}>
                    <BarChartComponent data={cpkByFactory} xAxisKey="name" barKeys={[{key: 'شاخص Cpk', color: '#3b82f6'}]} />
                </ChartCard>
            </div>
        </div>
    );
};

export const HrDashboard: React.FC = () => {
    const { language, mockData } = useContext(AppContext) as AppContextType;
    const { hr, factories } = mockData;
    
    // Get latest data for each factory
    const latestHrData = factories.map(f => {
      const factoryData = hr.filter(h => h.factoryId === f.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return factoryData[0];
    }).filter(Boolean);


    const totalEmployees = latestHrData.reduce((sum, item) => sum + item.employeeCount, 0);
    const avgAbsenteeism = latestHrData.reduce((sum, item) => sum + item.absenteeismRate, 0) / latestHrData.length;
    const totalIncidents = hr.reduce((sum, item) => sum + item.safetyIncidents, 0);

    const kpis: KpiData[] = [
        { title: language === 'fa' ? 'تعداد کل پرسنل' : 'Total Employees', value: totalEmployees.toLocaleString(), change: 1.2, description: language === 'fa' ? 'رشد سالانه' : 'annual growth', icon: <Users /> },
        { title: language === 'fa' ? 'نرخ غیبت' : 'Absenteeism Rate', value: `${avgAbsenteeism.toFixed(2)}%`, change: -0.3, description: language === 'fa' ? 'کاهش ماهانه' : 'monthly decrease', icon: <TrendingUp /> },
        { title: language === 'fa' ? 'حوادث کاری' : 'Safety Incidents', value: totalIncidents.toString(), change: -5, description: language === 'fa' ? 'کاهش در سال جاری' : 'down this year', icon: <HardHat /> },
        { title: language === 'fa' ? 'بهره‌وری (تولید/نفر)' : 'Productivity', value: '1.2M Ton/Emp', change: 4.1, description: language === 'fa' ? 'افزایش نسبت به سال قبل' : 'up vs. last year', icon: <Activity /> },
    ];
    
    const employeesByFactory = useMemo(() => {
        return latestHrData.map(h => ({
          name: factories.find(f => f.id === h.factoryId)?.name || 'Unknown',
          'تعداد پرسنل': h.employeeCount
        }));
    }, [latestHrData, factories]);

    const incidentsByFactory = useMemo(() => {
       return factories.map(factory => ({
            name: factory.name,
            'تعداد حوادث': hr.filter(h => h.factoryId === factory.id).reduce((sum, h) => sum + h.safetyIncidents, 0)
        }));
    }, [hr, factories]);

    return (
        <div>
            <DashboardTitle title={language === 'fa' ? 'داشبورد منابع انسانی' : 'Human Resources Dashboard'} subtitle={language === 'fa' ? 'تحلیل نیروی کار و شاخص‌های منابع انسانی' : 'Workforce analysis and HR metrics'} />
            <FilterControls onFilterChange={() => {}} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {kpis.map(kpi => <KpiCard key={kpi.title} {...kpi} />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title={language === 'fa' ? 'تعداد پرسنل در هر کارخانه' : 'Employees per Factory'}>
                   <PieChartComponent data={employeesByFactory} dataKey="تعداد پرسنل" nameKey="name" />
                </ChartCard>
                <ChartCard title={language === 'fa' ? 'تعداد حوادث کاری در هر کارخانه' : 'Safety Incidents per Factory'}>
                   <BarChartComponent data={incidentsByFactory} xAxisKey="name" barKeys={[{key: 'تعداد حوادث', color: '#f59e0b'}]} />
                </ChartCard>
            </div>
        </div>
    );
};

export const SupplyChainDashboard: React.FC = () => {
    const { language, mockData } = useContext(AppContext) as AppContextType;
    const { supplyChain, factories } = mockData;

    const latestSupplyData = factories.map(f => {
      const factoryData = supplyChain.filter(s => s.factoryId === f.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return factoryData[0];
    }).filter(Boolean);
    
    const totalRawMaterial = latestSupplyData.reduce((sum, item) => sum + item.rawMaterialInventoryTon, 0);
    const totalFinishedGoods = latestSupplyData.reduce((sum, item) => sum + item.finishedGoodsInventoryTon, 0);
    const avgOnTimeDelivery = latestSupplyData.reduce((sum, item) => sum + item.supplierOnTimeDeliveryRate, 0) / latestSupplyData.length;

    const kpis: KpiData[] = [
        { title: language === 'fa' ? 'موجودی مواد اولیه (تن)' : 'Raw Material Inv. (Tons)', value: `${(totalRawMaterial / 1000).toFixed(1)}K`, change: -2.5, description: language === 'fa' ? 'مصرف ماهانه' : 'monthly consumption', icon: <Warehouse /> },
        { title: language === 'fa' ? 'موجودی محصول نهایی (تن)' : 'Finished Goods Inv. (Tons)', value: `${(totalFinishedGoods / 1000).toFixed(1)}K`, change: 3.1, description: language === 'fa' ? 'افزایش موجودی' : 'inventory increase', icon: <Package /> },
        { title: language === 'fa' ? 'نرخ تحویل به‌موقع' : 'On-Time Delivery', value: `${avgOnTimeDelivery.toFixed(1)}%`, change: 1.1, description: language === 'fa' ? 'عملکرد تأمین‌کنندگان' : 'supplier performance', icon: <Truck /> },
        { title: language === 'fa' ? 'هزینه حمل و نقل' : 'Transport Cost', value: '$2.1M', change: 8, description: language === 'fa' ? 'افزایش ماهانه' : 'monthly increase', icon: <Wallet /> },
    ];

    const inventoryByFactory = useMemo(() => {
       return latestSupplyData.map(s => ({
            name: factories.find(f => f.id === s.factoryId)?.name || 'Unknown',
            'مواد اولیه': s.rawMaterialInventoryTon,
            'محصول نهایی': s.finishedGoodsInventoryTon
        }));
    }, [latestSupplyData, factories]);

    const onTimeDeliveryByFactory = useMemo(() => {
        return factories.map(factory => {
            const factorySupply = supplyChain.filter(s => s.factoryId === factory.id);
            const avgDelivery = factorySupply.reduce((sum, s) => sum + s.supplierOnTimeDeliveryRate, 0) / factorySupply.length;
            return { name: factory.name, 'نرخ تحویل به‌موقع (%)': avgDelivery.toFixed(1) };
        });
    }, [supplyChain, factories]);

    return (
        <div>
            <DashboardTitle title={language === 'fa' ? 'داشبورد زنجیره تأمین' : 'Supply Chain Dashboard'} subtitle={language === 'fa' ? 'مدیریت موجودی، تأمین‌کنندگان و لجستیک' : 'Inventory, supplier, and logistics management'} />
            <FilterControls onFilterChange={() => {}} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {kpis.map(kpi => <KpiCard key={kpi.title} {...kpi} />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <ChartCard title={language === 'fa' ? 'موجودی انبارها به تفکیک کارخانه' : 'Inventory by Factory'}>
                   <BarChartComponent data={inventoryByFactory} xAxisKey="name" barKeys={[{key: 'مواد اولیه', color: '#a855f7'}, {key: 'محصول نهایی', color: '#10b981'}]} tooltipUnit="تن" />
                </ChartCard>
                 <ChartCard title={language === 'fa' ? 'عملکرد تأمین‌کنندگان (تحویل به‌موقع)' : 'Supplier On-Time Delivery Performance'}>
                   <BarChartComponent data={onTimeDeliveryByFactory} xAxisKey="name" barKeys={[{key: 'نرخ تحویل به‌موقع (%)', color: '#22c55e'}]} tooltipUnit="%" />
                </ChartCard>
            </div>
        </div>
    );
};

export const SalesDashboard: React.FC = () => {
    const { language, mockData } = useContext(AppContext) as AppContextType;
    const { sales, products } = mockData;

    const totalSales = useMemo(() => sales.reduce((sum, s) => sum + s.revenue, 0), [sales]);
    const totalUnitsSold = useMemo(() => sales.reduce((sum, s) => sum + s.unitsSold, 0), [sales]);

    const kpis: KpiData[] = [
        { title: language === 'fa' ? 'فروش کل' : 'Total Sales', value: `$${(totalSales / 1_000_000).toFixed(2)}M`, change: 9.2, description: language === 'fa' ? 'نسبت به سال قبل' : 'vs. last year', icon: <ShoppingCart /> },
        { title: language === 'fa' ? 'واحدهای فروخته‌شده' : 'Units Sold', value: `${(totalUnitsSold / 1000).toFixed(1)}K`, change: 7.5, description: language === 'fa' ? 'نسبت به سال قبل' : 'vs. last year', icon: <Package /> },
        { title: language === 'fa' ? 'میانگین سود هر مشتری' : 'Avg. Profit/Customer', value: '$1.2M', change: 3.5, description: language === 'fa' ? 'بهبود عملکرد' : 'improved performance', icon: <DollarSign /> },
        { title: language === 'fa' ? 'نرخ فروش صادراتی' : 'Export Sales Rate', value: '40%', change: 5, description: language === 'fa' ? 'رشد در بازارهای جدید' : 'growth in new markets', icon: <TrendingUp /> },
    ];
    
    const salesByRegion = useMemo(() => {
        const domestic = sales.filter(s => s.region === 'Domestic').reduce((sum, s) => sum + s.revenue, 0);
        const exportSales = sales.filter(s => s.region === 'Export').reduce((sum, s) => sum + s.revenue, 0);
        return [
            { name: language === 'fa' ? 'داخلی' : 'Domestic', value: domestic },
            { name: language === 'fa' ? 'صادرات' : 'Export', value: exportSales },
        ];
    }, [sales, language]);

    const salesByCustomer = useMemo(() => {
        const customerMap = new Map<string, number>();
        sales.forEach(s => {
            const customerName = CUSTOMERS.find(c => c.id === s.customerId)?.name || 'Unknown';
            customerMap.set(customerName, (customerMap.get(customerName) || 0) + s.revenue);
        });
        return Array.from(customerMap, ([name, value]) => ({ name, 'درآمد': value })).sort((a,b) => b['درآمد'] - a['درآمد']);
    }, [sales]);

    return (
        <div>
            <DashboardTitle title={language === 'fa' ? 'داشبورد فروش' : 'Sales Dashboard'} subtitle={language === 'fa' ? 'تحلیل عملکرد فروش و مشتریان' : 'Sales performance and customer analysis'} />
            <FilterControls onFilterChange={() => {}} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {kpis.map(kpi => <KpiCard key={kpi.title} {...kpi} />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title={language === 'fa' ? 'فروش به تفکیک منطقه' : 'Sales by Region'}>
                    <PieChartComponent data={salesByRegion} dataKey="value" nameKey="name" />
                </ChartCard>
                <ChartCard title={language === 'fa' ? 'فروش به تفکیک مشتری' : 'Sales by Customer'}>
                    <BarChartComponent data={salesByCustomer.slice(0, 5)} xAxisKey="name" barKeys={[{key: 'درآمد', color: '#f97316'}]} />
                </ChartCard>
            </div>
        </div>
    );
};

export const AiDashboard: React.FC = () => {
    const { language, mockData } = useContext(AppContext) as AppContextType;

    const historicalProduction = useMemo(() => {
        const dataMap = new Map<string, number>();
        mockData.production.slice(0, 90).forEach(p => {
             const month = new Date(p.date).toLocaleString('default', { month: 'short' });
             dataMap.set(month, (dataMap.get(month) || 0) + p.actual);
        });
        return Array.from(dataMap, ([name, value]) => ({ name, 'تولید واقعی': value })).reverse();
    }, [mockData.production]);
    
    const forecastedProduction = useMemo(() => {
       const lastValue = historicalProduction[historicalProduction.length - 1]?.['تولید واقعی'] || 25000;
       return [
            { name: language === 'fa' ? 'ماه بعد' : 'Next Month', 'تولید پیش‌بینی': lastValue * 1.05 },
            { name: language === 'fa' ? 'دو ماه بعد' : 'In 2 Months', 'تولید پیش‌بینی': lastValue * 1.08 },
            { name: language === 'fa' ? 'سه ماه بعد' : 'In 3 Months', 'تولید پیش‌بینی': lastValue * 1.12 },
       ]
    }, [historicalProduction, language]);

    const combinedData = useMemo(() => {
        const combined = historicalProduction.map(h => ({ ...h, 'تولید پیش‌بینی': null }));
        const lastHistorical = combined[combined.length - 1];
        const forecastStart = { ...forecastedProduction[0], name: lastHistorical.name, 'تولید واقعی': null, 'تولید پیش‌بینی': lastHistorical['تولید واقعی'] };
        return [...combined, ...forecastedProduction.slice(1)];
    }, [historicalProduction, forecastedProduction]);


    return (
        <div>
            <DashboardTitle title={language === 'fa' ? 'داشبورد هوش مصنوعی و پیش‌بینی' : 'AI & Predictive Dashboard'} subtitle={language === 'fa' ? 'پیش‌بینی تقاضا، خرابی‌ها و بهینه‌سازی' : 'Demand forecasting, failure prediction, and optimization'} />
            <div className="grid grid-cols-1 gap-6">
                <ChartCard title={language === 'fa' ? 'پیش‌بینی تولید ماهانه' : 'Monthly Production Forecast'}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={combinedData}>
                           <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.2)" />
                           <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                           <YAxis stroke="rgba(255,255,255,0.5)" />
                           <Tooltip content={<CustomTooltip />} />
                           <Legend />
                           <Line type="monotone" dataKey="تولید واقعی" stroke="#3b82f6" strokeWidth={2} />
                           <Line type="monotone" dataKey="تولید پیش‌بینی" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
        </div>
    );
};

export const PrivacyPolicy: React.FC = () => {
    const { language } = useContext(AppContext) as AppContextType;
    const policyTextEn = `
        <h2 class="text-2xl font-bold text-[--brand-red-bright] mb-4">Privacy Policy</h2>
        <p class="mb-4">Your privacy is important to us. It is TOMM's policy to respect your privacy regarding any information we may collect from you across our website.</p>
        <p class="mb-4">We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.</p>
        <p class="mb-4">We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.</p>
        <p class="mb-4">We don’t share any personally identifying information publicly or with third-parties, except when required to by law.</p>
        <p class="mb-4">Our website may link to external sites that are not operated by us. Please be aware that we have no control over the content and practices of these sites, and cannot accept responsibility or liability for their respective privacy policies.</p>
        <p>This policy is effective as of 1 December 2024.</p>
    `;

    const policyTextFa = `
        <h2 class="text-2xl font-bold text-[--brand-red-bright] mb-4">سیاست حفظ حریم خصوصی</h2>
        <p class="mb-4">حریم خصوصی شما برای ما مهم است. این سیاست TOMM است که به حریم خصوصی شما در مورد هرگونه اطلاعاتی که ممکن است از شما در وب سایت خود جمع آوری کنیم، احترام بگذاریم.</p>
        <p class="mb-4">ما فقط زمانی اطلاعات شخصی را درخواست می کنیم که واقعاً برای ارائه خدمات به شما به آن نیاز داشته باشیم. ما آن را با روش های منصفانه و قانونی، با اطلاع و رضایت شما جمع آوری می کنیم. ما همچنین به شما اطلاع می دهیم که چرا آن را جمع آوری می کنیم و چگونه از آن استفاده خواهد شد.</p>
        <p class="mb-4">ما اطلاعات جمع آوری شده را فقط تا زمانی که برای ارائه خدمات درخواستی شما ضروری است، نگهداری می کنیم. داده هایی که ما ذخیره می کنیم، در چارچوب ابزارهای قابل قبول تجاری برای جلوگیری از از دست دادن و سرقت، و همچنین دسترسی، افشا، کپی، استفاده یا تغییر غیرمجاز محافظت خواهیم کرد.</p>
        <p class="mb-4">ما هیچ گونه اطلاعات شناسایی شخصی را به صورت عمومی یا با اشخاص ثالث به اشتراک نمی گذاریم، مگر در مواردی که قانون ایجاب کند.</p>
        <p class="mb-4">وب سایت ما ممکن است به سایت های خارجی که توسط ما اداره نمی شوند، پیوند داشته باشد. لطفاً توجه داشته باشید که ما هیچ کنترلی بر محتوا و شیوه های این سایت ها نداریم و نمی توانیم مسئولیت یا تعهدی در قبال سیاست های حفظ حریم خصوصی مربوطه آنها بپذیریم.</p>
        <p>این سیاست از تاریخ ۱ دسامبر ۲۰۲۴ لازم الاجرا است.</p>
    `;

    return (
        <div>
            <DashboardTitle title={language === 'fa' ? 'سیاست حفظ حریم خصوصی' : 'Privacy Policy'} subtitle={language === 'fa' ? 'تعهد ما به حفاظت از داده‌های شما' : 'Our commitment to protecting your data'} />
            <div 
                className="prose prose-invert max-w-none bg-slate-900/40 p-6 rounded-lg text-gray-300"
                dangerouslySetInnerHTML={{ __html: language === 'fa' ? policyTextFa : policyTextEn }}
            />
        </div>
    );
};