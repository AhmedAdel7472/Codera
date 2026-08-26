import { ParentProfileData, ParentRegistrationModal } from './ParentRegistrationModal';
import { StudentSessionTelemetry } from '../engine/telemetrySchema';
import { PlacementEngine } from '../engine/placementEngine';
import { renderReportDashboard, returnToLandingPage, renderCEODashboard } from './ReportDashboard';
import { AssessmentRunner } from './AssessmentRunner';
import { PaymentModal } from './PaymentModal';

export function renderParentDashboard(
  container: HTMLElement,
  selectedProfile?: ParentProfileData
) {
  // Retrieve registry of children or current profile
  let registry: ParentProfileData[] = [];
  try {
    const rawRegistry = localStorage.getItem('codera_student_registry');
    if (rawRegistry) {
      registry = JSON.parse(rawRegistry);
    }
  } catch (e) {}

  if (registry.length === 0) {
    try {
      const singleProfile = localStorage.getItem('codera_parent_profile');
      if (singleProfile) {
        registry.push(JSON.parse(singleProfile));
      }
    } catch (e) {}
  }

  // Fallback sample child if registry is empty for rich preview
  if (registry.length === 0) {
    registry.push({
      id: 'STU-1001',
      studentFullName: 'Alex Rivers',
      age: 8,
      diagnosis: 'Typical',
      diagnosisNotes: '',
      preferredLanguage: 'en',
      gradeLevel: 'Grade 1-3',
      devices: ['Tablet/iPad', 'Laptop'],
      priorExperience: 'Scratch Jr',
      digitalSkills: ['Mouse/Touch Navigation', 'Following Instructions'],
      passions: ['LEGO', 'Robots'],
      registeredAt: new Date().toISOString()
    });
  }

  // Retrieve stored assessment sessions
  let sessions: StudentSessionTelemetry[] = [];
  try {
    const rawSessions = localStorage.getItem('codera_all_sessions') || localStorage.getItem('cognix_all_sessions');
    if (rawSessions) {
      sessions = JSON.parse(rawSessions);
    }
  } catch (e) {}

  const openNewChildModal = () => {
    const modal = new ParentRegistrationModal((newProfile) => {
      renderParentDashboard(container, newProfile);
    });
    modal.open(1);
  };

  // Calculate high-level stats
  const completedAssessmentsCount = registry.filter(c => 
    sessions.some(s => s.student_name.toLowerCase().trim() === c.studentFullName.toLowerCase().trim())
  ).length;

  const totalScoreSum = sessions.reduce((acc, s) => acc + (s.total_score || 0), 0);
  const avgScore = sessions.length > 0 ? Math.round(totalScoreSum / sessions.length) : null;

  const childrenCardsHtml = registry.map((child, idx) => {
    // Find matching session if any
    const matchingSession = sessions.find(s => 
      s.student_name.toLowerCase().trim() === child.studentFullName.toLowerCase().trim()
    ) || (idx === 0 && sessions.length > 0 ? sessions[0] : null);

    const hasCompletedAssessment = !!matchingSession;
    const totalScore = matchingSession ? matchingSession.total_score : null;
    const placedTrack = matchingSession ? (matchingSession.placed_track || matchingSession.recommended_track || 'L1 Foundational Coder') : 'Pending Placement';

    const passionsHtml = (child.passions || []).map(p => `
      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold shadow-sm">
        ✨ ${p}
      </span>
    `).join('');

    const devicesHtml = (child.devices || []).map(d => `
      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
        💻 ${d}
      </span>
    `).join('');

    return `
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 relative flex flex-col justify-between group">
        
        <!-- Top Profile Header -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                ${child.studentFullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 class="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  ${child.studentFullName}
                  <span class="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold border border-emerald-300 dark:border-emerald-800">
                    Active Profile
                  </span>
                </h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                  Age: <strong class="text-slate-700 dark:text-slate-200">${child.age} yrs</strong> • Grade: <strong class="text-slate-700 dark:text-slate-200">${child.gradeLevel || 'Grade 1-3'}</strong>
                </p>
              </div>
            </div>
            
            ${hasCompletedAssessment ? `
              <div class="text-right bg-indigo-50 dark:bg-indigo-950/50 p-2.5 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                <div class="text-2xl font-black text-indigo-600 dark:text-indigo-400">${totalScore}/100</div>
                <div class="text-[9px] uppercase font-extrabold tracking-wider text-indigo-400">Readiness Score</div>
              </div>
            ` : `
              <span class="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-bold animate-pulse">
                ⏳ Pending Test
              </span>
            `}
          </div>

          ${hasCompletedAssessment ? `
            <div class="mb-4 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between text-xs">
              <span class="text-slate-500 dark:text-slate-400 font-bold">Placed Track:</span>
              <span class="font-black text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                <i class="fa-solid fa-award text-amber-500"></i> ${placedTrack}
              </span>
            </div>
          ` : ''}

          <!-- Info Badges & Details -->
          <div class="space-y-3 my-4">
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-slate-500 font-bold">Diagnosis / Profile:</span>
                <span class="font-extrabold text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">${child.diagnosis || 'Typical'}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-slate-500 font-bold">Tech Experience:</span>
                <span class="font-bold text-indigo-600 dark:text-indigo-400">${child.priorExperience || 'Beginner'}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-slate-500 font-bold">Preferred Language:</span>
                <span class="font-bold text-slate-700 dark:text-slate-300">${child.preferredLanguage === 'ar' ? 'Arabic 🇪🇬' : 'English 🇬🇧'}</span>
              </div>
            </div>

            <!-- Passions Pills -->
            <div>
              <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Selected Passions & Badges:</div>
              <div class="flex flex-wrap gap-1.5">
                ${passionsHtml || '<span class="text-xs text-slate-400">No passions specified</span>'}
              </div>
            </div>

            <!-- Devices -->
            <div>
              <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Equipped Devices:</div>
              <div class="flex flex-wrap gap-1">
                ${devicesHtml}
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5 mt-2">
          ${hasCompletedAssessment ? `
            <button data-child-report="${child.studentFullName}" class="view-child-report-btn w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer transform hover:scale-[1.01]">
              <i class="fa-solid fa-file-invoice text-base"></i>
              <span>View Comprehensive Report</span>
              <i class="fa-solid fa-arrow-right ml-auto"></i>
            </button>

            <button data-child-track="${placedTrack}" class="book-now-payment-btn w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer transform hover:scale-[1.01]">
              <i class="fa-solid fa-credit-card text-base"></i>
              <span>Book Now & Enroll Student 💳</span>
            </button>
            
            <button data-child-retake="${child.studentFullName}" class="retake-child-test-btn w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-xs cursor-pointer">
              <i class="fa-solid fa-rotate-right text-indigo-500"></i>
              <span>Retake 50-Question Assessment</span>
            </button>
          ` : `
            <button data-child-start="${child.studentFullName}" class="start-child-test-btn w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer transform hover:scale-[1.01]">
              <i class="fa-solid fa-rocket text-base"></i>
              <span>Start 50-Question AI Assessment Now 🚀</span>
            </button>
          `}
        </div>

      </div>
    `;
  }).join('');

  // Profile 2 / Add New Child Card
  const addNewChildCardHtml = `
    <div id="addNewChildBtnCard" class="bg-gradient-to-br from-slate-50 via-emerald-50/40 to-teal-50/30 dark:from-slate-900/60 dark:via-emerald-950/30 dark:to-teal-950/20 border-2 border-dashed border-emerald-300 dark:border-emerald-700 hover:border-emerald-500 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover:scale-[1.01] shadow-sm hover:shadow-xl group min-h-[440px]">
      <div class="w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 group-hover:bg-gradient-to-tr group-hover:from-emerald-500 group-hover:to-teal-600 group-hover:text-white flex items-center justify-center text-3xl font-black transition-all mb-4 shadow-lg shadow-emerald-500/20 group-hover:rotate-6">
        <i class="fa-solid fa-user-plus"></i>
      </div>
      <h3 class="text-xl font-black text-slate-900 dark:text-white mb-2">Register Another Child</h3>
      <p class="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-6 leading-relaxed">
        Add another child profile to customize their learning interest survey, accessibility accommodations, and launch independent AI assessments.
      </p>
      <span class="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2">
        <i class="fa-solid fa-plus"></i>
        <span>Add New Student Profile</span>
      </span>
    </div>
  `;

  container.innerHTML = `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8" dir="ltr">
      <div class="max-w-7xl mx-auto space-y-8">
        
        <!-- Header Banner -->
        <div class="bg-gradient-to-r from-indigo-700 via-indigo-800 to-purple-900 rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="absolute -right-10 -top-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute -left-10 -bottom-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div class="relative z-10 space-y-3">
            <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-extrabold border border-white/20">
              <span class="text-indigo-200">👨‍👩‍👧‍👦 CodeRa Parent Hub</span>
              <span class="text-emerald-300">• Family & Student Portal</span>
            </div>
            <h1 class="text-3xl md:text-4xl font-black tracking-tight">
              Welcome to your Parent Hub 👋
            </h1>
            <p class="text-indigo-100 text-sm md:text-base max-w-2xl font-medium leading-relaxed">
              Track your child's digital progress, review AI placement evaluation matrixes, or register additional children into CodeRa's inclusive tech ecosystem.
            </p>
          </div>

          <!-- Quick Navigation Actions -->
          <div class="relative z-10 flex flex-wrap gap-3">
            <button id="parentHubHomeBtn" class="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm transition-all flex items-center gap-2 hover:scale-[1.02] cursor-pointer">
              <i class="fa-solid fa-house"></i> Main Landing Page
            </button>
            <button id="parentHubCEOBtn" class="px-5 py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-500 text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-emerald-400/30 flex items-center gap-2 hover:scale-[1.02] cursor-pointer">
              <i class="fa-solid fa-chart-line"></i> Admin (CEO) Dashboard
            </button>
          </div>
        </div>

        <!-- High-Level Overview Metrics -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl font-bold">
              👶
            </div>
            <div>
              <div class="text-2xl font-black text-slate-900 dark:text-white">${registry.length}</div>
              <div class="text-xs font-bold text-slate-400">Registered Students</div>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-bold">
              ✅
            </div>
            <div>
              <div class="text-2xl font-black text-slate-900 dark:text-white">${completedAssessmentsCount}</div>
              <div class="text-xs font-bold text-slate-400">Completed Assessments</div>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl font-bold">
              ⭐
            </div>
            <div>
              <div class="text-2xl font-black text-slate-900 dark:text-white">${avgScore !== null ? `${avgScore}/100` : 'N/A'}</div>
              <div class="text-xs font-bold text-slate-400">Avg Placement Score</div>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl font-bold">
              🛡️
            </div>
            <div>
              <div class="text-2xl font-black text-slate-900 dark:text-white">Active</div>
              <div class="text-xs font-bold text-slate-400">Inclusive Accommodations</div>
            </div>
          </div>
        </div>

        <!-- Section Title & Grid -->
        <div>
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <i class="fa-solid fa-children text-indigo-600"></i>
                <span>Registered Children (${registry.length})</span>
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Select a student profile to manage registration or launch placement testing</p>
            </div>
            <button id="topAddNewChildBtn" class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02]">
              <i class="fa-solid fa-plus"></i> Add New Child
            </button>
          </div>

          <!-- Children Cards Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${childrenCardsHtml}
            ${addNewChildCardHtml}
          </div>
        </div>

        <!-- Parent Insights & Guidance Banner -->
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-lg">
          <h3 class="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <i class="fa-solid fa-lightbulb text-amber-500"></i>
            <span>Understanding CodeRa's AI Evaluation Engine</span>
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div class="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold flex-shrink-0">
                🎯
              </div>
              <div>
                <h4 class="font-extrabold text-slate-900 dark:text-white text-sm mb-1">50-Question Dynamic Assessment</h4>
                <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Adaptive challenges measuring logical thinking, spatial reasoning, algorithmic problem-solving, and digital dexterity without timed pressure.
                </p>
              </div>
            </div>

            <div class="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-bold flex-shrink-0">
                🧠
              </div>
              <div>
                <h4 class="font-extrabold text-slate-900 dark:text-white text-sm mb-1">Inclusive Accommodations</h4>
                <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Tailored support for ADHD, Autism, Dyslexia, and speech delay with smart rest breaks, audio text-to-speech, and high-contrast visuals.
                </p>
              </div>
            </div>

            <div class="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div class="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-xl font-bold flex-shrink-0">
                📊
              </div>
              <div>
                <h4 class="font-extrabold text-slate-900 dark:text-white text-sm mb-1">Exportable Real-Time Matrix</h4>
                <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Detailed skill breakdowns across 6 competency domains with one-click official PDF placement report downloads.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;

  // Attach Event Listeners
  const homeBtn = container.querySelector('#parentHubHomeBtn');
  if (homeBtn) {
    homeBtn.addEventListener('click', () => returnToLandingPage());
  }

  const ceoBtn = container.querySelector('#parentHubCEOBtn');
  if (ceoBtn) {
    ceoBtn.addEventListener('click', () => renderCEODashboard(container));
  }

  const addBtnCard = container.querySelector('#addNewChildBtnCard');
  if (addBtnCard) {
    addBtnCard.addEventListener('click', openNewChildModal);
  }

  const topAddBtn = container.querySelector('#topAddNewChildBtn');
  if (topAddBtn) {
    topAddBtn.addEventListener('click', openNewChildModal);
  }

  // View Report Buttons
  container.querySelectorAll('.view-child-report-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-child-report');
      const session = sessions.find(s => s.student_name.toLowerCase().trim() === (name || '').toLowerCase().trim()) || sessions[0];
      if (session) {
        const placement = PlacementEngine.evaluatePlacement(
          session.total_score,
          session.domain_scores,
          session.item_telemetries,
          session.schema_version || '2.0'
        );
        renderReportDashboard(container, session, placement);
      }
    });
  });

  // Book Now Payment Gateway Buttons
  container.querySelectorAll('.book-now-payment-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const track = btn.getAttribute('data-child-track') || 'Foundational Coder (L1)';
      const modal = new PaymentModal(() => {
        renderParentDashboard(container);
      });
      modal.open(track, '$299');
    });
  });

  // Start Assessment Buttons
  container.querySelectorAll('.start-child-test-btn, .retake-child-test-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-child-start') || btn.getAttribute('data-child-retake') || 'Alex Rivers';
      localStorage.setItem('codera_last_student_name', name);
      
      const childTestPage = document.getElementById('childTestPage');
      if (childTestPage) {
        document.body.classList.add('exam-mode');
        childTestPage.classList.remove('hidden');
        childTestPage.classList.add('exam-active');
        window.scrollTo(0, 0);
        
        if (typeof (window as any).initAssessment === 'function') {
          (window as any).initAssessment(name, false);
        } else {
          AssessmentRunner.clearSavedSession();
          const runner = new AssessmentRunner(container);
          runner.startSession(name, false);
        }
      }
    });
  });
}

