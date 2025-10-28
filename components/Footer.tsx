import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary text-background">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-heading font-bold mb-4">KalaSetu</h3>
            <p className="text-gray-300">A Bridge for India’s Artisans.</p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-accent transition-colors">About Us</Link></li>
              <li><Link to="/shop" className="hover:text-accent transition-colors">Shop</Link></li>
              <li><Link to="/for-artisans" className="hover:text-accent transition-colors">For Artisans</Link></li>
              <li><Link to="#" className="hover:text-accent transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link to="#" className="hover:text-accent transition-colors">FAQ</Link></li>
              <li><Link to="#" className="hover:text-accent transition-colors">Shipping & Returns</Link></li>
              <li><Link to="#" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4">Stay Connected</h4>
            <p className="text-gray-300 mb-4">Subscribe to our newsletter for updates.</p>
            <div className="flex">
              <input type="email" placeholder="Your email" className="w-full px-4 py-2 rounded-l-md bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-accent" />
              <button className="bg-primary hover:bg-opacity-80 text-white px-4 py-2 rounded-r-md transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-700 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} KalaSetu. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;