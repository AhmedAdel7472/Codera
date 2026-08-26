export interface ParentProfileData {
  id: string;
  studentFullName: string;
  age: number;
  diagnosis: string;
  diagnosisNotes: string;
  medicalReportName?: string;
  medicalReportSize?: string;
  preferredLanguage: 'ar' | 'en';
  gradeLevel: string;
  devices: string[];
  priorExperience: string;
  digitalSkills: string[];
  passions: string[];
  registeredAt: string;
}

export class ParentRegistrationModal {
  private modalContainer: HTMLElement | null = null;
  private currentStage: 1 | 2 = 1;

  // Persistent Form State across stage transitions
  private studentFullName: string = '';
  private age: number = 8;
  private diagnosis: string = 'None';
  private diagnosisNotes: string = '';
  private preferredLanguage: 'ar' | 'en' = 'en';
  private gradeLevel: string = 'Grade 1-3';
  private priorExperience: string = 'None';
  private devices: string[] = ['Tablet/iPad', 'Laptop'];
  private selectedFile: { name: string; size: string } | null = null;
  private selectedPassions: Set<string> = new Set(['LEGO', 'Robots', 'Games']);
  private selectedSkills: Set<string> = new Set([
    'Mouse / Touch Screen Control 🖱️',
    'Following Visual & Verbal Instructions 🔊',
    'Simple Logic & Puzzle Solving 🧩'
  ]);

  private onSubmitSuccess?: (profile: ParentProfileData) => void;

  constructor(onSubmitSuccess?: (profile: ParentProfileData) => void) {
    this.onSubmitSuccess = onSubmitSuccess;
    const lastSavedName = localStorage.getItem('codera_last_student_name');
    if (lastSavedName) {
      this.studentFullName = lastSavedName;
    }
  }

  public render(targetElement?: HTMLElement): HTMLElement {
    let container = document.getElementById('parent-registration-modal-root');
    if (!container) {
      container = document.createElement('div');
      container.id = 'parent-registration-modal-root';
      document.body.appendChild(container);
    }
    this.modalContainer = container;
    this.modalContainer.innerHTML = this.getModalHtml();
    this.attachEventListeners();
    return this.modalContainer;
  }

  public open(stage: 1 | 2 = 1) {
    this.currentStage = stage;
    this.render();
    const modalEl = document.getElementById('parentRegistrationModal');
    if (modalEl) {
      modalEl.classList.remove('hidden');
      modalEl.classList.add('flex');
      document.body.style.overflow = 'hidden';
    }
  }

  public close() {
    const modalEl = document.getElementById('parentRegistrationModal');
    if (modalEl) {
      modalEl.classList.add('hidden');
      modalEl.classList.remove('flex');
      document.body.style.overflow = '';
    }
  }

  private saveStage1InputsToState() {
    const nameInput = document.getElementById('regStudentFullName') as HTMLInputElement;
    const ageSelect = document.getElementById('regAge') as HTMLSelectElement;
    const diagnosisSelect = document.getElementById('regDiagnosis') as HTMLSelectElement;
    const notesText = document.getElementById('regDiagnosisNotes') as HTMLTextAreaElement;
    const gradeSelect = document.getElementById('regGradeLevel') as HTMLSelectElement;
    const expSelect = document.getElementById('regPriorExperience') as HTMLSelectElement;

    if (nameInput) this.studentFullName = nameInput.value.trim();
    if (ageSelect) this.age = parseInt(ageSelect.value || '8', 10);
    if (diagnosisSelect) this.diagnosis = diagnosisSelect.value || 'None';
    if (notesText) this.diagnosisNotes = notesText.value || '';
    if (gradeSelect) this.gradeLevel = gradeSelect.value || 'Grade 1-3';
    if (expSelect) this.priorExperience = expSelect.value || 'None';

    const langRadio = document.querySelector('input[name="prefLang"]:checked') as HTMLInputElement;
    if (langRadio) this.preferredLanguage = (langRadio.value === 'ar' ? 'ar' : 'en');

    const deviceNodes = document.querySelectorAll('input[name="deviceOption"]:checked');
    this.devices = [];
    deviceNodes.forEach(node => this.devices.push((node as HTMLInputElement).value));
  }

  private getModalHtml(): string {
    return `
      <div id="parentRegistrationModal" class="fixed inset-0 z-[100001] hidden items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 md:p-6 overflow-y-auto" dir="ltr">
        <div class="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 animate-fadeIn transition-all">
          
          <!-- Header Banner -->
          <div class="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 p-6 md:p-7 text-white relative">
            <button id="closeParentModalBtn" class="absolute right-5 top-5 w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-all cursor-pointer shadow-sm hover:scale-105" title="Close">
              <i class="fa-solid fa-xmark text-lg"></i>
            </button>
            
            <div class="flex items-center gap-2 mb-2 flex-wrap">
              <span class="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-wide flex items-center gap-1.5">
                <i class="fa-solid fa-shield-check text-emerald-300"></i> CodeRa AI Assessment Profile
              </span>
              <span class="px-3 py-1 bg-emerald-400/25 text-emerald-200 border border-emerald-400/30 rounded-full text-xs font-bold flex items-center gap-1">
                <i class="fa-solid fa-lock text-xs"></i> 100% Encrypted &amp; Confidential
              </span>
            </div>

            <h2 class="text-2xl md:text-3xl font-black flex items-center gap-2.5 text-white">
              <span>👶 Add Child / Student Profile</span>
            </h2>
            <p class="text-emerald-100 text-xs md:text-sm mt-1 max-w-xl leading-relaxed">
              Register your child's profile with tailored diagnostic background and sensory preferences to launch their personalized AI learning journey.
            </p>

            <!-- Stepper Progress Bar -->
            <div class="mt-6 flex items-center justify-between relative max-w-md mx-auto">
              <div class="absolute top-1/2 left-0 right-0 h-1.5 bg-white/20 -translate-y-1/2 z-0 rounded-full"></div>
              <div class="absolute top-1/2 left-0 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-300 -translate-y-1/2 z-0 transition-all duration-300 rounded-full" style="width: ${this.currentStage === 1 ? '50%' : '100%'}"></div>

              <div class="relative z-10 flex flex-col items-center gap-1">
                <div class="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm transition-all shadow-md ${this.currentStage >= 1 ? 'bg-emerald-400 text-slate-950 ring-4 ring-emerald-400/30' : 'bg-white/20 text-white'}">
                  1
                </div>
                <span class="text-xs font-extrabold ${this.currentStage === 1 ? 'text-white' : 'text-emerald-200'}">Student Details</span>
              </div>

              <div class="relative z-10 flex flex-col items-center gap-1">
                <div class="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm transition-all shadow-md ${this.currentStage === 2 ? 'bg-emerald-400 text-slate-950 ring-4 ring-emerald-400/30' : 'bg-white/20 text-white'}">
                  2
                </div>
                <span class="text-xs font-extrabold ${this.currentStage === 2 ? 'text-white' : 'text-emerald-200'}">Skills &amp; Passions</span>
              </div>
            </div>
          </div>

          <!-- Modal Body Content -->
          <div class="p-6 md:p-8 max-h-[65vh] overflow-y-auto custom-scrollbar">
            ${this.currentStage === 1 ? this.getStage1Html() : this.getStage2Html()}
          </div>

          <!-- Modal Footer Controls -->
          <div class="p-4 md:p-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            ${this.currentStage === 2 ? `
              <button id="prevStageBtn" class="px-5 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-extrabold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 cursor-pointer text-sm">
                <i class="fa-solid fa-arrow-left"></i> <span>Back to Details</span>
              </button>
            ` : `
              <button id="cancelModalBtn" class="px-5 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-sm">
                Cancel
              </button>
            `}

            ${this.currentStage === 1 ? `
              <button id="nextStageBtn" class="px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2 text-base cursor-pointer hover:scale-[1.01]">
                <span>Next: Skills &amp; Passions</span>
                <i class="fa-solid fa-arrow-right"></i>
              </button>
            ` : `
              <button id="submitRegistrationBtn" class="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black shadow-xl shadow-emerald-500/35 transition-all flex items-center gap-2.5 text-base transform hover:scale-[1.02] cursor-pointer">
                <i class="fa-solid fa-rocket text-lg"></i>
                <span>Save Profile &amp; Start AI Assessment 🚀</span>
              </button>
            `}
          </div>

        </div>
      </div>
    `;
  }

  private getStage1Html(): string {
    return `
      <form id="stage1Form" class="space-y-6" onsubmit="event.preventDefault();">
        <div class="flex items-center gap-2.5 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <i class="fa-solid fa-user-graduate"></i>
          </div>
          <div>
            <h3 class="text-base font-extrabold text-slate-900 dark:text-white">Step 1: Student Information &amp; Special Needs Profile</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Basic details to personalize assessment questions and difficulty pacing.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- Student Full Name -->
          <div>
            <label class="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Student Full Name <span class="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="regStudentFullName"
              required
              placeholder="e.g., Alex Rivers"
              class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              value="${this.studentFullName}"
            />
          </div>

          <!-- Age -->
          <div>
            <label class="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Age (Years) <span class="text-rose-500">*</span>
            </label>
            <select id="regAge" required class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all">
              ${Array.from({ length: 15 }, (_, i) => i + 4).map(a => `
                <option value="${a}" ${this.age === a ? 'selected' : ''}>${a} years old</option>
              `).join('')}
            </select>
          </div>

          <!-- Diagnosis -->
          <div>
            <label class="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Diagnosis / Learning Profile (If applicable)
            </label>
            <select id="regDiagnosis" class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all">
              <option value="None" ${this.diagnosis === 'None' ? 'selected' : ''}>Typical / No Specific Diagnosis</option>
              <option value="Autism" ${this.diagnosis === 'Autism' ? 'selected' : ''}>Autism Spectrum Disorder (ASD)</option>
              <option value="ADHD" ${this.diagnosis === 'ADHD' ? 'selected' : ''}>Attention Deficit Hyperactivity Disorder (ADHD)</option>
              <option value="Dyslexia" ${this.diagnosis === 'Dyslexia' ? 'selected' : ''}>Dyslexia &amp; Learning Difficulties</option>
              <option value="Speech/Language" ${this.diagnosis === 'Speech/Language' ? 'selected' : ''}>Speech &amp; Language Delay</option>
              <option value="DownSyndrome" ${this.diagnosis === 'DownSyndrome' ? 'selected' : ''}>Down Syndrome</option>
              <option value="Other" ${this.diagnosis === 'Other' ? 'selected' : ''}>Other Special Educational Needs (SEN)</option>
            </select>
          </div>

          <!-- Academic Grade Level -->
          <div>
            <label class="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Academic Grade Level
            </label>
            <select id="regGradeLevel" class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all">
              <option value="KG" ${this.gradeLevel === 'KG' ? 'selected' : ''}>Kindergarten (KG1 - KG2)</option>
              <option value="Grade 1-3" ${this.gradeLevel === 'Grade 1-3' ? 'selected' : ''}>Lower Elementary (Grade 1 - 3)</option>
              <option value="Grade 4-6" ${this.gradeLevel === 'Grade 4-6' ? 'selected' : ''}>Upper Elementary (Grade 4 - 6)</option>
              <option value="Grade 7-9" ${this.gradeLevel === 'Grade 7-9' ? 'selected' : ''}>Middle School (Grade 7 - 9)</option>
              <option value="Grade 10+" ${this.gradeLevel === 'Grade 10+' ? 'selected' : ''}>High School / Preparatory</option>
              <option value="SpecialEd" ${this.gradeLevel === 'SpecialEd' ? 'selected' : ''}>Specialized Education Program</option>
            </select>
          </div>
        </div>

        <!-- Diagnosis Notes & Accommodations -->
        <div>
          <label class="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Diagnosis Notes &amp; Assessment Accommodations
          </label>
          <textarea
            id="regDiagnosisNotes"
            rows="2"
            placeholder="Specify any accommodation preferences (e.g. text-to-speech reading, enlarged fonts, sign language support, extra rest intervals...)"
            class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none text-sm"
          >${this.diagnosisNotes}</textarea>
        </div>

        <!-- Medical Report File Upload Dropzone -->
        <div>
          <label class="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Upload Diagnostic / Educational Reports (Optional)
          </label>
          <div id="dropzoneContainer" class="border-2 border-dashed border-emerald-300 dark:border-slate-700 hover:border-emerald-500 rounded-2xl p-5 text-center bg-emerald-50/40 dark:bg-slate-800/40 cursor-pointer transition-all hover:bg-emerald-50/70">
            <input type="file" id="medicalReportInput" accept=".pdf,.jpg,.jpeg,.png,.docx" class="hidden" />
            
            <div id="dropzonePrompt" class="${this.selectedFile ? 'hidden' : 'space-y-2'}">
              <div class="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shadow-sm">
                <i class="fa-solid fa-cloud-arrow-up"></i>
              </div>
              <p class="text-sm font-bold text-slate-800 dark:text-slate-200">Click or drag &amp; drop medical/school reports</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">Supported: PDF, PNG, JPG, DOCX (Up to 15 MB)</p>
            </div>

            <div id="dropzoneFileSelected" class="${this.selectedFile ? 'flex' : 'hidden'} items-center justify-center gap-3 text-emerald-700 dark:text-emerald-300 font-bold text-sm py-2">
              <i class="fa-solid fa-file-circle-check text-2xl text-emerald-500"></i>
              <span id="fileNameText">${this.selectedFile ? `${this.selectedFile.name} (${this.selectedFile.size})` : ''}</span>
              <button type="button" id="removeFileBtn" class="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg text-xs font-bold transition-all cursor-pointer ml-2">
                Remove ✕
              </button>
            </div>
          </div>
        </div>

        <!-- Language & Prior Experience -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- Preferred Language -->
          <div>
            <label class="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Preferred Learning Language
            </label>
            <div class="grid grid-cols-2 gap-3">
              <label class="flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${this.preferredLanguage === 'en' ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 font-black' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}">
                <input type="radio" name="prefLang" value="en" ${this.preferredLanguage === 'en' ? 'checked' : ''} class="text-emerald-600 focus:ring-emerald-500" />
                <span class="text-sm">English 🇬🇧</span>
              </label>
              <label class="flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${this.preferredLanguage === 'ar' ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 font-black' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}">
                <input type="radio" name="prefLang" value="ar" ${this.preferredLanguage === 'ar' ? 'checked' : ''} class="text-emerald-600 focus:ring-emerald-500" />
                <span class="text-sm">Arabic 🇪🇬</span>
              </label>
            </div>
          </div>

          <!-- Prior Experience -->
          <div>
            <label class="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Prior Tech &amp; Coding Experience
            </label>
            <select id="regPriorExperience" class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all">
              <option value="None" ${this.priorExperience === 'None' ? 'selected' : ''}>Complete Beginner (No prior experience)</option>
              <option value="ScratchJr" ${this.priorExperience === 'ScratchJr' ? 'selected' : ''}>Scratch Jr / Block Coding</option>
              <option value="LEGO" ${this.priorExperience === 'LEGO' ? 'selected' : ''}>LEGO Robotics (SPIKE / WeDo / Mindstorms)</option>
              <option value="Scratch" ${this.priorExperience === 'Scratch' ? 'selected' : ''}>Scratch 3.0 Visual Logic</option>
              <option value="PythonWeb" ${this.priorExperience === 'PythonWeb' ? 'selected' : ''}>Python / Web Programming</option>
            </select>
          </div>
        </div>

        <!-- Devices Used at Home -->
        <div>
          <label class="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Home Devices Available (Select all that apply)
          </label>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            ${[
              { id: 'devTablet', label: 'Tablet / iPad 📱', val: 'Tablet/iPad' },
              { id: 'devLaptop', label: 'Laptop 💻', val: 'Laptop' },
              { id: 'devPC', label: 'Desktop PC 🖥️', val: 'Desktop PC' },
              { id: 'devPhone', label: 'Smartphone 📱', val: 'Smartphone' }
            ].map(d => {
              const isChecked = this.devices.includes(d.val);
              return `
                <label class="flex items-center gap-2.5 p-3 rounded-xl border-2 ${isChecked ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 font-bold' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'} cursor-pointer hover:border-emerald-400 transition-all text-xs">
                  <input type="checkbox" name="deviceOption" value="${d.val}" ${isChecked ? 'checked' : ''} class="rounded text-emerald-600 focus:ring-emerald-500" />
                  <span>${d.label}</span>
                </label>
              `;
            }).join('')}
          </div>
        </div>
      </form>
    `;
  }

  private getStage2Html(): string {
    const passionsList = [
      { id: 'LEGO', label: 'LEGO Bricks', icon: '🧩', bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 text-red-700 dark:text-red-300' },
      { id: 'Robots', label: 'Robots & Hardware', icon: '🤖', bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 text-blue-700 dark:text-blue-300' },
      { id: 'Drawing', label: 'Digital Art & Drawing', icon: '🎨', bg: 'bg-pink-50 dark:bg-pink-950/30 border-pink-200 text-pink-700 dark:text-pink-300' },
      { id: 'Games', label: 'Games & Design', icon: '🎮', bg: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 text-purple-700 dark:text-purple-300' },
      { id: 'Math', label: 'Math & Puzzles', icon: '📐', bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 text-amber-700 dark:text-amber-300' },
      { id: 'Computers', label: 'Coding & Tech', icon: '💻', bg: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 text-indigo-700 dark:text-indigo-300' },
      { id: 'Music', label: 'Music & Audio', icon: '🎵', bg: 'bg-teal-50 dark:bg-teal-950/30 border-teal-200 text-teal-700 dark:text-teal-300' },
      { id: 'Science', label: 'Science & Discovery', icon: '🔬', bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 text-emerald-700 dark:text-emerald-300' }
    ];

    const skillsList = [
      'Mouse / Touch Screen Control 🖱️',
      'Keyboard Typing & Text Input ⌨️',
      'Simple Logic & Puzzle Solving 🧩',
      'Audio & Video Media Controls 🎧',
      'Following Visual & Verbal Instructions 🔊',
      'File Management & Navigation 📁'
    ];

    return `
      <div class="space-y-6 animate-fadeIn">
        <div class="flex items-center gap-2.5 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div class="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <i class="fa-solid fa-lightbulb"></i>
          </div>
          <div>
            <h3 class="text-base font-extrabold text-slate-900 dark:text-white">Step 2: Digital Skills &amp; Passions Survey</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">We incorporate your child's favorite themes into problem statements and gamified challenges.</p>
          </div>
        </div>

        <!-- Daily Digital Skills Checklist -->
        <div>
          <label class="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Daily Digital Skills &amp; Competencies
          </label>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            ${skillsList.map((skill) => {
              const isChecked = this.selectedSkills.has(skill);
              return `
                <label class="flex items-center gap-3 p-3.5 rounded-xl border-2 ${isChecked ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-bold' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'} cursor-pointer hover:border-emerald-400 transition-all text-xs">
                  <input type="checkbox" class="skill-checkbox rounded text-emerald-600 focus:ring-emerald-500" value="${skill}" ${isChecked ? 'checked' : ''} />
                  <span>${skill}</span>
                </label>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Passions & Interests Badges -->
        <div>
          <label class="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Passions &amp; Favorite Topic Badges
          </label>
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-3">Click badges to select what makes your child excited to learn:</p>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            ${passionsList.map(item => {
              const isSelected = this.selectedPassions.has(item.id);
              return `
                <button type="button" data-passion="${item.id}" class="passion-badge-btn flex items-center justify-center gap-2 p-3.5 rounded-2xl border-2 transition-all font-black text-xs cursor-pointer ${item.bg} ${isSelected ? 'ring-4 ring-emerald-500 border-emerald-500 scale-[1.03] shadow-md' : 'opacity-75 hover:opacity-100 hover:scale-[1.01]'}">
                  <span class="text-xl">${item.icon}</span>
                  <span>${item.label}</span>
                  ${isSelected ? '<i class="fa-solid fa-circle-check text-emerald-600 text-xs ml-1"></i>' : ''}
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Quick Summary Box -->
        <div class="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-3.5">
          <div class="text-emerald-600 text-xl font-bold mt-0.5">🚀</div>
          <div class="text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed">
            <strong>Ready for AI Placement:</strong><br />
            Upon clicking Submit, your child's profile will be registered and saved to your Parent Hub. You will immediately proceed to the 50-question adaptive AI placement assessment to identify their initial competency level and recommended track.
          </div>
        </div>
      </div>
    `;
  }

  private attachEventListeners() {
    const modalOverlay = document.getElementById('parentRegistrationModal');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          this.close();
        }
      });
    }

    const closeBtn = document.getElementById('closeParentModalBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    const cancelBtn = document.getElementById('cancelModalBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.close());
    }

    const nextBtn = document.getElementById('nextStageBtn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const nameInput = document.getElementById('regStudentFullName') as HTMLInputElement;
        if (!nameInput || !nameInput.value.trim()) {
          alert('Please enter the student\'s full name to proceed.');
          nameInput?.focus();
          return;
        }
        this.saveStage1InputsToState();
        localStorage.setItem('codera_last_student_name', this.studentFullName);
        this.open(2);
      });
    }

    const prevBtn = document.getElementById('prevStageBtn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.open(1);
      });
    }

    // Dropzone upload interaction
    const dropzone = document.getElementById('dropzoneContainer');
    const medicalInput = document.getElementById('medicalReportInput') as HTMLInputElement;
    const removeFileBtn = document.getElementById('removeFileBtn');

    if (dropzone && medicalInput) {
      dropzone.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).id !== 'removeFileBtn' && !(e.target as HTMLElement).closest('#removeFileBtn')) {
          medicalInput.click();
        }
      });

      medicalInput.addEventListener('change', () => {
        if (medicalInput.files && medicalInput.files[0]) {
          const file = medicalInput.files[0];
          this.selectedFile = {
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
          };
          this.updateDropzoneUI();
        }
      });
    }

    if (removeFileBtn) {
      removeFileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectedFile = null;
        if (medicalInput) medicalInput.value = '';
        this.updateDropzoneUI();
      });
    }

    // Passions badges click toggle
    document.querySelectorAll('.passion-badge-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const passion = btn.getAttribute('data-passion');
        if (passion) {
          if (this.selectedPassions.has(passion)) {
            this.selectedPassions.delete(passion);
          } else {
            this.selectedPassions.add(passion);
          }
          this.open(2);
        }
      });
    });

    // Skill checkboxes change
    document.querySelectorAll('.skill-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const val = (e.target as HTMLInputElement).value;
        if ((e.target as HTMLInputElement).checked) {
          this.selectedSkills.add(val);
        } else {
          this.selectedSkills.delete(val);
        }
      });
    });

    // Final Submit Button
    const submitBtn = document.getElementById('submitRegistrationBtn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.handleSubmit());
    }
  }

  private updateDropzoneUI() {
    const prompt = document.getElementById('dropzonePrompt');
    const selected = document.getElementById('dropzoneFileSelected');
    const nameText = document.getElementById('fileNameText');

    if (this.selectedFile && selected && prompt && nameText) {
      prompt.classList.add('hidden');
      selected.classList.remove('hidden');
      nameText.textContent = `${this.selectedFile.name} (${this.selectedFile.size})`;
    } else if (prompt && selected) {
      prompt.classList.remove('hidden');
      selected.classList.add('hidden');
    }
  }

  private handleSubmit() {
    const profileData: ParentProfileData = {
      id: 'STU-' + Math.floor(100000 + Math.random() * 900000),
      studentFullName: this.studentFullName || 'Alex Rivers',
      age: this.age,
      diagnosis: this.diagnosis,
      diagnosisNotes: this.diagnosisNotes,
      medicalReportName: this.selectedFile?.name,
      medicalReportSize: this.selectedFile?.size,
      preferredLanguage: this.preferredLanguage,
      gradeLevel: this.gradeLevel,
      devices: this.devices,
      priorExperience: this.priorExperience,
      digitalSkills: Array.from(this.selectedSkills),
      passions: Array.from(this.selectedPassions),
      registeredAt: new Date().toISOString()
    };

    // Save to local storage
    localStorage.setItem('codera_parent_profile', JSON.stringify(profileData));
    localStorage.setItem('codera_student_profile', JSON.stringify(profileData));

    // Append to registry list for CEO and Parent dashboard
    try {
      const existing = localStorage.getItem('codera_student_registry');
      const registry: ParentProfileData[] = existing ? JSON.parse(existing) : [];
      registry.unshift(profileData);
      localStorage.setItem('codera_student_registry', JSON.stringify(registry));
    } catch (e) {}

    this.close();

    if (this.onSubmitSuccess) {
      this.onSubmitSuccess(profileData);
    } else if (typeof (window as any).startChildTest === 'function') {
      (window as any).startChildTest(false);
    } else if (typeof (window as any).initAssessment === 'function') {
      (window as any).initAssessment(profileData.studentFullName, false);
    }
  }
}
