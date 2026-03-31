import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-fashion-navy text-secondary mt-16">
    <div className="container mx-auto py-12 px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h4 className="font-display text-lg font-semibold mb-4 text-background">Shop</h4>
          <ul className="space-y-2">
            {['Men', 'Women', 'Kids', 'Beauty', 'Home & Living'].map(item => (
              <li key={item}>
                <Link to="/products" className="text-sm text-muted-foreground hover:text-background transition-colors font-body">{item}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-display text-lg font-semibold mb-4 text-background">Help</h4>
          <ul className="space-y-2">
            {['Track Order', 'Returns', 'FAQs', 'Contact Us', 'Size Guide'].map(item => (
              <li key={item}>
                <span className="text-sm text-muted-foreground hover:text-background transition-colors cursor-pointer font-body">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-display text-lg font-semibold mb-4 text-background">Company</h4>
          <ul className="space-y-2">
            {['About Us', 'Careers', 'Blog', 'Press', 'Sustainability'].map(item => (
              <li key={item}>
                <span className="text-sm text-muted-foreground hover:text-background transition-colors cursor-pointer font-body">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-display text-lg font-semibold mb-4 text-background">Stay Connected</h4>
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
