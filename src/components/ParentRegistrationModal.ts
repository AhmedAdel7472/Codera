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
  private selectedFile: { name: string; size: string } | null = null;
  private selectedPassions: Set<string> = new Set(['LEGO', 'Robots']);
  private selectedSkills: Set<string> = new Set(['Mouse/Touch Navigation', 'Following Instructions']);

  private onSubmitSuccess?: (profile: ParentProfileData) => void;

  constructor(onSubmitSuccess?: (profile: ParentProfileData) => void) {
    this.onSubmitSuccess = onSubmitSuccess;
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

  private getModalHtml(): string {
    return `
      <div id="parentRegistrationModal" class="fixed inset-0 z-[300] hidden items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto" dir="ltr">
        <div class="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-indigo-100 dark:border-slate-800 overflow-hidden my-8 animate-fadeIn">
          
          <!-- Header Banner -->
          <div class="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 p-6 text-white relative">
            <button id="closeParentModalBtn" class="absolute right-5 top-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer" title="Close">
              <i class="fa-solid fa-xmark text-lg"></i>
            </button>
            <div class="flex items-center gap-3 mb-2">
              <span class="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-wide">
                <i class="fa-solid fa-clock mr-1"></i> Est. Time: 5 mins
              </span>
              <span class="px-3 py-1 bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 rounded-full text-xs font-bold">
                <i class="fa-solid fa-shield-halved mr-1"></i> 100% Encrypted & Secure
              </span>
            </div>
            <h2 class="text-2xl font-extrabold flex items-center gap-2">
              <span>👨‍👩‍👧‍👦 Parent & Child Registration</span>
              <span class="text-xs bg-indigo-500/50 px-2.5 py-0.5 rounded-lg border border-indigo-400/30">CodeRa AI</span>
            </h2>
            <p class="text-indigo-100 text-sm mt-1">Register your child's profile to build their tailored learning track and launch AI placement assessment.</p>

            <!-- Stepper Progress Bar -->
            <div class="mt-6 flex items-center justify-between relative max-w-md mx-auto">
              <div class="absolute top-1/2 left-0 right-0 h-1 bg-white/20 -translate-y-1/2 z-0"></div>
              <div class="absolute top-1/2 left-0 h-1 bg-emerald-400 -translate-y-1/2 z-0 transition-all duration-300" style="width: ${this.currentStage === 1 ? '50%' : '100%'}"></div>

              <div class="relative z-10 flex flex-col items-center gap-1">
                <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${this.currentStage >= 1 ? 'bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-400/30' : 'bg-white/20 text-white'}">
                  1
                </div>
                <span class="text-xs font-semibold ${this.currentStage === 1 ? 'text-white font-bold' : 'text-indigo-200'}">Student Details</span>
              </div>

              <div class="relative z-10 flex flex-col items-center gap-1">
                <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${this.currentStage === 2 ? 'bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-400/30' : 'bg-white/20 text-white'}">
                  2
                </div>
                <span class="text-xs font-semibold ${this.currentStage === 2 ? 'text-white font-bold' : 'text-indigo-200'}">Skills & Passions</span>
              </div>
            </div>
          </div>

          <!-- Modal Body Content -->
          <div class="p-6 md:p-8 max-h-[70vh] overflow-y-auto">
            ${this.currentStage === 1 ? this.getStage1Html() : this.getStage2Html()}
          </div>

          <!-- Modal Footer Controls -->
          <div class="p-4 md:p-6 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            ${this.currentStage === 2 ? `
              <button id="prevStageBtn" class="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer">
                <i class="fa-solid fa-arrow-left"></i> Back
              </button>
            ` : `<div></div>`}

            ${this.currentStage === 1 ? `
              <button id="nextStageBtn" class="px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 text-base cursor-pointer hover:scale-[1.01]">
                <span>Next: Skills & Passions</span>
                <i class="fa-solid fa-arrow-right"></i>
              </button>
            ` : `
              <button id="submitRegistrationBtn" class="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold shadow-xl shadow-emerald-500/30 transition-all flex items-center gap-2 text-base transform hover:scale-[1.02] cursor-pointer">
                <i class="fa-solid fa-rocket text-xl"></i>
                <span>Submit & Start 50-Q Assessment 🚀</span>
              </button>
            `}
          </div>

        </div>
      </div>
    `;
  }

  private getStage1Html(): string {
    return `
      <form id="stage1Form" class="space-y-6">
        <div class="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
          <i class="fa-solid fa-user-graduate text-indigo-600 text-xl"></i>
          <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100">Stage 1: Basic Student & Parent Information</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- Student Full Name -->
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Student Full Name <span class="text-rose-500">*</span>
            </label>
            <input type="text" id="regStudentFullName" required placeholder="e.g., Alex Rivers" class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" value="${localStorage.getItem('codera_last_student_name') || ''}" />
          </div>

          <!-- Age -->
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Age (Years) <span class="text-rose-500">*</span>
            </label>
            <select id="regAge" required class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
              ${Array.from({ length: 15 }, (_, i) => i + 4).map(age => `
                <option value="${age}" ${age === 8 ? 'selected' : ''}>${age} years old</option>
              `).join('')}
            </select>
          </div>

          <!-- Diagnosis -->
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Diagnosis / Learning Profile (If applicable)
            </label>
            <select id="regDiagnosis" class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
              <option value="None">Typical / No Diagnosis</option>
              <option value="ADHD">Attention Deficit Hyperactivity Disorder (ADHD)</option>
              <option value="Autism">Autism Spectrum Disorder (ASD)</option>
              <option value="Dyslexia">Dyslexia & Learning Difficulties</option>
              <option value="Speech/Language">Speech & Language Delay</option>
              <option value="DownSyndrome">Down Syndrome</option>
              <option value="Other">Other Diagnosis / Special Needs</option>
            </select>
          </div>

          <!-- Academic Grade Level -->
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Academic Grade Level
            </label>
            <select id="regGradeLevel" class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
              <option value="KG">Kindergarten (KG1 - KG2)</option>
              <option value="Grade 1-3" selected>Lower Elementary (Grade 1 - 3)</option>
              <option value="Grade 4-6">Upper Elementary (Grade 4 - 6)</option>
              <option value="Grade 7-9">Middle School (Grade 7 - 9)</option>
              <option value="Grade 10+">High School or Above</option>
              <option value="SpecialEd">Special Education Program</option>
            </select>
          </div>
        </div>

        <!-- Diagnosis Notes & Accommodations -->
        <div>
          <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Diagnosis Notes & Assessment Accommodations
          </label>
          <textarea id="regDiagnosisNotes" rows="2" placeholder="Detail any accommodations to customize your child's assessment environment (e.g. text-to-speech reading, enlarged fonts, frequent rest breaks...)" class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"></textarea>
        </div>

        <!-- Medical Report File Upload Dropzone -->
        <div>
          <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Upload Medical or Educational Reports (Optional)
          </label>
          <div id="dropzoneContainer" class="border-2 border-dashed border-indigo-200 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-5 text-center bg-indigo-50/40 dark:bg-slate-800/40 cursor-pointer transition-all">
            <input type="file" id="medicalReportInput" accept=".pdf,.jpg,.jpeg,.png" class="hidden" />
            <div id="dropzonePrompt" class="space-y-2">
              <div class="w-12 h-12 mx-auto rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl">
                <i class="fa-solid fa-cloud-arrow-up"></i>
              </div>
              <p class="text-sm font-bold text-slate-700 dark:text-slate-200">Drag & drop files here or click to browse</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">Supports PDF, PNG, JPG up to 10 MB</p>
            </div>
            <div id="dropzoneFileSelected" class="hidden flex items-center justify-center gap-3 text-emerald-600 dark:text-emerald-400 font-bold text-sm py-2">
              <i class="fa-solid fa-file-check text-xl"></i>
              <span id="fileNameText">report.pdf</span>
              <button type="button" id="removeFileBtn" class="text-rose-500 hover:text-rose-700 text-xs ml-2 cursor-pointer">Remove ✕</button>
            </div>
          </div>
        </div>

        <!-- Language & Prior Experience -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- Preferred Language -->
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Preferred Learning Language
            </label>
            <div class="grid grid-cols-2 gap-3">
              <label class="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <input type="radio" name="prefLang" value="en" checked class="text-indigo-600 focus:ring-indigo-500" />
                <span class="font-bold text-sm text-slate-800 dark:text-slate-200">English 🇬🇧</span>
              </label>
              <label class="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <input type="radio" name="prefLang" value="ar" class="text-indigo-600 focus:ring-indigo-500" />
                <span class="font-bold text-sm text-slate-800 dark:text-slate-200">Arabic 🇪🇬</span>
              </label>
            </div>
          </div>

          <!-- Prior Experience -->
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Prior Tech & Coding Experience
            </label>
            <select id="regPriorExperience" class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
              <option value="None">Complete Beginner (No prior experience)</option>
              <option value="ScratchJr">Scratch Jr Coding</option>
              <option value="LEGO">LEGO Robotics (SPIKE / WeDo)</option>
              <option value="Scratch">Scratch 3.0 Visual Coding</option>
              <option value="PythonWeb">Python Programming / Web Design</option>
            </select>
          </div>
        </div>

        <!-- Devices Used at Home -->
        <div>
          <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
            Home Devices Available (Select all that apply)
          </label>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            ${[
              { id: 'devTablet', label: 'Tablet / iPad 📱', val: 'Tablet/iPad' },
              { id: 'devPC', label: 'Desktop PC 🖥️', val: 'Desktop PC' },
              { id: 'devLaptop', label: 'Laptop 💻', val: 'Laptop' },
              { id: 'devPhone', label: 'Smartphone 📱', val: 'Smartphone' }
            ].map(d => `
              <label class="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-slate-800 transition-colors text-xs font-bold text-slate-700 dark:text-slate-200">
                <input type="checkbox" name="deviceOption" value="${d.val}" checked class="rounded text-indigo-600 focus:ring-indigo-500" />
                <span>${d.label}</span>
              </label>
            `).join('')}
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
      <div class="space-y-6">
        <div class="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
          <i class="fa-solid fa-lightbulb text-amber-500 text-xl"></i>
          <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100">Stage 2: Digital Skills & Passions Survey</h3>
        </div>

        <!-- Daily Digital Skills Checklist -->
        <div>
          <label class="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
            Daily Digital Skills Checklist
          </label>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            ${skillsList.map((skill, idx) => {
              const isChecked = this.selectedSkills.has(skill) || idx < 3;
              return `
                <label class="flex items-center gap-3 p-3.5 rounded-xl border ${isChecked ? 'border-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 font-bold' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'} cursor-pointer hover:border-indigo-400 transition-all text-xs">
                  <input type="checkbox" class="skill-checkbox rounded text-indigo-600 focus:ring-indigo-500" value="${skill}" ${isChecked ? 'checked' : ''} />
                  <span>${skill}</span>
                </label>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Passions & Interests Badges -->
        <div>
          <label class="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
            Passions & Favorite Topic Badges
          </label>
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-3">Select topic badges to customize problem scenarios with themes and characters your child loves:</p>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            ${passionsList.map(item => {
              const isSelected = this.selectedPassions.has(item.id);
              return `
                <button type="button" data-passion="${item.id}" class="passion-badge-btn flex items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all font-bold text-xs cursor-pointer ${item.bg} ${isSelected ? 'ring-2 ring-indigo-500 scale-[1.03] shadow-md' : 'opacity-80 hover:opacity-100'}">
                  <span class="text-lg">${item.icon}</span>
                  <span>${item.label}</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Quick Summary Box -->
        <div class="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 flex items-start gap-3">
          <div class="text-indigo-600 text-xl font-bold mt-0.5">ℹ️</div>
          <div class="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
            <strong>What happens after submitting?</strong><br />
            The student profile will be registered and saved. You will immediately proceed to the 50-question adaptive AI placement assessment to identify their initial competency level and recommended learning track.
          </div>
        </div>
      </div>
    `;
  }

  private attachEventListeners() {
    const closeBtn = document.getElementById('closeParentModalBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
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
        localStorage.setItem('codera_last_student_name', nameInput.value.trim());
        this.open(2);
      });
    }

    const prevBtn = document.getElementById('prevStageBtn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.open(1));
    }

    // Dropzone upload interaction
    const dropzone = document.getElementById('dropzoneContainer');
    const medicalInput = document.getElementById('medicalReportInput') as HTMLInputElement;
    const removeFileBtn = document.getElementById('removeFileBtn');

    if (dropzone && medicalInput) {
      dropzone.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).id !== 'removeFileBtn') {
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
    const nameInput = document.getElementById('regStudentFullName') as HTMLInputElement;
    const ageSelect = document.getElementById('regAge') as HTMLSelectElement;
    const diagnosisSelect = document.getElementById('regDiagnosis') as HTMLSelectElement;
    const notesText = document.getElementById('regDiagnosisNotes') as HTMLTextAreaElement;
    const gradeSelect = document.getElementById('regGradeLevel') as HTMLSelectElement;
    const expSelect = document.getElementById('regPriorExperience') as HTMLSelectElement;

    const studentName = nameInput?.value?.trim() || 'Alex Rivers';
    const age = parseInt(ageSelect?.value || '8', 10);
    const diagnosis = diagnosisSelect?.value || 'None';
    const diagnosisNotes = notesText?.value || '';
    const gradeLevel = gradeSelect?.value || 'Grade 1-3';
    const priorExperience = expSelect?.value || 'None';

    const langRadio = document.querySelector('input[name="prefLang"]:checked') as HTMLInputElement;
    const preferredLanguage = (langRadio?.value === 'ar' ? 'ar' : 'en') as 'ar' | 'en';

    const deviceNodes = document.querySelectorAll('input[name="deviceOption"]:checked');
    const devices: string[] = [];
    deviceNodes.forEach(node => devices.push((node as HTMLInputElement).value));

    const profileData: ParentProfileData = {
      id: 'STU-' + Math.floor(100000 + Math.random() * 900000),
      studentFullName: studentName,
      age,
      diagnosis,
      diagnosisNotes,
      medicalReportName: this.selectedFile?.name,
      medicalReportSize: this.selectedFile?.size,
      preferredLanguage,
      gradeLevel,
      devices,
      priorExperience,
      digitalSkills: Array.from(this.selectedSkills),
      passions: Array.from(this.selectedPassions),
      registeredAt: new Date().toISOString()
    };

    // Save to local storage
    localStorage.setItem('codera_parent_profile', JSON.stringify(profileData));
    localStorage.setItem('codera_student_profile', JSON.stringify(profileData));

    // Append to registry list for CEO dashboard
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
      (window as any).initAssessment(studentName, false);
    }
  }
}


