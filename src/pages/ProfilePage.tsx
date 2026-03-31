import { useState } from 'react';
import { User, Mail, Phone, MapPin, Package, Heart, CreditCard, Settings, ChevronRight, LogOut, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const mockOrders = [
  { id: 'STY001', date: 'Mar 28, 2026', total: 2598, status: 'Delivered', items: 2, image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=80&h=80&fit=crop' },
  { id: 'STY002', date: 'Mar 15, 2026', total: 4299, status: 'In Transit', items: 1, image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=80&h=80&fit=crop' },
  { id: 'STY003', date: 'Feb 20, 2026', total: 1799, status: 'Delivered', items: 3, image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=80&h=80&fit=crop' },
];

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'payments', label: 'Payments', icon: CreditCard },
];

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto">
        {/* Sidebar */}
        <div className="lg:w-64 shrink-0">
          <div className="bg-card border border-border rounded-2xl p-6">
            {/* Avatar */}
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <div className="w-20 h-20 rounded-full fashion-gradient flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-foreground font-display">RS</span>
                </div>
                <button className="absolute bottom-0 right-0 w-7 h-7 bg-background border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                  <Edit2 size={12} />
                </button>
              </div>
              <h2 className="text-lg font-display font-bold text-foreground mt-3">Rahul Sharma</h2>
              <p className="text-sm text-muted-foreground font-body">Premium Member</p>
            </div>

            {/* Nav */}
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
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body font-medium text-destructive hover:bg-destructive/10 transition-colors">
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
                    { label: 'Full Name', value: 'Rahul Sharma', icon: User },
                    { label: 'Email', value: 'rahul@example.com', icon: Mail },
                    { label: 'Phone', value: '+91 98765 43210', icon: Phone },
                    { label: 'Gender', value: 'Male', icon: User },
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
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-xl font-display font-bold text-foreground mb-6">Order History</h2>
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
                      <img src={order.image} alt="" className="w-16 h-16 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-foreground font-body">{order.id}</span>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full font-body ${
                            order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-fashion-blush text-primary'
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
                <div className="border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded font-body">Home</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground font-body">Rahul Sharma</p>
                  <p className="text-sm text-muted-foreground font-body mt-1">42, Park Street, Sector 15</p>
                  <p className="text-sm text-muted-foreground font-body">Gurugram, Haryana - 122001</p>
                  <div className="flex gap-2 mt-3">
                    <button className="text-xs text-primary font-semibold font-body hover:underline">Edit</button>
                    <button className="text-xs text-destructive font-semibold font-body hover:underline">Delete</button>
                  </div>
                </div>
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
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <CreditCard size={48} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground font-body">No saved payment methods yet.</p>
                <button className="mt-4 text-sm text-primary font-semibold font-body hover:underline">Add Payment Method</button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
