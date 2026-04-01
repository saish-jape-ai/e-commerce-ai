import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => (
  <footer className="bg-fashion-navy text-secondary mt-16">
    <div className="container mx-auto py-12 px-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="font-display text-2xl font-bold text-background">STYLORA</Link>
          <p className="text-sm text-muted-foreground mt-3 font-body leading-relaxed">India's leading fashion destination with 5000+ brands and AI-powered personal styling.</p>
          <div className="flex gap-3 mt-4">
            {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
              <button key={i} className="w-8 h-8 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Icon size={14} className="text-background" />
              </button>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold mb-4 text-background uppercase tracking-wider">Shop</h4>
          <ul className="space-y-2">
            {[
              { label: 'Men', to: '/products?gender=men' },
              { label: 'Women', to: '/products?gender=women' },
              { label: 'Kids', to: '/products?gender=kids' },
              { label: 'Beauty', to: '/products?category=beauty' },
              { label: 'Coupons & Offers', to: '/coupons' },
            ].map(item => (
              <li key={item.label}><Link to={item.to} className="text-sm text-muted-foreground hover:text-background transition-colors font-body">{item.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold mb-4 text-background uppercase tracking-wider">Help</h4>
          <ul className="space-y-2">
            {[
              { label: 'Track Order', to: '/track-order' },
              { label: 'Returns & Refunds', to: '/contact' },
              { label: 'FAQs', to: '/contact' },
              { label: 'Contact Us', to: '/contact' },
              { label: 'Size Guide', to: '/products' },
            ].map(item => (
              <li key={item.label}><Link to={item.to} className="text-sm text-muted-foreground hover:text-background transition-colors font-body">{item.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold mb-4 text-background uppercase tracking-wider">Company</h4>
          <ul className="space-y-2">
            {[
              { label: 'About Us', to: '/about' },
              { label: 'Careers', to: '/about' },
              { label: 'Blog', to: '/about' },
              { label: 'Press', to: '/about' },
              { label: 'Settings', to: '/settings' },
            ].map(item => (
              <li key={item.label}><Link to={item.to} className="text-sm text-muted-foreground hover:text-background transition-colors font-body">{item.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold mb-4 text-background uppercase tracking-wider">Stay Connected</h4>
          <p className="text-sm text-muted-foreground mb-4 font-body">Subscribe for exclusive offers and style updates.</p>
          <div className="flex">
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 px-3 py-2 text-sm bg-background/10 border border-background/20 rounded-l-md text-background placeholder:text-background/50 outline-none font-body"
            />
            <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-r-md hover:opacity-90 transition-opacity font-body">
              Join
            </button>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/MasterCard_Logo.svg/200px-MasterCard_Logo.svg.png" alt="Mastercard" className="h-5 opacity-50" loading="lazy" />
            <span className="text-xs text-muted-foreground font-body">Secure Payments</span>
          </div>
        </div>
      </div>
      <div className="border-t border-background/10 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-muted-foreground font-body">© 2026 Stylora. All rights reserved.</p>
        <div className="flex gap-6">
          {['Privacy Policy', 'Terms of Use', 'Cookie Policy'].map(item => (
            <span key={item} className="text-xs text-muted-foreground hover:text-background transition-colors cursor-pointer font-body">{item}</span>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
