import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Headphones, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const contactMethods = [
  { icon: Phone, title: 'Call Us', desc: '+91 1800-123-4567', sub: 'Mon-Sat, 9AM-9PM IST', color: 'bg-green-50 text-green-600' },
  { icon: Mail, title: 'Email Us', desc: 'support@stylora.com', sub: 'Response within 24 hours', color: 'bg-blue-50 text-blue-600' },
  { icon: MessageSquare, title: 'Live Chat', desc: 'Chat with our team', sub: 'Available 24/7', color: 'bg-purple-50 text-purple-600' },
  { icon: Headphones, title: 'Help Center', desc: 'Browse FAQs', sub: '500+ articles', color: 'bg-fashion-blush text-primary' },
];

const faqs = [
  { q: "How can I track my order?", a: "Go to your Profile → Orders and click on the order to see real-time tracking updates." },
  { q: "What is the return policy?", a: "We offer a 30-day easy return policy. Items must be unused with original tags attached." },
  { q: "How do I apply a coupon code?", a: "Add items to your bag, proceed to checkout, and enter your coupon code in the 'Apply Coupon' section." },
  { q: "When will I receive my refund?", a: "Refunds are processed within 5-7 business days after we receive the returned item." },
  { q: "Do you offer international shipping?", a: "Currently, we ship within India only. International shipping is coming soon!" },
];

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Message sent! We\'ll get back to you within 24 hours.');
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-display font-bold text-foreground mb-3">Get in Touch</h1>
        <p className="text-muted-foreground font-body text-lg">We'd love to hear from you. Our friendly team is always here to help.</p>
      </motion.div>

      {/* Contact Methods */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
        {contactMethods.map((method, i) => (
          <motion.div
            key={method.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-2xl p-5 text-center hover-lift cursor-pointer"
          >
            <div className={`w-12 h-12 rounded-xl ${method.color} flex items-center justify-center mx-auto mb-3`}>
              <method.icon size={22} />
            </div>
            <h3 className="text-sm font-bold text-foreground font-body">{method.title}</h3>
            <p className="text-sm text-primary font-semibold font-body mt-1">{method.desc}</p>
            <p className="text-xs text-muted-foreground font-body mt-0.5">{method.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
        {/* Contact Form */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-2xl font-display font-bold text-foreground mb-6">Send us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-foreground font-body block mb-1.5">Name</label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="Your name" className="w-full px-4 py-3 border border-border rounded-xl text-sm font-body bg-background outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground font-body block mb-1.5">Email</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required placeholder="you@example.com" className="w-full px-4 py-3 border border-border rounded-xl text-sm font-body bg-background outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground font-body block mb-1.5">Subject</label>
              <select value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} required className="w-full px-4 py-3 border border-border rounded-xl text-sm font-body bg-background outline-none focus:border-primary transition-colors">
                <option value="">Select a topic</option>
                <option value="order">Order Issue</option>
                <option value="return">Return / Refund</option>
                <option value="product">Product Inquiry</option>
                <option value="payment">Payment Issue</option>
                <option value="feedback">Feedback</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground font-body block mb-1.5">Message</label>
              <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required rows={5} placeholder="Tell us how we can help..." className="w-full px-4 py-3 border border-border rounded-xl text-sm font-body bg-background outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none" />
            </div>
            <motion.button type="submit" disabled={isSubmitting} whileTap={{ scale: 0.98 }} className="w-full fashion-gradient text-primary-foreground py-3.5 rounded-xl font-semibold text-sm font-body hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60">
              {isSubmitting ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
              ) : (
                <>Send Message <Send size={16} /></>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* FAQs */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-2xl font-display font-bold text-foreground mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.05 }} className="border border-border rounded-xl overflow-hidden">
                <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)} className="w-full text-left flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors">
                  <span className="text-sm font-semibold text-foreground font-body pr-4">{faq.q}</span>
                  <motion.span animate={{ rotate: expandedFaq === i ? 180 : 0 }} className="text-muted-foreground shrink-0">
                    <ArrowRight size={16} className="rotate-90" />
                  </motion.span>
                </button>
                {expandedFaq === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="px-5 pb-4">
                    <p className="text-sm text-muted-foreground font-body">{faq.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Map placeholder */}
          <div className="mt-8 bg-muted rounded-2xl p-6 text-center">
            <MapPin size={32} className="mx-auto text-primary mb-2" />
            <h3 className="text-lg font-display font-bold text-foreground">Our Office</h3>
            <p className="text-sm text-muted-foreground font-body mt-1">Tower B, Cyber City, DLF Phase 2</p>
            <p className="text-sm text-muted-foreground font-body">Gurugram, Haryana 122002</p>
            <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground font-body">
              <Clock size={12} /> Mon-Sat: 9:00 AM - 6:00 PM IST
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;
