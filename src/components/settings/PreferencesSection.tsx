
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PreferencesSectionProps {
  currency: string;
  darkMode: boolean;
  onCurrencyChange: (value: string) => void;
  onDarkModeToggle: (checked: boolean) => void;
  onExportData: () => void;
}

const PreferencesSection = ({
  currency,
  darkMode,
  onCurrencyChange,
  onDarkModeToggle
}: PreferencesSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>
          Customize your application settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="currency">Currency</Label>
            <p className="text-sm text-muted-foreground">
              Choose your preferred currency
            </p>
          </div>
          <Select value={currency} onValueChange={onCurrencyChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="₹">₹ (INR)</SelectItem>
              <SelectItem value="$">$ (USD)</SelectItem>
              <SelectItem value="€">€ (EUR)</SelectItem>
              <SelectItem value="£">£ (GBP)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="dark-mode">Dark Mode</Label>
            <p className="text-sm text-muted-foreground">
              Enable dark theme for the application
            </p>
          </div>
          <Switch 
            id="dark-mode" 
            checked={darkMode} 
            onCheckedChange={onDarkModeToggle} 
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PreferencesSection;
