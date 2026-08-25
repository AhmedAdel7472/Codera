const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const footerHtml = `
      {/* Footer Details */}
      <footer className="bg-[#0B1021] py-8 border-t border-[#1C2840]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src={IMAGES.logo} alt="CodeRa Logo" className="h-10 w-auto object-contain mix-blend-screen" />
            <span className="text-[#5D6B82] text-sm font-medium">© 2026 CodeRa. All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-[#5D6B82] text-sm font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
`;

content = content.replace('      </div>\n    </div>\n  );\n};\n\nconst PopupLayout', footerHtml + '\n\nconst PopupLayout');

fs.writeFileSync('src/App.tsx', content);
