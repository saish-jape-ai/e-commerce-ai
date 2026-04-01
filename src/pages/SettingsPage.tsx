import { useState } from 'react';
import { Bell, Globe, Moon, Sun, Shield, Eye, Smartphone, Mail, Lock, ChevronRight, LogOut, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface SettingToggle {
  id: string;
  label: string;
  desc: string;
  icon: React.ElementType;
  enabled: boolean;
}

const SettingsPage = () => {
  const [notifications, setNotifications] = useState<SettingToggle[]>([
    { id: 'email_orders', label: 'Order Updates', desc: 'Get notified about your order status via email', icon: Mail, enabled: true },
    { id: 'email_offers', label: 'Offers & Promotions', desc: 'Receive deals, coupons, and personalized offers', icon: Mail, enabled: true },
    { id: 'push_orders', label: 'Push Notifications', desc: 'Real-time order alerts on your device', icon: Smartphone, enabled: false },
    { id: 'sms', label: 'SMS Alerts', desc: 'Delivery updates and OTP via SMS', icon: Smartphone, enabled: true },
  ]);

  const [privacy, setPrivacy] = useState<SettingToggle[]>([
    { id: 'personalized', label: 'Personalized Recommendations', desc: 'Allow AI to analyze your browsing for better suggestions', icon: Eye, enabled: true },
    { id: 'analytics', label: 'Usage Analytics', desc: 'Help us improve by sharing anonymous usage data', icon: Shield, enabled: false },
    { id: 'two_factor', label: 'Two-Factor Authentication', desc: 'Add extra security with OTP verification', icon: Lock, enabled: false },
  ]);

  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('INR');

  const toggleSetting = (list: SettingToggle[], setList: React.Dispatch<React.SetStateAction<SettingToggle[]>>, id: string) => {
    setList(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
    toast.success('Setting updated');
  };

  const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-primary' : 'bg-border'}`}>
      <motion.div animate={{ x: enabled ? 20 : 2 }} className="absolute top-1 w-4 h-4 bg-background rounded-full shadow-sm" />
    </button>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground font-body mb-8">Manage your account preferences and notifications</p>
      </motion.div>

      <div className="max-w-2xl mx-auto space-y-8">
        {/* Appearance */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <h2 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
            <Sun size={20} /> Appearance
          </h2>
          <div className="bg-card border border-border rounded-2xl divide-y divide-border">
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon size={18} className="text-primary" /> : <Sun size={18} className="text-primary" />}
                <div>
                  <p className="text-sm font-semibold text-foreground font-body">Dark Mode</p>
                  <p className="text-xs text-muted-foreground font-body">Switch to dark theme for comfortable viewing</p>
                </div>
              </div>
              <ToggleSwitch enabled={darkMode} onToggle={() => { setDarkMode(!darkMode); toast.info('Dark mode coming soon!'); }} />
            </div>
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground font-body">Language</p>
                  <p className="text-xs text-muted-foreground font-body">Choose your preferred language</p>
                </div>
              </div>
              <select value={language} onChange={e => setLanguage(e.target.value)} className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background font-body outline-none">
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="ta">தமிழ்</option>
                <option value="te">తెలుగు</option>
                <option value="bn">বাংলা</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground font-body">Currency</p>
                  <p className="text-xs text-muted-foreground font-body">Select display currency</p>
                </div>
              </div>
              <select value={currency} onChange={e => setCurrency(e.target.value)} className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background font-body outline-none">
                <option value="INR">₹ INR</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
                <option value="GBP">£ GBP</option>
              </select>
            </div>
          </div>
        </motion.section>

        {/* Notifications */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h2 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
            <Bell size={20} /> Notifications
          </h2>
          <div className="bg-card border border-border rounded-2xl divide-y divide-border">
            {notifications.map(setting => (
              <div key={setting.id} className="flex items-center justify-between p-5">
                <div className="flex items-center gap-3">
                  <setting.icon size={18} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm font-semibold text-foreground font-body">{setting.label}</p>
                    <p className="text-xs text-muted-foreground font-body">{setting.desc}</p>
                  </div>
                </div>
                <ToggleSwitch enabled={setting.enabled} onToggle={() => toggleSetting(notifications, setNotifications, setting.id)} />
              </div>
            ))}
          </div>
        </motion.section>

        {/* Privacy */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h2 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
            <Shield size={20} /> Privacy & Security
          </h2>
          <div className="bg-card border border-border rounded-2xl divide-y divide-border">
            {privacy.map(setting => (
              <div key={setting.id} className="flex items-center justify-between p-5">
                <div className="flex items-center gap-3">
                  <setting.icon size={18} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm font-semibold text-foreground font-body">{setting.label}</p>
                    <p className="text-xs text-muted-foreground font-body">{setting.desc}</p>
                  </div>
                </div>
                <ToggleSwitch enabled={setting.enabled} onToggle={() => toggleSetting(privacy, setPrivacy, setting.id)} />
              </div>
            ))}
            <button className="w-full flex items-center justify-between p-5 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Lock size={18} className="text-muted-foreground" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground font-body">Change Password</p>
                  <p className="text-xs text-muted-foreground font-body">Update your account password</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          </div>
        </motion.section>

        {/* Danger Zone */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <h2 className="text-lg font-display font-bold text-foreground mb-4">Account</h2>
          <div className="bg-card border border-border rounded-2xl divide-y divide-border">
            <button onClick={() => toast.info('Logout coming soon!')} className="w-full flex items-center gap-3 p-5 text-foreground hover:bg-muted/50 transition-colors">
              <LogOut size={18} />
              <span className="text-sm font-semibold font-body">Log Out</span>
            </button>
            <button onClick={() => toast.error('This action requires confirmation')} className="w-full flex items-center gap-3 p-5 text-destructive hover:bg-destructive/5 transition-colors">
              <Trash2 size={18} />
              <div className="text-left">
                <span className="text-sm font-semibold font-body block">Delete Account</span>
                <span className="text-xs opacity-70 font-body">Permanently delete your account and all data</span>
              </div>
            </button>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default SettingsPage;
