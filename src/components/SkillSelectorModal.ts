// ---------------------------------------------------------------------------
// CodeRa Assessment Platform — Skill Selector Modal
// Allows students and parents to select and launch individual skill exams.
// ---------------------------------------------------------------------------

export type SelectedAssessmentType = 'cognitive_ability' | 'all';

export class SkillSelectorModal {
  private modalEl: HTMLElement | null = null;
  private onSelectExam: (examType: SelectedAssessmentType, studentName: string) => void;
  private currentStudentName: string = 'Alex Rivers';

  constructor(onSelectExam: (examType: SelectedAssessmentType, studentName: string) => void) {
    this.onSelectExam = onSelectExam;
  }

  public open(studentName?: string) {
    if (studentName && studentName.trim()) {
      this.currentStudentName = studentName.trim();
    } else {
      try {
        const parentProfile = localStorage.getItem('codera_parent_profile');
        if (parentProfile) {
          const parsed = JSON.parse(parentProfile);
          if (parsed.studentFullName && parsed.studentFullName.trim()) {
            this.currentStudentName = parsed.studentFullName.trim();
          } else if (parsed.childName && parsed.childName.trim()) {
            this.currentStudentName = parsed.childName.trim();
          }
        }
      } catch (e) {}
    }

    this.render();
  }

  public close() {
    if (this.modalEl && this.modalEl.parentNode) {
      this.modalEl.parentNode.removeChild(this.modalEl);
      this.modalEl = null;
    }
  }

  private render() {
    this.close();

    const overlay = document.createElement('div');
    overlay.id = 'skill-selector-modal';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: rgba(10, 15, 29, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      animation: modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    overlay.innerHTML = `
      <div style="
        background: linear-gradient(145deg, rgba(17, 24, 39, 0.95), rgba(15, 23, 42, 0.98));
        border: 1px solid rgba(6, 182, 212, 0.35);
        border-radius: 24px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px rgba(6, 182, 212, 0.15);
        max-width: 820px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        padding: 2.25rem;
        position: relative;
        color: #f8fafc;
        font-family: inherit;
      ">
        <!-- Close Button -->
        <button id="close-skill-modal-btn" aria-label="Close" style="
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #94a3b8;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        ">✕</button>

        <!-- Header -->
        <div style="text-align: center; margin-bottom: 2rem;">
          <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(6, 182, 212, 0.12); border: 1px solid rgba(6, 182, 212, 0.3); padding: 0.4rem 1rem; border-radius: 9999px; margin-bottom: 0.85rem;">
            <span style="font-size: 1.1rem;">🎯</span>
            <span style="color: var(--accent-cyan, #06b6d4); font-weight: 700; font-size: 0.88rem; letter-spacing: 0.05em; text-transform: uppercase;">
              CodeRa Placement Exams
            </span>
          </div>
          <h2 style="font-size: 1.85rem; font-weight: 800; margin: 0 0 0.5rem 0; color: #ffffff;">
            Select Skill Assessment
          </h2>
          <p style="color: #94a3b8; font-size: 0.98rem; margin: 0 auto; max-width: 540px; line-height: 1.5;">
            Student: <strong style="color: #38bdf8;">${this.currentStudentName}</strong>. Each skill domain is tested in its own dedicated, focused exam session.
          </p>
        </div>

        <!-- Exam Cards Grid -->
        <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem;">

          <!-- 1. Cognitive Assessment (ACTIVE) -->
          <div style="
            background: linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(59, 130, 246, 0.08));
            border: 2px solid #06b6d4;
            border-radius: 18px;
            padding: 1.5rem;
            position: relative;
            box-shadow: 0 10px 25px -5px rgba(6, 182, 212, 0.2);
            transition: transform 0.2s ease;
          ">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="font-size: 2.2rem; background: rgba(6, 182, 212, 0.2); width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(6, 182, 212, 0.4);">
                  🧠
                </div>
                <div>
                  <div style="display: flex; align-items: center; gap: 0.6rem;">
                    <h3 style="margin: 0; font-size: 1.3rem; font-weight: 800; color: #ffffff;">
                      Assessment 1: Cognitive Assessment
                    </h3>
                    <span style="background: #10b981; color: #064e3b; font-weight: 800; font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 9999px; text-transform: uppercase;">
                      Ready Now
                    </span>
                  </div>
                  <p style="margin: 0.25rem 0 0 0; color: #a5b4fc; font-size: 0.88rem; font-weight: 600;">
                    25 Standardized Cognitive Tasks • ~20–25 Minutes
                  </p>
                </div>
              </div>

              <!-- CTA Button -->
              <button id="start-cognitive-exam-btn" style="
                background: linear-gradient(135deg, #06b6d4, #2563eb);
                color: #ffffff;
                font-weight: 700;
                font-size: 0.95rem;
                padding: 0.75rem 1.75rem;
                border-radius: 12px;
                border: none;
                cursor: pointer;
                box-shadow: 0 4px 14px rgba(6, 182, 212, 0.4);
                display: flex;
                align-items: center;
                gap: 0.5rem;
                transition: all 0.2s ease;
              ">
                <span>Start Cognitive Exam</span>
                <span style="font-size: 1.1rem;">🚀</span>
              </button>
            </div>

            <p style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.5; margin: 0.5rem 0 1rem 0;">
              Standardized assessment based on the 25 cognitive tasks specification. Evaluates Working Memory, Fluid Reasoning, Visual-Spatial Processing, Attention, Cognitive Flexibility, Planning, and Decision Making.
            </p>

            <!-- Skill Tags -->
            <div style="display: flex; flex-wrap: wrap; gap: 0.45rem;">
              <span style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); padding: 0.25rem 0.6rem; border-radius: 8px; font-size: 0.78rem; color: #e2e8f0;">
                🧩 Tasks 1–3: Working Memory
              </span>
              <span style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); padding: 0.25rem 0.6rem; border-radius: 8px; font-size: 0.78rem; color: #e2e8f0;">
                💡 Tasks 4–6: Fluid Reasoning
              </span>
              <span style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); padding: 0.25rem 0.6rem; border-radius: 8px; font-size: 0.78rem; color: #e2e8f0;">
                📐 Tasks 8–11: Visual-Spatial
              </span>
              <span style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); padding: 0.25rem 0.6rem; border-radius: 8px; font-size: 0.78rem; color: #e2e8f0;">
                ⚡ Tasks 12–16: Attention & Speed
              </span>
              <span style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); padding: 0.25rem 0.6rem; border-radius: 8px; font-size: 0.78rem; color: #e2e8f0;">
                🔄 Tasks 7, 17–18: Flexibility
              </span>
              <span style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); padding: 0.25rem 0.6rem; border-radius: 8px; font-size: 0.78rem; color: #e2e8f0;">
                🗺️ Tasks 19–25: Planning & Decisions
              </span>
            </div>
          </div>

          <!-- Other Skills (Coming Soon) -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.85rem;">
            
            <!-- Functional Abilities -->
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 1.1rem; opacity: 0.75;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span style="font-size: 1.4rem;">🤖</span>
                  <h4 style="margin: 0; font-size: 1rem; font-weight: 700; color: #f1f5f9;">Functional Abilities</h4>
                </div>
                <span style="background: rgba(255,255,255,0.1); color: #94a3b8; font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 6px;">Coming Soon</span>
              </div>
              <p style="margin: 0; color: #94a3b8; font-size: 0.82rem; line-height: 1.4;">
                Interactive robot missions, multi-step directions, and autonomous task completion.
              </p>
            </div>

            <!-- Communication Level -->
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 1.1rem; opacity: 0.75;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span style="font-size: 1.4rem;">💬</span>
                  <h4 style="margin: 0; font-size: 1rem; font-weight: 700; color: #f1f5f9;">Communication Level</h4>
                </div>
                <span style="background: rgba(255,255,255,0.1); color: #94a3b8; font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 6px;">Coming Soon</span>
              </div>
              <p style="margin: 0; color: #94a3b8; font-size: 0.82rem; line-height: 1.4;">
                Audio/visual matching, technical vocabulary, and assistive interaction protocols.
              </p>
            </div>

            <!-- Behavioral & Readiness -->
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 1.1rem; opacity: 0.75;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span style="font-size: 1.4rem;">🌟</span>
                  <h4 style="margin: 0; font-size: 1rem; font-weight: 700; color: #f1f5f9;">Behavioral Readiness</h4>
                </div>
                <span style="background: rgba(255,255,255,0.1); color: #94a3b8; font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 6px;">Coming Soon</span>
              </div>
              <p style="margin: 0; color: #94a3b8; font-size: 0.82rem; line-height: 1.4;">
                Sustained engagement, frustration tolerance, and adaptability metrics.
              </p>
            </div>

            <!-- Fine Motor & Technology -->
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 1.1rem; opacity: 0.75;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span style="font-size: 1.4rem;">🎯</span>
                  <h4 style="margin: 0; font-size: 1rem; font-weight: 700; color: #f1f5f9;">Fine Motor & Tech</h4>
                </div>
                <span style="background: rgba(255,255,255,0.1); color: #94a3b8; font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 6px;">Coming Soon</span>
              </div>
              <p style="margin: 0; color: #94a3b8; font-size: 0.82rem; line-height: 1.4;">
                Target precision tracking, touch interaction, and hardware navigation.
              </p>
            </div>
          </div>
        </div>

        <!-- Footer / Option to take Combined Exam -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1.25rem; border-top: 1px solid rgba(255, 255, 255, 0.1); flex-wrap: wrap; gap: 0.75rem;">
          <span style="color: #64748b; font-size: 0.82rem;">
            CodeRa Adaptive Placement Framework v2.0
          </span>
          <button id="start-full-exam-btn" style="
            background: transparent;
            border: 1px dashed rgba(255, 255, 255, 0.2);
            color: #94a3b8;
            font-size: 0.82rem;
            padding: 0.4rem 0.9rem;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            Run Legacy Combined 50-Question Assessment ➔
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.modalEl = overlay;

    // Attach handlers
    overlay.querySelector('#close-skill-modal-btn')?.addEventListener('click', () => this.close());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });

    overlay.querySelector('#start-cognitive-exam-btn')?.addEventListener('click', () => {
      this.close();
      this.onSelectExam('cognitive_ability', this.currentStudentName);
    });

    overlay.querySelector('#start-full-exam-btn')?.addEventListener('click', () => {
      this.close();
      this.onSelectExam('all', this.currentStudentName);
    });
  }
}
