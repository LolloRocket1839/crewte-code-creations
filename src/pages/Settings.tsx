import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Globe, LogOut, Check } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Currency, getCurrencySymbol } from '@/types';
import { getCurrencyFromTimezone } from '@/lib/currencyUtils';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const currencies: Currency[] = ['EUR', 'CHF', 'USD', 'GBP'];

export default function Settings() {
  const { user, signOut } = useAuth();
  const { profile, isLoading, updateProfile } = useProfile();
  
  const [fullName, setFullName] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('EUR');
  const detectedCurrency = getCurrencyFromTimezone();

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setSelectedCurrency(profile.default_currency || detectedCurrency);
    }
  }, [profile, detectedCurrency]);

  const handleSaveProfile = () => {
    updateProfile.mutate({ full_name: fullName });
  };

  const handleCurrencySelect = (currency: Currency) => {
    setSelectedCurrency(currency);
    updateProfile.mutate({ default_currency: currency });
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-2xl mx-auto page-enter">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 border-2 border-foreground bg-foreground text-background flex items-center justify-center">
            <SettingsIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wide">Impostazioni</h1>
            <p className="text-sm text-muted-foreground font-mono">Gestisci il tuo profilo</p>
          </div>
        </div>

        <div className="space-y-6 stagger-children">
          {/* Profile Section */}
          <Card className="border-2 border-foreground shadow-brutal">
            <CardHeader className="border-b-2 border-foreground pb-4">
              <CardTitle className="flex items-center gap-2 text-lg uppercase tracking-wide">
                <User className="h-5 w-5" />
                Profilo
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-xs uppercase tracking-wide font-semibold">
                  Nome Completo
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Il tuo nome"
                    className="h-12 border-2 border-foreground font-mono"
                  />
                  <Button
                    onClick={handleSaveProfile}
                    disabled={updateProfile.isPending || fullName === (profile?.full_name || '')}
                    className="h-12 px-6 border-2 border-foreground shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                  >
                    Salva
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide font-semibold">
                  Email
                </Label>
                <div className="h-12 px-4 border-2 border-foreground/30 bg-muted flex items-center font-mono text-muted-foreground">
                  {user?.email}
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  L'email non può essere modificata
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Currency Section */}
          <Card className="border-2 border-foreground shadow-brutal">
            <CardHeader className="border-b-2 border-foreground pb-4">
              <CardTitle className="flex items-center gap-2 text-lg uppercase tracking-wide">
                <Globe className="h-5 w-5" />
                Valuta Predefinita
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground font-mono mb-4">
                Seleziona la valuta predefinita per nuove spese ed entrate.
                <br />
                <span className="text-xs">
                  Rilevata automaticamente: <strong>{detectedCurrency}</strong> (fuso orario)
                </span>
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {currencies.map((currency) => (
                  <button
                    key={currency}
                    onClick={() => handleCurrencySelect(currency)}
                    className={cn(
                      'h-16 border-2 border-foreground flex flex-col items-center justify-center gap-1',
                      'font-mono font-bold transition-all duration-150',
                      'hover:bg-secondary active:scale-95',
                      'touch-target',
                      selectedCurrency === currency 
                        ? 'bg-foreground text-background shadow-none' 
                        : 'bg-background shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5'
                    )}
                    disabled={updateProfile.isPending}
                  >
                    <span className="text-xl">{getCurrencySymbol(currency)}</span>
                    <span className="text-xs uppercase">{currency}</span>
                    {selectedCurrency === currency && (
                      <Check className="h-4 w-4 absolute top-2 right-2" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Account Info Section */}
          <Card className="border-2 border-foreground shadow-brutal">
            <CardHeader className="border-b-2 border-foreground pb-4">
              <CardTitle className="text-lg uppercase tracking-wide">
                Informazioni Account
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground font-mono uppercase">Account creato</span>
                <span className="font-mono font-medium">
                  {profile?.created_at 
                    ? format(new Date(profile.created_at), 'd MMMM yyyy', { locale: it })
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground font-mono uppercase">Fuso orario</span>
                <span className="font-mono font-medium">
                  {Intl.DateTimeFormat().resolvedOptions().timeZone}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Sign Out Section */}
          <Card className="border-2 border-destructive">
            <CardContent className="py-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold uppercase tracking-wide">Esci dall'account</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    Verrai disconnesso da questo dispositivo
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={signOut}
                  className="h-12 px-6 border-2 border-destructive gap-2 shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  Esci
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
