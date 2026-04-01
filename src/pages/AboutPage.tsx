import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Truck, RotateCcw, Shield, Heart, Users, Globe, Award, ArrowRight } from 'lucide-react';

const stats = [
  { number: "10M+", label: "Happy Customers" },
  { number: "5000+", label: "Brands" },
  { number: "50M+", label: "Products Sold" },
  { number: "500+", label: "Cities Served" },
];

const values = [
  { icon: Heart, title: "Customer First", desc: "Every decision starts with our customer. From curated collections to hassle-free returns." },
  { icon: Sparkles, title: "Innovation", desc: "AI-powered styling, smart recommendations, and cutting-edge tech for the best shopping experience." },
  { icon: Globe, title: "Sustainability", desc: "Committed to eco-friendly packaging, ethical sourcing, and reducing our carbon footprint." },
  { icon: Award, title: "Quality", desc: "Rigorous quality checks on every product. Only the best brands make it to Stylora." },
];

const services = [
  { icon: Truck, title: "Free & Fast Delivery", desc: "Free shipping on orders above ₹999. Express delivery in 2-3 days across 500+ cities." },
  { icon: RotateCcw, title: "Easy 30-Day Returns", desc: "Changed your mind? Return any item within 30 days for a full refund. No questions asked." },
  { icon: Shield, title: "100% Genuine Products", desc: "Every product is sourced directly from brands or authorized dealers. Guaranteed authentic." },
  { icon: Sparkles, title: "AI Personal Stylist", desc: "Our AI analyzes your style preferences and curates personalized outfits just for you." },
];

const team = [
  { name: "Priya Sharma", role: "CEO & Founder", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop" },
  { name: "Arjun Mehta", role: "CTO", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop" },
  { name: "Neha Gupta", role: "Head of Design", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop" },
  { name: "Vikram Singh", role: "Head of Operations", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop" },
];

const AboutPage = () => (
  <div>
    {/* Hero */}
    <section className="relative overflow-hidden bg-fashion-navy py-20">
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-background mb-4">Redefining Fashion,<br />One Style at a Time</h1>
          <p className="text-lg text-background/70 font-body max-w-2xl mx-auto mb-8">Stylora is India's leading fashion destination, bringing you the latest trends from 5000+ brands powered by AI-driven personalization.</p>
          <Link to="/products" className="inline-flex items-center gap-2 fashion-gradient text-primary-foreground px-8 py-3 rounded-full font-semibold text-sm font-body hover:opacity-90 transition-opacity">
            Explore Our Collection <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
      <div className="absolute inset-0 opacity-5 bg-gradient-to-r from-primary to-transparent" />
    </section>

    {/* Stats */}
    <section className="container mx-auto px-4 -mt-8 relative z-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-2xl p-6 text-center shadow-sm"
          >
            <p className="text-3xl font-display font-bold text-primary">{stat.number}</p>
            <p className="text-sm text-muted-foreground font-body mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>

    {/* Our Story */}
    <section className="container mx-auto px-4 py-16">
      <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl font-display font-bold text-foreground mb-4">Our Story</h2>
          <p className="text-muted-foreground font-body mb-4">Founded in 2020, Stylora started with a simple vision — to make fashion accessible, personalized, and enjoyable for everyone. What began as a small curated marketplace has grown into India's most loved fashion platform.</p>
          <p className="text-muted-foreground font-body mb-4">We leverage AI and machine learning to understand your unique style preferences, ensuring every visit feels like a personally curated shopping experience. From the latest runway trends to everyday essentials, we bring the world of fashion to your fingertips.</p>
          <p className="text-muted-foreground font-body">Today, with over 10 million happy customers and 5000+ brands, we're just getting started on our journey to transform how India shops for fashion.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
          <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=500&fit=crop" alt="Stylora store" className="rounded-2xl shadow-lg w-full" loading="lazy" />
          <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground rounded-xl p-4 shadow-lg">
            <p className="text-2xl font-display font-bold">6+</p>
            <p className="text-xs font-body">Years of Excellence</p>
          </div>
        </motion.div>
      </div>
    </section>

    {/* Values */}
    <section className="bg-muted py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-display font-bold text-foreground text-center mb-10">What We Stand For</h2>
        <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {values.map((val, i) => (
            <motion.div
              key={val.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl p-6 text-center hover-lift"
            >
              <div className="w-14 h-14 fashion-gradient rounded-xl flex items-center justify-center mx-auto mb-4">
                <val.icon size={24} className="text-primary-foreground" />
              </div>
              <h3 className="text-base font-bold text-foreground font-body mb-2">{val.title}</h3>
              <p className="text-sm text-muted-foreground font-body">{val.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Services */}
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-3xl font-display font-bold text-foreground text-center mb-3">Our Services</h2>
      <p className="text-muted-foreground text-center font-body mb-10">Everything you need for a seamless shopping experience</p>
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {services.map((svc, i) => (
          <motion.div
            key={svc.title}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex gap-4 p-6 border border-border rounded-2xl hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-fashion-blush rounded-xl flex items-center justify-center shrink-0">
              <svc.icon size={22} className="text-primary" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground font-body mb-1">{svc.title}</h3>
              <p className="text-sm text-muted-foreground font-body">{svc.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>

    {/* Team */}
    <section className="bg-muted py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-display font-bold text-foreground text-center mb-10">Meet the Team</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <img src={member.image} alt={member.name} className="w-24 h-24 rounded-full object-cover mx-auto mb-3 border-2 border-primary/20" loading="lazy" />
              <h3 className="text-sm font-bold text-foreground font-body">{member.name}</h3>
              <p className="text-xs text-muted-foreground font-body">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="container mx-auto px-4 py-16 text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-xl mx-auto">
        <h2 className="text-3xl font-display font-bold text-foreground mb-4">Ready to Explore?</h2>
        <p className="text-muted-foreground font-body mb-6">Join millions of fashion lovers and discover your unique style with Stylora.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/products" className="fashion-gradient text-primary-foreground px-8 py-3 rounded-full font-semibold text-sm font-body hover:opacity-90 transition-opacity">Shop Now</Link>
          <Link to="/contact" className="border border-border px-8 py-3 rounded-full font-semibold text-sm font-body hover:bg-muted transition-colors text-foreground">Contact Us</Link>
        </div>
      </motion.div>
    </section>
  </div>
);

export default AboutPage;
