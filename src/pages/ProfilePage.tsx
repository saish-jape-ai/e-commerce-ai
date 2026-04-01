import { useState } from 'react';
import { User, Mail, Phone, MapPin, Package, Heart, CreditCard, Settings, ChevronRight, LogOut, Edit2, Tag, Truck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const mockOrders = [
  { id: 'STY001', date: 'Mar 28, 2026', total: 2598, status: 'Delivered', items: 2, image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=80&h=80&fit=crop' },
  { id: 'STY002', date: 'Mar 15, 2026', total: 4299, status: 'In Transit', items: 1, image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=80&h=80&fit=crop' },
  { id: 'STY003', date: 'Feb 20, 2026', total: 1799, status: 'Delivered', items: 3, image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=80&h=80&fit=crop' },
  { id: 'STY004', date: 'Jan 10, 2026', total: 999, status: 'Returned', items: 1, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=80&h=80&fit=crop' },
];

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'payments', label: 'Payments', icon: CreditCard },
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const initials = (user?.name || 'User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase())
    .join('');

  const onLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/', { replace: true });
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto">
        {/* Sidebar */}
        <div className="lg:w-64 shrink-0">
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <div className="w-20 h-20 rounded-full fashion-gradient flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-foreground font-display">{initials || 'U'}</span>
                </div>
                <button className="absolute bottom-0 right-0 w-7 h-7 bg-background border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                  <Edit2 size={12} />
                </button>
              </div>
              <h2 className="text-lg font-display font-bold text-foreground mt-3">{user?.name || 'User'}</h2>
              <p className="text-sm text-muted-foreground font-body">{user?.email || ''}</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="text-xs bg-fashion-gold/20 text-fashion-gold font-bold px-2 py-0.5 rounded-full font-body">⭐ Gold</span>
              </div>
            </div>

            <nav className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body font-medium transition-colors ${
                    activeTab === tab.id ? 'bg-fashion-blush text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
              <div className="border-t border-border pt-2 mt-2">
                <Link to="/wishlist" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  <Heart size={18} /> Wishlist
                </Link>
                <Link to="/coupons" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  <Tag size={18} /> My Coupons
                </Link>
                <Link to="/track-order" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  <Truck size={18} /> Track Order
                </Link>
                <Link to="/settings" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  <Settings size={18} /> Settings
                </Link>
                <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body font-medium text-destructive hover:bg-destructive/10 transition-colors">
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-xl font-display font-bold text-foreground mb-6">Personal Information</h2>
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Full Name', value: user?.name || '-', icon: User },
                    { label: 'Email', value: user?.email || '-', icon: Mail },
                    { label: 'Phone', value: user?.phone || '-', icon: Phone },
                    { label: 'Gender', value: 'Male', icon: User },
                    { label: 'Date of Birth', value: '15 Aug 1995', icon: User },
                    { label: 'Location', value: 'Gurugram, Haryana', icon: MapPin },
                  ].map(field => (
                    <div key={field.label}>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-body mb-1 block">{field.label}</label>
                      <div className="flex items-center gap-2 border border-border rounded-xl px-4 py-3">
                        <field.icon size={16} className="text-muted-foreground" />
                        <span className="text-sm text-foreground font-body">{field.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => toast.info('Edit profile coming soon!')} className="mt-6 fashion-gradient text-primary-foreground px-6 py-2.5 rounded-xl font-semibold text-sm font-body hover:opacity-90 transition-opacity">
                  Edit Profile
                </button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                {[
                  { label: 'Total Orders', value: '24', icon: Package },
                  { label: 'Wishlist Items', value: '8', icon: Heart },
                  { label: 'Coupons', value: '3', icon: Tag },
                ].map(stat => (
                  <div key={stat.label} className="bg-card border border-border rounded-xl p-4 text-center">
                    <stat.icon size={20} className="mx-auto text-primary mb-1" />
                    <p className="text-xl font-bold text-foreground font-body">{stat.value}</p>
                    <p className="text-xs text-muted-foreground font-body">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-bold text-foreground">Order History</h2>
                <Link to="/track-order" className="text-sm text-primary font-semibold font-body hover:underline">Track Order →</Link>
              </div>
              <div className="space-y-4">
                {mockOrders.map((order, i) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <img src={order.image} alt="" className="w-16 h-16 rounded-lg object-cover" loading="lazy" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-foreground font-body">{order.id}</span>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full font-body ${
                            order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'In Transit' ? 'bg-fashion-blush text-primary' :
                            'bg-orange-100 text-orange-700'
                          }`}>{order.status}</span>
                        </div>
                        <p className="text-xs text-muted-foreground font-body mt-1">{order.date} • {order.items} items</p>
                        <p className="text-sm font-bold text-foreground font-body mt-1">₹{order.total.toLocaleString()}</p>
                      </div>
                      <ChevronRight size={20} className="text-muted-foreground" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'addresses' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-xl font-display font-bold text-foreground mb-6">Saved Addresses</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { type: 'Home', name: 'Rahul Sharma', addr1: '42, Park Street, Sector 15', addr2: 'Gurugram, Haryana - 122001', phone: '+91 98765 43210', default: true },
                  { type: 'Work', name: 'Rahul Sharma', addr1: 'Office 204, Tower B, Cyber City', addr2: 'DLF Phase 2, Gurugram - 122002', phone: '+91 98765 43210', default: false },
                ].map(addr => (
                  <div key={addr.type} className={`border rounded-xl p-4 ${addr.default ? 'border-primary bg-fashion-blush' : 'border-border'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={16} className="text-primary" />
                      <span className="text-xs font-bold uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded font-body">{addr.type}</span>
                      {addr.default && <span className="text-[10px] font-bold text-primary font-body">DEFAULT</span>}
                    </div>
                    <p className="text-sm font-semibold text-foreground font-body">{addr.name}</p>
                    <p className="text-sm text-muted-foreground font-body mt-1">{addr.addr1}</p>
                    <p className="text-sm text-muted-foreground font-body">{addr.addr2}</p>
                    <p className="text-xs text-muted-foreground font-body mt-1">📞 {addr.phone}</p>
                    <div className="flex gap-2 mt-3">
                      <button className="text-xs text-primary font-semibold font-body hover:underline">Edit</button>
                      <button className="text-xs text-destructive font-semibold font-body hover:underline">Delete</button>
                    </div>
                  </div>
                ))}
                <button className="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors min-h-[140px]">
                  <MapPin size={24} />
                  <span className="text-sm font-semibold font-body">Add New Address</span>
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'payments' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-xl font-display font-bold text-foreground mb-6">Payment Methods</h2>
              <div className="space-y-4">
                <div className="border border-border rounded-xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-xl">💳</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground font-body">HDFC Bank Credit Card</p>
                    <p className="text-xs text-muted-foreground font-body">**** **** **** 4532 • Expires 08/28</p>
                  </div>
                  <span className="text-xs font-bold text-primary font-body">DEFAULT</span>
                </div>
                <div className="border border-border rounded-xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-xl">📱</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground font-body">Google Pay UPI</p>
                    <p className="text-xs text-muted-foreground font-body">rahul@oksbi</p>
                  </div>
                </div>
                <button className="w-full border-2 border-dashed border-border rounded-xl p-4 text-sm text-primary font-semibold font-body hover:border-primary hover:bg-fashion-blush transition-colors flex items-center justify-center gap-2">
                  <CreditCard size={16} /> Add Payment Method
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
