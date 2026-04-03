import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const links = {
    Product: [
      { name: 'How it works', path: '/how-it-works' },
      { name: 'Features', path: '/features' },
      { name: 'Templates', path: '/templates' },
      { name: 'Integrations', path: '/integrations', badge: 'New' },
      { name: 'Pricing', path: '/pricing' },
      { name: 'Changelog', path: '/changelog' },
    ],
    Resources: [
      { name: 'Documentation', path: '/docs' },
      { name: 'API reference', path: '/api' },
      { name: 'Blog', path: '/blog' },
      { name: 'Invoice guide', path: '/guide' },
      { name: 'Tax tips', path: '/tax' },
      { name: 'Freelancer hub', path: '/freelancers' },
    ],
    Company: [
      { name: 'About', path: '/about' },
      { name: 'Careers', path: '/careers' },
      { name: 'Security', path: '/security' },
      { name: 'Help center', path: '/help' },
      { name: 'Contact us', path: '/contact' },
    ],
  };

  return (
    <footer className="border-t border-gray-200 pt-12 pb-8 px-6 bg-white">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">InvoiceAI</span>
          </div>

          <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full mb-3">
            ✦ Powered by AI
          </span>

          <p className="text-sm text-gray-500 leading-relaxed max-w-[220px] mb-5">
            Generate professional invoices in seconds. Let AI handle the formatting so you can focus on your work.
          </p>

          {/* Socials */}
          <div className="flex gap-3">
            {[
              { name: 'X', link: '#' },
              { name: 'LinkedIn', link: '#' },
              { name: 'GitHub', link: '#' },
            ].map((s) => (
              <a
                key={s.name}
                href={s.link}
                className="px-3 py-1.5 text-xs rounded-md border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition"
              >
                {s.name}
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(links).map(([title, items]) => (
          <div key={title}>
            <div className="text-xs font-semibold text-gray-900 uppercase tracking-widest mb-3">
              {title}
            </div>

            <ul className="space-y-2.5">
              {items.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className="text-sm text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2"
                  >
                    {item.name}

                    {item.badge && (
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
        <span className="text-xs text-gray-400">
          © {new Date().getFullYear()} InvoiceAI, Inc. All rights reserved.
        </span>

        <span className="flex items-center gap-2 text-xs text-gray-500 border border-gray-200 rounded-md px-3 py-1">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          All systems operational
        </span>

        <div className="flex gap-4">
          <Link to="/privacy" className="text-xs text-gray-400 hover:text-gray-600">
            Privacy policy
          </Link>
          <Link to="/terms" className="text-xs text-gray-400 hover:text-gray-600">
            Terms of service
          </Link>
          <Link to="/cookies" className="text-xs text-gray-400 hover:text-gray-600">
            Cookie settings
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;