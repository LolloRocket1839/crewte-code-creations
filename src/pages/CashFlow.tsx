import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useRevenues } from '@/hooks/useRevenues';
import { useExpenses } from '@/hooks/useExpenses';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { getCurrencySymbol, Currency } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { addMonths, format, startOfMonth } from 'date-fns';
import { it } from 'date-fns/locale';

type TimeRange = '3' | '6' | '12';

const chartConfig = {
  revenues: {
    label: 'Entrate',
    color: 'hsl(var(--chart-2))',
  },
  expenses: {
    label: 'Spese',
    color: 'hsl(var(--chart-1))',
  },
  cashFlow: {
    label: 'Flusso di Cassa',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

export default function CashFlow() {
  const [timeRange, setTimeRange] = useState<TimeRange>('6');
  const { revenues } = useRevenues();
  const { expenses } = useExpenses();
  const { defaultCurrency } = useUserCurrency();

  const formatCurrency = (amount: number, currency: Currency = defaultCurrency) => {
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${Math.abs(amount).toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // Calculate projected cash flow
  const projections = useMemo(() => {
    const months = parseInt(timeRange);
    const now = new Date();
    const monthlyData: { month: string; revenues: number; expenses: number; cashFlow: number; monthDate: Date }[] = [];

    // Get recurring revenues
    const recurringRevenues = revenues.filter(r => r.is_recurring);
    
    // Calculate average monthly expenses (since expenses don't have recurring flag yet)
    const totalExpenseAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const avgMonthlyExpense = expenses.length > 0 ? totalExpenseAmount / Math.max(1, new Set(expenses.map(e => e.date.slice(0, 7))).size) : 0;

    for (let i = 0; i < months; i++) {
      const monthDate = addMonths(startOfMonth(now), i);
      const monthKey = format(monthDate, 'MMM yyyy', { locale: it });
      
      // Calculate projected revenues for this month
      let monthlyRevenue = 0;
      recurringRevenues.forEach(r => {
        const amount = Number(r.amount);
        switch (r.recurrence_type) {
          case 'monthly':
            monthlyRevenue += amount;
            break;
          case 'quarterly':
            // Add if this is a quarter month (every 3 months from original date)
            const originalMonth = new Date(r.date).getMonth();
            const targetMonth = monthDate.getMonth();
            if ((targetMonth - originalMonth + 12) % 3 === 0) {
              monthlyRevenue += amount;
            }
            break;
          case 'yearly':
            // Add if this is the anniversary month
            const originalDate = new Date(r.date);
            if (originalDate.getMonth() === monthDate.getMonth()) {
              monthlyRevenue += amount;
            }
            break;
        }
      });

      // Use average monthly expense as projection
      const monthlyExpense = avgMonthlyExpense;
      
      monthlyData.push({
        month: monthKey,
        revenues: Math.round(monthlyRevenue),
        expenses: Math.round(monthlyExpense),
        cashFlow: Math.round(monthlyRevenue - monthlyExpense),
        monthDate,
      });
    }

    return monthlyData;
  }, [revenues, expenses, timeRange]);

  // Calculate totals for the projection period
  const totals = useMemo(() => {
    const totalRevenues = projections.reduce((sum, p) => sum + p.revenues, 0);
    const totalExpenses = projections.reduce((sum, p) => sum + p.expenses, 0);
    const netCashFlow = totalRevenues - totalExpenses;
    const avgMonthlyCashFlow = projections.length > 0 ? netCashFlow / projections.length : 0;
    
    return { totalRevenues, totalExpenses, netCashFlow, avgMonthlyCashFlow };
  }, [projections]);

  // Get current recurring summary
  const recurringSummary = useMemo(() => {
    const monthlyRecurring = revenues
      .filter(r => r.is_recurring && r.recurrence_type === 'monthly')
      .reduce((sum, r) => sum + Number(r.amount), 0);
    
    const quarterlyRecurring = revenues
      .filter(r => r.is_recurring && r.recurrence_type === 'quarterly')
      .reduce((sum, r) => sum + Number(r.amount), 0);
    
    const yearlyRecurring = revenues
      .filter(r => r.is_recurring && r.recurrence_type === 'yearly')
      .reduce((sum, r) => sum + Number(r.amount), 0);

    return { monthlyRecurring, quarterlyRecurring, yearlyRecurring };
  }, [revenues]);

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">
              Previsione Flusso di Cassa
            </h1>
            <p className="text-sm text-muted-foreground uppercase tracking-wide mt-1">
              Proiezioni basate su entrate ricorrenti e spese medie
            </p>
          </div>
          
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)} className="w-full md:w-auto">
            <TabsList className="grid w-full grid-cols-3 border-2 border-border">
              <TabsTrigger value="3" className="uppercase text-xs font-semibold">3 Mesi</TabsTrigger>
              <TabsTrigger value="6" className="uppercase text-xs font-semibold">6 Mesi</TabsTrigger>
              <TabsTrigger value="12" className="uppercase text-xs font-semibold">12 Mesi</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-2 border-border shadow-brutal">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 border-2 border-border bg-chart-2/20 flex items-center justify-center">
                  <ArrowUpRight className="h-5 w-5 text-chart-2" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Entrate Previste</p>
                  <p className="text-xl font-bold">{formatCurrency(totals.totalRevenues)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-border shadow-brutal">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 border-2 border-border bg-chart-1/20 flex items-center justify-center">
                  <ArrowDownRight className="h-5 w-5 text-chart-1" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Spese Previste</p>
                  <p className="text-xl font-bold">{formatCurrency(totals.totalExpenses)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-border shadow-brutal">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-10 w-10 border-2 border-border flex items-center justify-center",
                  totals.netCashFlow >= 0 ? "bg-chart-2/20" : "bg-destructive/20"
                )}>
                  {totals.netCashFlow >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-chart-2" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-destructive" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Flusso Netto</p>
                  <p className={cn(
                    "text-xl font-bold",
                    totals.netCashFlow >= 0 ? "text-chart-2" : "text-destructive"
                  )}>
                    {totals.netCashFlow >= 0 ? '+' : '-'}{formatCurrency(totals.netCashFlow)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-border shadow-brutal">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 border-2 border-border bg-chart-3/20 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-chart-3" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Media Mensile</p>
                  <p className={cn(
                    "text-xl font-bold",
                    totals.avgMonthlyCashFlow >= 0 ? "text-chart-2" : "text-destructive"
                  )}>
                    {totals.avgMonthlyCashFlow >= 0 ? '+' : '-'}{formatCurrency(totals.avgMonthlyCashFlow)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cash Flow Chart */}
        <Card className="border-2 border-border shadow-brutal">
          <CardHeader className="border-b-2 border-border">
            <CardTitle className="uppercase tracking-wide text-sm">Proiezione Flusso di Cassa</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart data={projections} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 10 }} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10 }} 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Area
                  type="monotone"
                  dataKey="revenues"
                  name="Entrate"
                  stackId="1"
                  stroke="hsl(var(--chart-2))"
                  fill="hsl(var(--chart-2))"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="cashFlow"
                  name="Flusso Netto"
                  stroke="hsl(var(--chart-3))"
                  fill="hsl(var(--chart-3))"
                  fillOpacity={0.5}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Monthly Breakdown */}
        <Card className="border-2 border-border shadow-brutal">
          <CardHeader className="border-b-2 border-border">
            <CardTitle className="uppercase tracking-wide text-sm">Entrate vs Spese per Mese</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={projections} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 10 }} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10 }} 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="revenues" name="Entrate" fill="hsl(var(--chart-2))" radius={0} />
                <Bar dataKey="expenses" name="Spese" fill="hsl(var(--chart-1))" radius={0} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recurring Revenue Summary */}
        <Card className="border-2 border-border shadow-brutal">
          <CardHeader className="border-b-2 border-border">
            <CardTitle className="uppercase tracking-wide text-sm">Riepilogo Entrate Ricorrenti</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border-2 border-border p-4 bg-muted/20">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Mensili</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(recurringSummary.monthlyRecurring)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  = {formatCurrency(recurringSummary.monthlyRecurring * 12)}/anno
                </p>
              </div>
              <div className="border-2 border-border p-4 bg-muted/20">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Trimestrali</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(recurringSummary.quarterlyRecurring)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  = {formatCurrency(recurringSummary.quarterlyRecurring * 4)}/anno
                </p>
              </div>
              <div className="border-2 border-border p-4 bg-muted/20">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Annuali</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(recurringSummary.yearlyRecurring)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  = {formatCurrency(recurringSummary.yearlyRecurring / 12)}/mese
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Detail Table */}
        <Card className="border-2 border-border shadow-brutal">
          <CardHeader className="border-b-2 border-border">
            <CardTitle className="uppercase tracking-wide text-sm">Dettaglio Mensile</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-border bg-muted/30">
                    <th className="text-left p-3 text-xs uppercase tracking-wide font-semibold">Mese</th>
                    <th className="text-right p-3 text-xs uppercase tracking-wide font-semibold">Entrate</th>
                    <th className="text-right p-3 text-xs uppercase tracking-wide font-semibold">Spese</th>
                    <th className="text-right p-3 text-xs uppercase tracking-wide font-semibold">Flusso Netto</th>
                  </tr>
                </thead>
                <tbody>
                  {projections.map((row, i) => (
                    <tr key={row.month} className={cn(
                      "border-b border-border",
                      i % 2 === 0 ? "bg-background" : "bg-muted/10"
                    )}>
                      <td className="p-3 font-medium uppercase text-sm">{row.month}</td>
                      <td className="p-3 text-right text-chart-2 font-semibold">{formatCurrency(row.revenues)}</td>
                      <td className="p-3 text-right text-chart-1 font-semibold">{formatCurrency(row.expenses)}</td>
                      <td className={cn(
                        "p-3 text-right font-bold",
                        row.cashFlow >= 0 ? "text-chart-2" : "text-destructive"
                      )}>
                        {row.cashFlow >= 0 ? '+' : ''}{formatCurrency(row.cashFlow)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/30 border-t-2 border-border">
                    <td className="p-3 font-bold uppercase text-sm">Totale</td>
                    <td className="p-3 text-right text-chart-2 font-bold">{formatCurrency(totals.totalRevenues)}</td>
                    <td className="p-3 text-right text-chart-1 font-bold">{formatCurrency(totals.totalExpenses)}</td>
                    <td className={cn(
                      "p-3 text-right font-bold text-lg",
                      totals.netCashFlow >= 0 ? "text-chart-2" : "text-destructive"
                    )}>
                      {totals.netCashFlow >= 0 ? '+' : ''}{formatCurrency(totals.netCashFlow)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
