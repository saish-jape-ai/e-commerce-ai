import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    setIsLoading(true);
    try {
      await signup(form);
      toast.success('Account created successfully! Welcome to Stylora.');
      navigate('/profile', { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">Create Account</h1>
          <p className="text-muted-foreground mt-2 font-body">Join Stylora for exclusive deals & personalized style</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2].map(s => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-body transition-colors ${s <= step ? 'fashion-gradient text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {s}
              </div>
              {s < 2 && <div className={`flex-1 h-0.5 rounded transition-colors ${step > 1 ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-foreground font-body block mb-1.5">Full Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="text" value={form.name} onChange={e => updateField('name', e.target.value)} placeholder="Your full name" required className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm font-body bg-background outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground font-body block mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="email" value={form.email} onChange={e => updateField('email', e.target.value)} placeholder="you@example.com" required className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm font-body bg-background outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground font-body block mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="tel" value={form.phone} onChange={e => updateField('phone', e.target.value)} placeholder="+91 98765 43210" className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm font-body bg-background outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-foreground font-body block mb-1.5">Create Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => updateField('password', e.target.value)} placeholder="Min 8 characters" required className="w-full pl-10 pr-12 py-3 border border-border rounded-xl text-sm font-body bg-background outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {/* Password strength */}
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${form.password.length >= i * 3 ? 'bg-primary' : 'bg-border'}`} />
                    ))}
                  </div>
                </div>

                <div className="bg-fashion-blush rounded-xl p-4">
                  <p className="text-sm font-body text-foreground font-semibold mb-2">What you'll get:</p>
                  <ul className="space-y-1.5 text-xs text-muted-foreground font-body">
                    {['Personalized AI style recommendations', 'Exclusive member discounts up to 30%', 'Early access to sales & new arrivals', 'Free delivery on your first order'].map(item => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" required className="accent-primary w-4 h-4 mt-0.5" />
                  <span className="text-xs text-muted-foreground font-body">
                    I agree to the <span className="text-primary cursor-pointer">Terms of Service</span> and <span className="text-primary cursor-pointer">Privacy Policy</span>
                  </span>
                </label>
              </motion.div>
            )}

            <div className="flex gap-3">
              {step > 1 && (
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 border border-border rounded-xl text-sm font-semibold font-body hover:bg-muted transition-colors">
                  Back
                </button>
              )}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileTap={{ scale: 0.98 }}
                className="flex-1 fashion-gradient text-primary-foreground py-3.5 rounded-xl font-semibold text-sm font-body hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
                ) : (
                  <>{step === 1 ? 'Continue' : 'Create Account'} <ArrowRight size={16} /></>
                )}
              </motion.button>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6 font-body">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignupPage;
