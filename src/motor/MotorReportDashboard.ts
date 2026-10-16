// ---------------------------------------------------------------------------
// CodeRA Platform — Motor Assessment Arabic Comprehensive Report Dashboard
// ---------------------------------------------------------------------------

import { MotorAssessmentReportData } from './types';
import confetti from 'canvas-confetti';

export class MotorReportDashboard {
  public static render(container: HTMLElement, data: MotorAssessmentReportData, onReturnToHome: () => void) {
    container.innerHTML = '';

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#10b981', '#6366f1', '#f59e0b'],
      });
    } catch (e) {}

    const reportWrapper = document.createElement('div');
    reportWrapper.className = 'motor-report-wrapper';
    reportWrapper.style.cssText = `
      width: 100%;
      min-height: 100vh;
      background: radial-gradient(circle at top right, #111827 0%, #0a0f1d 100%);
      color: #f8fafc;
      font-family: 'Cairo', 'Inter', sans-serif;
      direction: rtl;
      padding: 2.5rem 1.5rem 5rem 1.5rem;
      box-sizing: border-box;
      overflow-y: auto;
    `;

    const formattedDate = new Date(data.sessionTimestamp).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    reportWrapper.innerHTML = `
      <div style="max-width: 1080px; margin: 0 auto;">
        
        <!-- Header Actions -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1.5rem;">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div style="width: 52px; height: 52px; border-radius: 16px; background: linear-gradient(135deg, #06b6d4, #10b981); display: flex; align-items: center; justify-content: center; font-size: 1.7rem; box-shadow: 0 4px 15px rgba(6,182,212,0.4);">
              🖐️
            </div>
            <div>
              <span style="font-size: 0.8rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em;">CodeRA Assessment Suite</span>
              <h1 style="margin: 0; font-size: 1.65rem; font-weight: 800; color: #ffffff;">تقرير تقييم المهارات الحركية وتتبع اليدين بالذكاء الاصطناعي</h1>
              <p style="margin: 0.2rem 0 0 0; color: #94a3b8; font-size: 0.9rem;">اسم الطالب: <b style="color: #ffffff;">${data.studentName}</b> • التاريخ: ${formattedDate}</p>
            </div>
          </div>

          <div style="display: flex; gap: 0.75rem;">
            <button id="motor-print-btn" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); color: #e2e8f0; font-weight: 700; padding: 0.65rem 1.25rem; border-radius: 12px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s;">
              <span>🖨️</span>
              <span>طباعة / حفظ PDF</span>
            </button>
            <button id="motor-home-btn" style="background: linear-gradient(135deg, #06b6d4, #2563eb); border: none; color: #ffffff; font-weight: 700; padding: 0.65rem 1.5rem; border-radius: 12px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; box-shadow: 0 4px 15px rgba(6,182,212,0.35); transition: all 0.2s;">
              <span>العودة للمنصة</span>
              <span>🏠</span>
            </button>
          </div>
        </div>

        <!-- Overall Score Hero Banner -->
        <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9)); border: 2px solid rgba(6, 182, 212, 0.4); border-radius: 24px; padding: 2rem; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.5rem; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
          <div>
            <div style="display: inline-block; background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.4); padding: 0.35rem 0.9rem; border-radius: 9999px; font-size: 0.82rem; font-weight: 800; color: #38bdf8; margin-bottom: 0.8rem;">
              درجة الجاهزية الحركية الشاملة (Motor Readiness Score)
            </div>
            <h2 style="margin: 0; font-size: 2rem; font-weight: 900; color: #ffffff;">
              ${data.overallScore >= 80 ? 'جاهزية تقنية ممتازة للاستخدام الرقمي' : data.overallScore >= 55 ? 'جاهزية مقبولة مع فرص تطوير واعدة' : 'يحتاج إلى دعم وتأهيل حركي متخصص'}
            </h2>
            <p style="margin: 0.6rem 0 0 0; color: #cbd5e1; max-width: 620px; font-size: 0.95rem; line-height: 1.6;">
              تم تقييم الطفل عبر 25 مهمة قياسية مباشرة أمام الكاميرا لتحليل مدى حركة المعصم، عزل حركة الأصابع، وثبات قبضة اليد وسرعة التنسيق البصري الحركي للتحضير لاستخدام الماوس والكيبورد.
            </p>
          </div>

          <div style="background: radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, rgba(15, 23, 42, 0.8) 100%); border: 3px solid #06b6d4; width: 140px; height: 140px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 0 30px rgba(6, 182, 212, 0.35);">
            <span style="font-size: 2.8rem; font-weight: 900; line-height: 1; color: #38bdf8;">${data.overallScore}</span>
            <span style="font-size: 0.85rem; color: #94a3b8; font-weight: 700; margin-top: 0.25rem;">من 100</span>
          </div>
        </div>

        <!-- Mouse & Keyboard Dual Readiness Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
          
          <!-- Mouse Card -->
          <div style="background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 20px; padding: 1.5rem; box-shadow: 0 10px 25px rgba(0,0,0,0.25);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span style="font-size: 1.8rem;">🖱️</span>
                <div>
                  <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; color: #ffffff;">جاهزية استخدام الفأرة (Mouse)</h3>
                  <span style="font-size: 0.82rem; color: #a7f3d0; font-weight: 600;">التحريك، الإشارة، النقر، السحب والإفلات</span>
                </div>
              </div>
              <span style="background: ${data.mouseReadiness.ready ? '#10b981' : '#f59e0b'}; color: #0f172a; font-weight: 800; font-size: 0.75rem; padding: 0.25rem 0.75rem; border-radius: 9999px;">
                ${data.mouseReadiness.rating} (${data.mouseReadiness.score}%)
              </span>
            </div>
            <ul style="margin: 0; padding-right: 1.25rem; color: #cbd5e1; font-size: 0.88rem; line-height: 1.6;">
              ${data.mouseReadiness.points.map(pt => `<li>${pt}</li>`).join('')}
            </ul>
          </div>

          <!-- Keyboard Card -->
          <div style="background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(99, 102, 241, 0.4); border-radius: 20px; padding: 1.5rem; box-shadow: 0 10px 25px rgba(0,0,0,0.25);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span style="font-size: 1.8rem;">⌨️</span>
                <div>
                  <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; color: #ffffff;">جاهزية لوحة المفاتيح (Keyboard)</h3>
                  <span style="font-size: 0.82rem; color: #c7d2fe; font-weight: 600;">عزل الأصابع، تسلسل المفاتيح، والسرعة</span>
                </div>
              </div>
              <span style="background: ${data.keyboardReadiness.ready ? '#6366f1' : '#f59e0b'}; color: #ffffff; font-weight: 800; font-size: 0.75rem; padding: 0.25rem 0.75rem; border-radius: 9999px;">
                ${data.keyboardReadiness.rating} (${data.keyboardReadiness.score}%)
              </span>
            </div>
            <ul style="margin: 0; padding-right: 1.25rem; color: #cbd5e1; font-size: 0.88rem; line-height: 1.6;">
              ${data.keyboardReadiness.points.map(pt => `<li>${pt}</li>`).join('')}
            </ul>
          </div>

        </div>

        <!-- 4 Section Performance Grid -->
        <h3 style="margin: 0 0 1rem 0; font-size: 1.3rem; font-weight: 800; color: #ffffff;">نتائج المحاور التقييمية الأربعة</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
          
          <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="color: #94a3b8; font-size: 0.85rem; font-weight: 700;">1. الوضعية والذراع</span>
              <span style="font-weight: 800; color: #38bdf8;">${data.sectionScores.posture.percentage}%</span>
            </div>
            <div style="background: rgba(255,255,255,0.1); height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 0.5rem;">
              <div style="background: #38bdf8; height: 100%; width: ${data.sectionScores.posture.percentage}%;"></div>
            </div>
            <span style="font-size: 0.75rem; color: #64748b;">${data.sectionScores.posture.score} من ${data.sectionScores.posture.max} نقطة (3 مهام)</span>
          </div>

          <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="color: #94a3b8; font-size: 0.85rem; font-weight: 700;">2. حركة المعصم والرسغ</span>
              <span style="font-weight: 800; color: #10b981;">${data.sectionScores.wrist.percentage}%</span>
            </div>
            <div style="background: rgba(255,255,255,0.1); height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 0.5rem;">
              <div style="background: #10b981; height: 100%; width: ${data.sectionScores.wrist.percentage}%;"></div>
            </div>
            <span style="font-size: 0.75rem; color: #64748b;">${data.sectionScores.wrist.score} من ${data.sectionScores.wrist.max} نقطة (4 مهام)</span>
          </div>

          <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="color: #94a3b8; font-size: 0.85rem; font-weight: 700;">3. حركة الأصابع الدقيقة</span>
              <span style="font-weight: 800; color: #f59e0b;">${data.sectionScores.fingers.percentage}%</span>
            </div>
            <div style="background: rgba(255,255,255,0.1); height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 0.5rem;">
              <div style="background: #f59e0b; height: 100%; width: ${data.sectionScores.fingers.percentage}%;"></div>
            </div>
            <span style="font-size: 0.75rem; color: #64748b;">${data.sectionScores.fingers.score} من ${data.sectionScores.fingers.max} نقطة (8 مهام)</span>
          </div>

          <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="color: #94a3b8; font-size: 0.85rem; font-weight: 700;">4. التنسيق البصري الحركي</span>
              <span style="font-weight: 800; color: #8b5cf6;">${data.sectionScores.coordination.percentage}%</span>
            </div>
            <div style="background: rgba(255,255,255,0.1); height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 0.5rem;">
              <div style="background: #8b5cf6; height: 100%; width: ${data.sectionScores.coordination.percentage}%;"></div>
            </div>
            <span style="font-size: 0.75rem; color: #64748b;">${data.sectionScores.coordination.score} من ${data.sectionScores.coordination.max} نقطة (10 مهام)</span>
          </div>

        </div>

        <!-- Biometric Indicators (Stability & Asymmetry) -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
          <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 1.5rem;">
            <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: #38bdf8;">📊 قياس الثبات ومقاومة الرعشة (Tremor & Stability)</h4>
            <p style="margin: 0; color: #cbd5e1; font-size: 0.88rem; line-height: 1.5;">${data.tremorAndStability.descriptionAr}</p>
            <div style="margin-top: 0.75rem; font-size: 0.82rem; color: #94a3b8;">
              مستوى الاتزان: <b style="color: #10b981;">${data.tremorAndStability.rating} (${data.tremorAndStability.tremorScore}/100)</b>
            </div>
          </div>

          <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 1.5rem;">
            <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: #38bdf8;">⚖️ توازن الأداء بين اليدين (Bimanual Asymmetry)</h4>
            <p style="margin: 0; color: #cbd5e1; font-size: 0.88rem; line-height: 1.5;">${data.asymmetryIndex.descriptionAr}</p>
            <div style="margin-top: 0.75rem; font-size: 0.82rem; color: #94a3b8;">
              اليد المهيمنة: <b style="color: #38bdf8;">${data.asymmetryIndex.dominantHand}</b>
            </div>
          </div>
        </div>

        <!-- Recommendations & Action Plan -->
        <div style="background: rgba(17, 24, 39, 0.8); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 20px; padding: 1.75rem; margin-bottom: 2.5rem;">
          <h3 style="margin: 0 0 0.85rem 0; font-size: 1.25rem; font-weight: 800; color: #fbbf24; display: flex; align-items: center; gap: 0.5rem;">
            <span>💡</span>
            <span>التوصيات والأنشطة التأهيلية المقترحة</span>
          </h3>
          <ul style="margin: 0; padding-right: 1.5rem; color: #e2e8f0; font-size: 0.95rem; line-height: 1.7;">
            ${data.recommendationsAr.map(rec => `<li>${rec}</li>`).join('')}
          </ul>
        </div>

        <!-- Detailed 25 Tasks Breakdown Table -->
        <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 1.5rem; overflow-x: auto;">
          <h3 style="margin: 0 0 1rem 0; font-size: 1.2rem; font-weight: 800; color: #ffffff;">سجل المهام التفصيلي (25 مهمة قياسية)</h3>
          
          <table style="width: 100%; border-collapse: collapse; text-align: right; font-size: 0.88rem;">
            <thead>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.15); color: #94a3b8;">
                <th style="padding: 0.75rem 0.5rem;">#</th>
                <th style="padding: 0.75rem 0.5rem;">المهمة الحركية</th>
                <th style="padding: 0.75rem 0.5rem;">المحور</th>
                <th style="padding: 0.75rem 0.5rem;">الدرجة</th>
                <th style="padding: 0.75rem 0.5rem;">الدقة</th>
                <th style="padding: 0.75rem 0.5rem;">السرعة</th>
                <th style="padding: 0.75rem 0.5rem;">اليد</th>
                <th style="padding: 0.75rem 0.5rem;">الحالة</th>
              </tr>
            </thead>
            <tbody>
              ${data.taskResults.map(tr => `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                  <td style="padding: 0.65rem 0.5rem; font-weight: 700; color: #38bdf8;">${tr.task.slot}</td>
                  <td style="padding: 0.65rem 0.5rem; font-weight: 600; color: #ffffff;">${tr.task.titleAr}</td>
                  <td style="padding: 0.65rem 0.5rem; color: #94a3b8; font-size: 0.8rem;">${tr.task.sectionTitleAr.split(':')[0]}</td>
                  <td style="padding: 0.65rem 0.5rem; font-weight: 700; color: ${tr.score >= 4 ? '#10b981' : tr.score >= 2.5 ? '#f59e0b' : '#ef4444'};">${tr.score} / 5</td>
                  <td style="padding: 0.65rem 0.5rem; color: #cbd5e1;">${Math.round(tr.accuracy * 100)}%</td>
                  <td style="padding: 0.65rem 0.5rem; color: #cbd5e1;">${Math.round(tr.speedRating * 100)}%</td>
                  <td style="padding: 0.65rem 0.5rem; color: #38bdf8; font-size: 0.82rem;">${tr.handTested || 'اليمين'}</td>
                  <td style="padding: 0.65rem 0.5rem;">
                    <span style="background: ${tr.score >= 3.5 ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}; color: ${tr.score >= 3.5 ? '#6ee7b7' : '#fcd34d'}; padding: 0.2rem 0.55rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700;">
                      ${tr.score >= 3.5 ? 'متقن' : 'مقبول'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

      </div>
    `;

    container.appendChild(reportWrapper);

    // Bind event handlers
    const homeBtn = document.getElementById('motor-home-btn');
    if (homeBtn) {
      homeBtn.addEventListener('click', () => {
        onReturnToHome();
      });
    }

    const printBtn = document.getElementById('motor-print-btn');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }
  }
}
