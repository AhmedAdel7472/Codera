const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add dashboard to Screen type
content = content.replace(
  "type Screen = 'main' | 'builder' | 'mentor' | 'individual' | 'organization';",
  "type Screen = 'main' | 'builder' | 'mentor' | 'individual' | 'organization' | 'dashboard';"
);

// 2. Add Dashboard to App router
content = content.replace(
  "{currentScreen === 'organization' && <OrganizationPopup onBack={goBack} />}",
  "{currentScreen === 'organization' && <OrganizationPopup onBack={goBack} onNavigate={navigate} />}\n      {currentScreen === 'dashboard' && <DashboardScreen onBack={goBack} />}"
);

// 3. Fix MainPage alerts
content = content.replace(
  'onClick={() => alert("Navigating to Dashboard...")}',
  'onClick={() => onNavigate(\'dashboard\')}'
);
content = content.replace(
  'onClick={() => onNavigate(\'organization\')}',
  'onClick={() => onNavigate(\'dashboard\')}'
);

// 4. Fix OrganizationPopup props and alerts
content = content.replace(
  'function OrganizationPopup({ onBack }: { onBack: () => void }) {',
  'function OrganizationPopup({ onBack, onNavigate }: { onBack: () => void, onNavigate: (s: Screen) => void }) {'
);

// replace all remaining alerts
content = content.replace(/alert\("Navigating to Dashboard\.\.\."\)/g, "onNavigate('dashboard')");

// 5. Add DashboardScreen component at the end
const dashboardCode = `
// --- Screen: Dashboard ---
function DashboardScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[#0E1528] flex flex-col items-center justify-center font-sans text-white p-6 animate-in fade-in duration-700">
      <div className="bg-[#162035] p-10 rounded-[32px] border border-[#23304A] text-center max-w-lg w-full shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#6FC9D5] to-[#714EC0]"></div>
        <button 
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors absolute top-6 left-6"
        >
          <ArrowLeft size={22} strokeWidth={2.5} />
        </button>
        <div className="w-20 h-20 rounded-2xl bg-[#2C2B54] mx-auto mb-6 flex items-center justify-center shadow-inner mt-4">
          <Rocket size={40} className="text-[#CDB4DB]" />
        </div>
        <h2 className="text-3xl font-serif font-bold mb-4">Welcome to your Dashboard</h2>
        <p className="text-[#9BA4B5] mb-8 leading-relaxed">
          This is a placeholder for the actual dashboard. We're glad you joined CodeRa!
        </p>
        <button 
          onClick={onBack}
          className="bg-[#6FC9D5] text-[#0E1528] px-8 py-3 rounded-full font-bold tracking-wide hover:scale-105 transition-transform"
        >
          GO BACK
        </button>
      </div>
    </div>
  );
}
`;

if (!content.includes('function DashboardScreen')) {
  content += '\n' + dashboardCode;
}

fs.writeFileSync('src/App.tsx', content);
