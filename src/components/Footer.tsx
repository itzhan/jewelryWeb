import { MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top section with brand info */}
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h2 className="text-3xl font-serif mb-4">KEYZAR</h2>
          <p className="text-gray-400 mb-6">
            We're a team of creatives, programmers, and jewelry experts dedicated to redefining
            the online jewelry shopping experience. We believe that every piece of jewelry holds
            a story, marking a cherished moment worth celebrating.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>580 Fifth Ave. Suite #2412, New York, NY 10036</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Phone className="w-4 h-4" />
              <span>(212) 203-9900</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" />
              <span>contact@keyzarjewelry.com</span>
            </div>
          </div>
        </div>

        {/* Social icons */}
        <div className="flex justify-center gap-6 mb-12">
          <a href="#" className="hover:opacity-70 transition-opacity">
            <Instagram className="w-6 h-6" />
          </a>
          <a href="#" className="hover:opacity-70 transition-opacity">
            <Facebook className="w-6 h-6" />
          </a>
          <a href="#" className="hover:opacity-70 transition-opacity">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-3 8h-2v7h-3v-7H9V9h2V7.5C11 5.5 12.5 4 14.5 4H17v3h-2c-.5 0-1 .5-1 1v1h3v2z"/>
            </svg>
          </a>
        </div>

        {/* Footer links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div>
            <h3 className="font-semibold mb-4">ABOUT</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">About Us</a></li>
              <li><a href="#" className="hover:text-white">Contact Us</a></li>
              <li><a href="#" className="hover:text-white">Blog</a></li>
              <li><a href="#" className="hover:text-white">Faq</a></li>
              <li><a href="#" className="hover:text-white">Reviews</a></li>
              <li><a href="#" className="hover:text-white">Education</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">INFORMATION</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">Shipping Info</a></li>
              <li><a href="#" className="hover:text-white">Money Back Guarantee</a></li>
              <li><a href="#" className="hover:text-white">Conflict Free Diamonds</a></li>
              <li><a href="#" className="hover:text-white">Professional Appraisal</a></li>
              <li><a href="#" className="hover:text-white">Terms Of Use</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Accessibility</a></li>
              <li><a href="#" className="hover:text-white">Do Not Sell My Information</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">JEWELRY</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">Engagement Rings</a></li>
              <li><a href="#" className="hover:text-white">Wedding Bands</a></li>
              <li><a href="#" className="hover:text-white">Pendants</a></li>
              <li><a href="#" className="hover:text-white">Moissanite</a></li>
              <li><a href="#" className="hover:text-white">Eternity Rings</a></li>
              <li><a href="#" className="hover:text-white">Diamonds Necklaces</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span>🇺🇸 United States (USD$)</span>
            </div>

            <div className="text-sm text-gray-400">
              © All Rights Reserved to Keyzar Jewelry
            </div>

            <div className="flex items-center gap-4">
              <img src="https://upload.wikimedia.org/wikipedia/commons/d/d6/Visa_2021.svg" alt="Visa" className="h-6" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
              <span className="text-sm">Klarna</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
