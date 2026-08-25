import { StudentSessionTelemetry, QuestionTimeRecord, BreakEvent } from '../engine/telemetrySchema';
import { PlacementEngine, PlacementResult } from '../engine/placementEngine';
import { PaymentModal } from './PaymentModal';
import confetti from 'canvas-confetti';

export function renderReportDashboard(
  container: HTMLElement,
  session: StudentSessionTelemetry,
  placement: PlacementResult
) {
  try {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  } catch (e) {}

  const { totalScore, recommendedTrack, flags, performanceIndicators } = placement;
  const isV2Schema = session.schema_version === '2.0';

  // Flags HTML
  let flagsHtml = '';
  if (flags.length > 0) {
    flagsHtml = flags.map(flag => `
      <div class="flag-alert ${flag.type === 'critical' ? 'critical' : ''}">
        <div style="font-size: 1.25rem;">⚠️</div>
        <div>
          <strong style="color: var(--text-primary); font-size: 0.95rem;">${flag.title}</strong>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.2rem;">${flag.description}</p>
        </div>
      </div>
    `).join('');
  }

  // Domain progress bars
  const domainBarsHtml = Object.values(session.domain_scores || {}).map(ds => {
    const pct = Math.round((ds.earned_score / ds.max_score) * 100);
    return `
      <div class="domain-progress-bar">
        <div class="bar-label">
          <span><strong>${ds.domain_name}</strong> (${ds.weight_pct}% Weight)</span>
          <span><strong>${ds.earned_score}</strong> / ${ds.max_score} Pts (${pct}%)</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width: ${pct}%; background: linear-gradient(90deg, var(--accent-cyan), var(--accent-blue));"></div>
        </div>
      </div>
    `;
  }).join('');

  // Format progress bars (Schema B dimension)
  let formatBarsHtml = '';
  if (session.format_scores) {
    formatBarsHtml = Object.values(session.format_scores).map(fs => {
      return `
        <div style="background:rgba(15,23,42,0.6); border:1px solid var(--border-color); padding:0.85rem 1rem; border-radius:10px; margin-bottom:0.6rem;">
          <div style="display:flex; justify-content:space-between; font-size:0.88rem; margin-bottom:0.4rem;">
            <span><strong>${fs.format.toUpperCase()}</strong> (${fs.weight_pct}% Weight • ${fs.question_count} Qs)</span>
            <span style="color:var(--accent-cyan); font-weight:700;">${fs.raw_accuracy_pct}% Accuracy (+${fs.earned_contribution} pts)</span>
          </div>
          <div class="progress-track" style="height:6px;">
            <div class="progress-fill" style="width: ${fs.raw_accuracy_pct}%; background: linear-gradient(90deg, #a855f7, var(--accent-cyan));"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Per-Question Time Analysis Table
  const timeRecords = session.question_time_records || [];
  const timeTableRows = timeRecords.map(r => {
    if (!r) return '';
    const activeSecs = Math.round(r.activeDurationMs / 1000);
    const latencySecs = r.responseLatencyMs ? (r.responseLatencyMs / 1000).toFixed(1) + 's' : '—';
    const remainingSecs = r.remainingTimeWhenAnsweredMs ? Math.round(r.remainingTimeWhenAnsweredMs / 1000) + 's' : '0s';

    let statusBadge = '<span style="color:#10b981; font-weight:700;">🟢 Fast</span>';
    if (r.timedOut) {
      statusBadge = '<span style="color:#ef4444; font-weight:700;">⏰ Timed Out</span>';
    } else if (activeSecs > 80) {
      statusBadge = '<span style="color:#f59e0b; font-weight:700;">🔴 Slow</span>';
    } else if (activeSecs > 45) {
      statusBadge = '<span style="color:#3b82f6; font-weight:700;">🟡 Normal</span>';
    }

    const rowBg = r.timedOut ? 'background:rgba(239,68,68,0.08);' : '';

    return `
      <tr style="${rowBg} border-bottom:1px solid rgba(255,255,255,0.05); font-size:0.85rem;">
        <td style="padding:0.6rem 0.8rem; font-weight:700; text-align:center;">Q${r.questionSlot}</td>
        <td style="padding:0.6rem 0.8rem; text-align:center; font-size:0.75rem; font-weight:700; color:#a5b4fc;">P${r.part || 1}</td>
        <td style="padding:0.6rem 0.8rem;">
          <span style="font-size:0.75rem; background:rgba(6,182,212,0.15); color:var(--accent-cyan); padding:0.25rem 0.5rem; border-radius:6px;">
            ${r.domain.replace('_', ' ')}
          </span>
        </td>
        <td style="padding:0.6rem 0.8rem; font-weight:600; color:var(--text-primary);">${r.subSkill}</td>
        <td style="padding:0.6rem 0.8rem; text-align:center;">${activeSecs}s</td>
        <td style="padding:0.6rem 0.8rem; text-align:center;">${latencySecs}</td>
        <td style="padding:0.6rem 0.8rem; text-align:center;">${remainingSecs}</td>
        <td style="padding:0.6rem 0.8rem; text-align:center;">${statusBadge}</td>
        <td style="padding:0.6rem 0.8rem; text-align:center;">${r.breaksDuringQuestion > 0 ? `⏸️ ${r.breaksDuringQuestion}` : '0'}</td>
        <td style="padding:0.6rem 0.8rem; text-align:center; font-weight:700;">${r.earnedScore} / ${r.maxScore}</td>
      </tr>
    `;
  }).join('');

  // Break History Log
  const breakEvents = session.break_events || [];
  let breakLogHtml = '';
  if (breakEvents.length > 0 || session.part_break_record) {
    let partBreakHtml = '';
    if (session.part_break_record) {
      const pDurationMin = Math.round((session.part_break_record.breakDurationMs || 0) / 60000);
      partBreakHtml = `
        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(16,185,129,0.1); border:1px solid var(--accent-emerald); padding:0.75rem 1rem; border-radius:10px; margin-bottom:0.5rem; font-size:0.88rem;">
          <div>
            <strong>☕ Part 1 Mandatory 5-Min Break</strong> • Between Part 1 &amp; Part 2
          </div>
          <div style="color:var(--accent-emerald); font-weight:700;">
            Duration: ${pDurationMin} min ${session.part_break_record.studentInitiatedEarly ? '(Resumed Early)' : '(Full Break)'}
          </div>
        </div>
      `;
    }

    const itemBreaksHtml = breakEvents.map(b => {
      const durMins = Math.floor(b.breakDurationMs / 60000);
      const durSecs = Math.round((b.breakDurationMs % 60000) / 1000);
      const remSecs = Math.round(b.countdownRemainingAtPause);
      return `
        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.04); border:1px solid var(--border-color); padding:0.75rem 1rem; border-radius:10px; margin-bottom:0.5rem; font-size:0.88rem;">
          <div>
            <strong>Pause #${b.breakIndex}</strong> • During <strong>Q${b.questionSlotAtPause}</strong> (${b.domainAtPause.replace('_', ' ')})
          </div>
          <div style="color:var(--accent-amber); font-weight:700;">
            Duration: ${durMins > 0 ? `${durMins}m ` : ''}${durSecs}s (Timer left: ${remSecs}s)
          </div>
        </div>
      `;
    }).join('');

    breakLogHtml = partBreakHtml + itemBreaksHtml;
  } else {
    breakLogHtml = `
      <div style="background:rgba(16,185,129,0.1); border:1px solid var(--accent-emerald); color:var(--accent-emerald); padding:1rem; border-radius:10px; font-weight:600; text-align:center;">
        ✅ Continuous Completion — Student completed all questions without extra sensory pauses.
      </div>
    `;
  }

  // Summary Metrics
  const totalActiveMins = Math.round((session.total_active_duration_ms || 0) / 60000);
  const totalBreakMins = Math.round((session.total_break_duration_ms || 0) / 60000);
  const totalWallMins = Math.round((session.total_wall_clock_duration_ms || 0) / 60000);
  const totalTimedOutCount = timeRecords.filter(r => r?.timedOut).length;

  saveSessionToCEODatabase(session);

  container.innerHTML = `
    <div class="glass-card" style="padding: 2.5rem; max-width:1150px; margin:0 auto; background:#ffffff; border:4px solid #ffffff; border-radius:2rem; box-shadow:0 20px 40px -15px rgba(0,0,0,0.07);">
      
      <!-- Top Action Controls -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; border-bottom:2px solid #f1f5f9; padding-bottom:1.25rem; flex-wrap:wrap; gap:0.75rem;">
        <span style="background: #ecfdf5; border: 2px solid #a7f3d0; color: #10b981; padding: 0.4rem 1.1rem; border-radius: 20px; font-weight: 800; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px;">
          ✅ CodeRa 50-Question Assessment Complete (v${session.schema_version || '2.0'})
        </span>
        <div style="display:flex; gap:0.75rem; flex-wrap:wrap;" class="report-action-btns">
          <button id="parent-hub-btn" class="btn btn-secondary" style="font-size:0.85rem; background:#f0fdf4; border:2px solid #bbf7d0; color:#15803d; font-weight:800; cursor:pointer;">
            👨‍👩‍👧‍👦 Parent Hub
          </button>
          <button id="ceo-dashboard-btn" class="btn btn-secondary" style="font-size:0.85rem; background:#ecfeff; border:2px solid #a5f3fc; color:#0891b2; font-weight:800; cursor:pointer;">
            🏛️ CEO Analytics Page
          </button>
          <button id="download-pdf-btn" class="btn btn-primary" style="font-size:0.85rem; background: #3b82f6; border-bottom: 4px solid #2563eb; color:#fff; font-weight:800;">
            📄 Download PDF Report
          </button>
          <button id="download-csv-btn" class="btn btn-secondary" style="font-size:0.85rem; font-weight:800;">
            📊 Export CSV (Student)
          </button>
          <button id="print-report-btn" class="btn btn-secondary" style="font-size:0.85rem; font-weight:800;">
            🖨️ Print Report
          </button>
        </div>
      </div>

      <!-- Header -->
      <div style="text-align: center; margin-bottom: 2rem;">
        <h1 style="font-size: 2.3rem; font-weight: 900; color: #1e293b;">
          CodeRa Placement Assessment Report
        </h1>
        <p style="color: #64748b; font-size: 1.05rem; margin-top: 0.35rem; font-weight: 600;">
          Student: <strong style="color:#1e293b;">${session.student_name}</strong> • Age Group: ${session.age_group || '13-16'} • 50 Items Assessed
        </p>
      </div>

      <div class="report-grid" style="grid-template-columns: 320px 1fr; gap: 1.75rem;">
        <!-- Placement Badge Card -->
        <div class="placement-badge-card" style="background:#f8fafc; border:2px solid #e2e8f0; border-radius:1.75rem; padding:1.75rem; box-shadow:0 10px 25px -5px rgba(0,0,0,0.03);">
          <div style="font-size: 0.82rem; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #64748b;">
            Technology Readiness Score
          </div>
          
          <div class="score-circle" style="--score-pct: ${totalScore};">
            <span class="score-text">${totalScore}</span>
          </div>

          <div style="font-size: 0.85rem; color: #64748b; font-weight: 700;">Recommended CodeRa Level</div>
          <div class="track-title" style="color:#10b981; font-weight:900; font-size:1.4rem; margin-top:0.2rem;">${recommendedTrack}</div>

          <!-- Coding Readiness Sub-Score Card -->
          <div style="margin-top: 1.25rem; background:#eff6ff; border:2px solid #bfdbfe; border-radius:1rem; padding:1rem; text-align:center;">
            <div style="font-size:0.78rem; font-weight:900; color:#1e40af; text-transform:uppercase;">
              💻 Coding Readiness Score
            </div>
            <div style="font-size:1.8rem; font-weight:900; color:#1e293b; margin-top:0.2rem;">
              ${session.coding_readiness_score ?? Math.round(performanceIndicators.overallAccuracy)}%
            </div>
            <div style="font-size:0.75rem; color:#64748b; margin-top:0.2rem; font-weight:600;">
              Algorithmic logic, sequencing &amp; loops
            </div>
          </div>

          <div style="margin-top: 1.25rem; width: 100%; border-top: 2px solid #e2e8f0; padding-top: 1rem; text-align: left; font-size: 0.88rem; color: #64748b; font-weight:600;">
            <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem;">
              <span>Overall Accuracy:</span> <strong style="color:#1e293b;">${performanceIndicators.overallAccuracy}%</strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem;">
              <span>Active Thinking Time:</span> <strong style="color:#1e293b;">${totalActiveMins} min</strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem;">
              <span>Total Breaks Taken:</span> <strong style="color:#1e293b;">${session.total_breaks_count || 0} (${totalBreakMins} min)</strong>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span>Questions Timed Out:</span> <strong style="color:${totalTimedOutCount > 0 ? '#ef4444' : '#1e293b'};">${totalTimedOutCount} / 50</strong>
            </div>
          </div>
        </div>

        <!-- Domain & Format Breakdown -->
        <div>
          <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-primary);">
            Competency Domain Performance (50 Questions)
          </h3>
          ${domainBarsHtml}

          ${formatBarsHtml ? `
            <h4 style="font-size: 1.05rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.75rem; color: var(--text-primary);">
              Format-Weighted Breakdown (Schema B Matrix)
            </h4>
            ${formatBarsHtml}
          ` : ''}

          ${flagsHtml}
        </div>
      </div>

      <!-- Coding Challenge Result (L3/L4 only) -->
      ${session.coding_challenge_result ? (() => {
        const ccr = session.coding_challenge_result!;
        const verificationColors: Record<string, string> = {
          'Strong': '#10b981',
          'Confirmed': '#06b6d4',
          'Borderline': '#f59e0b',
          'Not Attempted': '#94a3b8',
        };
        const vColor = verificationColors[ccr.placement_verification] || '#94a3b8';
        const timeTakenMin = (ccr.time_taken_ms / 60000).toFixed(1);
        return `
          <div style="margin-top:2rem; border-top:1px solid var(--border-color); padding-top:1.75rem;">
            <h3 style="font-size:1.3rem; font-weight:800; margin-bottom:1.25rem; color:#a855f7; display:flex; align-items:center; gap:0.5rem;">
              💻 Coding Challenge Results (Placement Verification)
            </h3>
            <div style="display:grid; grid-template-columns:auto 1fr; gap:1.5rem; align-items:start;">
              <div style="background:rgba(168,85,247,0.1); border:2px solid ${vColor}; border-radius:16px; padding:1.25rem 2rem; text-align:center; min-width:180px;">
                <div style="font-size:0.8rem; text-transform:uppercase; font-weight:700; color:var(--text-secondary); margin-bottom:0.35rem;">Verification</div>
                <div style="font-size:1.4rem; font-weight:900; color:${vColor};">${ccr.placement_verification}</div>
                <div style="font-size:2rem; font-weight:900; color:#fff; margin-top:0.5rem;">${ccr.accuracy_pct}%</div>
                <div style="font-size:0.75rem; color:var(--text-secondary);">${ccr.completed_challenges}/${ccr.total_challenges} solved • ${timeTakenMin}m</div>
              </div>
              <div>
                ${ccr.attempted ? `
                  <div style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.85rem;">
                    ${(ccr.skills_demonstrated || []).map((s: string) => `
                      <span style="background:rgba(16,185,129,0.15); border:1px solid var(--accent-emerald); color:var(--accent-emerald); padding:0.3rem 0.75rem; border-radius:12px; font-size:0.82rem; font-weight:700;">✅ ${s}</span>
                    `).join('')}
                  </div>
                  <p style="font-size:0.88rem; color:var(--text-secondary); line-height:1.55;">
                    The student completed the supplementary coding challenge module demonstrating
                    <strong style="color:#fff;">${ccr.completed_challenges} out of ${ccr.total_challenges}</strong> challenges
                    with <strong style="color:${vColor};">${ccr.accuracy_pct}% accuracy</strong>.
                    Placement verification: <strong style="color:${vColor};">${ccr.placement_verification}</strong>.
                  </p>
                ` : `
                  <p style="font-size:0.88rem; color:var(--text-secondary);">
                    The student skipped the supplementary coding challenge. The base assessment placement stands without additional verification.
                  </p>
                `}
              </div>
            </div>
          </div>
        `;
      })() : ''}

      <!-- Executive Analytics Grid -->
      <div style="margin-top: 2.5rem; border-top: 1px solid var(--border-color); padding-top: 2rem;">
        <h3 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 1.25rem; color: var(--accent-cyan); display:flex; align-items:center; gap:0.5rem;">
          📈 Executive Time &amp; Attention Analytics (CEO View)
        </h3>

        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:1rem; margin-bottom:2rem;">
          <div style="background:rgba(15,23,42,0.7); border:1px solid var(--border-color); padding:1.25rem; border-radius:12px; text-align:center;">
            <div style="font-size:0.8rem; color:var(--text-secondary); text-transform:uppercase;">Active Thinking Time</div>
            <div style="font-size:1.8rem; font-weight:800; color:var(--accent-cyan); margin-top:0.25rem;">${totalActiveMins} min</div>
            <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:0.2rem;">Actual task engagement</div>
          </div>
          <div style="background:rgba(15,23,42,0.7); border:1px solid var(--border-color); padding:1.25rem; border-radius:12px; text-align:center;">
            <div style="font-size:0.8rem; color:var(--text-secondary); text-transform:uppercase;">Pause / Break Time</div>
            <div style="font-size:1.8rem; font-weight:800; color:var(--accent-amber); margin-top:0.25rem;">${totalBreakMins} min</div>
            <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:0.2rem;">${session.total_breaks_count || 0} breaks recorded</div>
          </div>
          <div style="background:rgba(15,23,42,0.7); border:1px solid var(--border-color); padding:1.25rem; border-radius:12px; text-align:center;">
            <div style="font-size:0.8rem; color:var(--text-secondary); text-transform:uppercase;">Wall Clock Duration</div>
            <div style="font-size:1.8rem; font-weight:800; color:#fff; margin-top:0.25rem;">${totalWallMins} min</div>
            <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:0.2rem;">Total session length</div>
          </div>
          <div style="background:rgba(15,23,42,0.7); border:1px solid var(--border-color); padding:1.25rem; border-radius:12px; text-align:center;">
            <div style="font-size:0.8rem; color:var(--text-secondary); text-transform:uppercase;">On-Task Focus Ratio</div>
            <div style="font-size:1.8rem; font-weight:800; color:var(--accent-emerald); margin-top:0.25rem;">
              ${totalWallMins > 0 ? Math.round((totalActiveMins / totalWallMins) * 100) : 100}%
            </div>
            <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:0.2rem;">Active vs total time</div>
          </div>
        </div>

        <!-- Section C: Break Log -->
        <div style="margin-bottom:2.5rem;">
          <h4 style="font-size:1.1rem; font-weight:700; color:var(--text-primary); margin-bottom:1rem;">
            ⏸️ Break &amp; Pause Log
          </h4>
          ${breakLogHtml}
        </div>

        <!-- Per-Question Time Table -->
        <div>
          <h4 style="font-size:1.1rem; font-weight:700; color:var(--text-primary); margin-bottom:1rem;">
            📋 Detailed Per-Question Time Breakdown (50 Items)
          </h4>
          <div style="max-height:420px; overflow-y:auto; border:1px solid var(--border-color); border-radius:12px; background:rgba(15,23,42,0.6);">
            <table style="width:100%; border-collapse:collapse; text-align:left;">
              <thead style="position:sticky; top:0; background:rgba(30,41,59,0.95); z-index:10; font-size:0.8rem; text-transform:uppercase; color:var(--text-secondary);">
                <tr>
                  <th style="padding:0.75rem 0.8rem; text-align:center;">#</th>
                  <th style="padding:0.75rem 0.8rem; text-align:center;">Part</th>
                  <th style="padding:0.75rem 0.8rem;">Domain</th>
                  <th style="padding:0.75rem 0.8rem;">Sub-Skill</th>
                  <th style="padding:0.75rem 0.8rem; text-align:center;">Active Time</th>
                  <th style="padding:0.75rem 0.8rem; text-align:center;">First Reaction</th>
                  <th style="padding:0.75rem 0.8rem; text-align:center;">Timer Left</th>
                  <th style="padding:0.75rem 0.8rem; text-align:center;">Speed Status</th>
                  <th style="padding:0.75rem 0.8rem; text-align:center;">Pauses</th>
                  <th style="padding:0.75rem 0.8rem; text-align:center;">Points</th>
                </tr>
              </thead>
              <tbody>
                ${timeTableRows}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Next Steps: Live Screening & Video Introduction Module (Green & White Theme) -->
        <div style="margin-top: 2rem; background: #f0fdf4; border: 2px solid #86efac; border-radius: 1.5rem; padding: 1.75rem; box-shadow: 0 10px 30px rgba(16,185,129,0.06);">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:1.25rem;">
            <div>
              <span style="font-size:0.75rem; font-weight:900; text-transform:uppercase; letter-spacing:1px; color:#059669; background:#dcfce7; padding:0.35rem 0.8rem; border-radius:10px; border:1px solid #86efac;">
                🚀 Placement Next Steps
              </span>
              <h3 style="font-size:1.35rem; font-weight:900; color:#1e293b; margin-top:0.4rem;">
                Candidate Onboarding &amp; Introduction Screening
              </h3>
            </div>
            <span style="font-size:0.85rem; color:#64748b; font-weight:700;">
              Required for final track confirmation
            </span>
          </div>

          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
            
            <!-- Option A: Live Screening -->
            <div style="background: #ffffff; border: 2px solid #e2e8f0; border-radius: 1.25rem; padding: 1.5rem; display:flex; flex-direction:column; justify-content:space-between; box-shadow: 0 4px 10px rgba(0,0,0,0.02);">
              <div>
                <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.6rem;">
                  <span style="font-size:1.8rem;">🎥</span>
                  <div>
                    <h4 style="font-size:1.1rem; font-weight:900; color:#1e293b;">Live 1-on-1 Screening</h4>
                    <span style="font-size:0.78rem; color:#0284c7; font-weight:800;">With Admission Specialist</span>
                  </div>
                </div>
                <p style="font-size:0.88rem; color:#64748b; line-height:1.5; margin-bottom:1.25rem; font-weight:600;">
                  Schedule an interactive 10-minute live meeting with a CodeRa specialist to review strengths, answer questions, and discuss track placement.
                </p>
              </div>
              <button id="btn-live-screening" class="btn btn-secondary" style="width:100%; font-size:0.88rem; font-weight:800; background:#eff6ff; border:2px solid #bfdbfe; border-bottom:4px solid #93c5fd; color:#1e40af;">
                📅 Schedule Live Screening
              </button>
            </div>

            <!-- Option B: 1-Minute Video Introduction -->
            <div style="background: #ffffff; border: 2px solid #e2e8f0; border-radius: 1.25rem; padding: 1.5rem; display:flex; flex-direction:column; justify-content:space-between; box-shadow: 0 4px 10px rgba(0,0,0,0.02);">
              <div>
                <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.6rem;">
                  <span style="font-size:1.8rem;">📹</span>
                  <div>
                    <h4 style="font-size:1.1rem; font-weight:900; color:#1e293b;">1-Minute Video Introduction</h4>
                    <span style="font-size:0.78rem; color:#10b981; font-weight:800;">Self-Paced Screening</span>
                  </div>
                </div>
                <p style="font-size:0.88rem; color:#64748b; line-height:1.5; margin-bottom:1.25rem; font-weight:600;">
                  Record or upload a 60-second video introducing the student, their technology goals, and why they want to join CodeRa.
                </p>
              </div>
              <div style="display:flex; gap:0.6rem; flex-wrap:wrap;">
                <button id="btn-record-video" class="btn btn-secondary" style="flex:1; min-width:130px; font-size:0.88rem; font-weight:800; background:#fdf2f8; border:2px solid #fbcfe8; border-bottom:4px solid #f472b6; color:#db2777;">
                  🔴 Record (1 Min)
                </button>
                <label id="lbl-upload-video" class="btn btn-secondary" style="flex:1; min-width:130px; font-size:0.88rem; font-weight:800; background:#ecfdf5; border:2px solid #a7f3d0; border-bottom:4px solid #6ee7b7; color:#059669; display:flex; align-items:center; justify-content:center; cursor:pointer;">
                  📤 Upload Video
                  <input type="file" id="input-video-file" accept="video/*" style="display:none;" />
                </label>
              </div>
            </div>

          </div>
        </div>

        <!-- Qualitative AI Summary -->
        <div style="margin-top: 2rem; background: #ffffff; border: 2px solid #e2e8f0; border-radius: 1.5rem; padding: 1.75rem; color: #1e293b; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.03);" class="summary-md">
          ${session.qualitative_summary ? formatMarkdown(session.qualitative_summary) : ''}
        </div>
      </div>

      <div style="margin-top: 2.5rem; text-align: center; border-top: 2px solid #f1f5f9; padding-top: 1.75rem; display:flex; justify-content:center; gap:1rem; flex-wrap:wrap;">
        <button class="btn btn-primary" id="book-now-report-btn" style="padding: 0.9rem 2.5rem; font-size: 1.1rem; background: linear-gradient(135deg, #10b981, #0d9488); border:none; box-shadow:0 6px 20px rgba(16,185,129,0.3); font-weight:900;">
          💳 Book Now &amp; Enroll Student ($299)
        </button>
        <button class="btn btn-secondary" id="restart-btn" style="padding: 0.9rem 2.5rem; font-size: 1.1rem;">
          🔄 Retake CodeRa Assessment
        </button>
      </div>
    </div>
  `;

  // Attach Listeners
  const bookNowBtn = container.querySelector('#book-now-report-btn');
  if (bookNowBtn) {
    bookNowBtn.addEventListener('click', () => {
      const modal = new PaymentModal();
      modal.open(recommendedTrack, '$299');
    });
  }

  const restartBtn = container.querySelector('#restart-btn');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      AssessmentRunner.clearSavedSession();
      try {
        localStorage.removeItem('eduverse_assessment_session_v2');
        localStorage.removeItem('eduverse_assessment_session');
      } catch (e) {}
      window.location.href = window.location.pathname;
    });
  }

  const printBtn = container.querySelector('#print-report-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => window.print());
  }

  const pdfBtn = container.querySelector('#download-pdf-btn');
  if (pdfBtn) {
    pdfBtn.addEventListener('click', () => downloadReportAsPDF(session));
  }

  const csvBtn = container.querySelector('#download-csv-btn');
  if (csvBtn) {
    csvBtn.addEventListener('click', () => exportTimeRecordsCSV(session));
  }

  const parentHubBtn = container.querySelector('#parent-hub-btn');
  if (parentHubBtn) {
    parentHubBtn.addEventListener('click', () => {
      import('./ParentDashboard').then(mod => {
        mod.renderParentDashboard(container);
      });
    });
  }

  const ceoBtn = container.querySelector('#ceo-dashboard-btn');
  if (ceoBtn) {
    ceoBtn.addEventListener('click', () => renderCEODashboard(container, session, placement));
  }

  // Next steps screening handlers (preview mock)
  const liveScreeningBtn = container.querySelector('#btn-live-screening');
  if (liveScreeningBtn) {
    liveScreeningBtn.addEventListener('click', () => {
      alert('🎥 Live 1-on-1 Screening Booking: Calendar integration opened. Meeting link will be emailed to candidate.');
    });
  }

  const recordVideoBtn = container.querySelector('#btn-record-video');
  if (recordVideoBtn) {
    recordVideoBtn.addEventListener('click', () => {
      alert('📹 Video Recording Studio: Camera initialized. 60-second introduction timer ready.');
    });
  }

  const videoFileInput = container.querySelector('#input-video-file') as HTMLInputElement;
  if (videoFileInput) {
    videoFileInput.addEventListener('change', () => {
      if (videoFileInput.files && videoFileInput.files[0]) {
        alert(`✅ Video "${videoFileInput.files[0].name}" uploaded successfully for candidate review.`);
      }
    });
  }
}

function formatMarkdown(md: string): string {
  return md
    .replace(/^### (.*$)/gim, '<h3 style="font-size:1.15rem; font-weight:800; color:var(--accent-cyan); margin-top:1.2rem; margin-bottom:0.5rem;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="font-size:1.3rem; font-weight:800; color:#fff; margin-top:1.4rem; margin-bottom:0.6rem;">$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.*$)/gim, '<li style="margin-left:1.25rem; margin-bottom:0.3rem;">$1</li>')
    .replace(/\n\n/g, '<br/>');
}

export function saveSessionToCEODatabase(session: StudentSessionTelemetry) {
  try {
    const existing = localStorage.getItem('codera_all_sessions') || localStorage.getItem('cognix_all_sessions');
    let sessions: StudentSessionTelemetry[] = existing ? JSON.parse(existing) : [];
    sessions = sessions.filter(s => s.session_id !== session.session_id);
    sessions.unshift(session);
    localStorage.setItem('codera_all_sessions', JSON.stringify(sessions));
  } catch (e) {}
}

export function downloadReportAsPDF(session: StudentSessionTelemetry) {
  window.print();
}

export function exportTimeRecordsCSV(session: StudentSessionTelemetry) {
  const records = session.question_time_records || [];
  let csv = 'Slot,Part,Domain,SubSkill,Title,ActiveTimeSec,FirstReactionSec,TimerLeftSec,TimedOut,EarnedScore,MaxScore\n';

  records.forEach(r => {
    if (!r) return;
    const activeSec = (r.activeDurationMs / 1000).toFixed(1);
    const latencySec = r.responseLatencyMs ? (r.responseLatencyMs / 1000).toFixed(1) : '0';
    const remSec = r.remainingTimeWhenAnsweredMs ? (r.remainingTimeWhenAnsweredMs / 1000).toFixed(1) : '0';
    csv += `${r.questionSlot},${r.part || 1},"${r.domain}","${r.subSkill}","${r.questionTitle.replace(/"/g, '""')}",${activeSec},${latencySec},${remSec},${r.timedOut ? 'YES' : 'NO'},${r.earnedScore},${r.maxScore}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CodeRa_Report_${session.student_name.replace(/\s+/g, '_')}_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function returnToLandingPage(): void {
  try {
    localStorage.removeItem('eduverse_assessment_session_v2');
    localStorage.removeItem('eduverse_assessment_session');
  } catch (e) {}

  const testPage = document.getElementById('childTestPage');
  if (testPage) {
    testPage.classList.add('hidden');
    testPage.style.display = 'none';
    testPage.classList.remove('exam-active');
  }
  const appContainer = document.getElementById('app');
  if (appContainer) {
    appContainer.innerHTML = '';
  }
  const header = document.querySelector('header');
  if (header) header.classList.remove('hidden');
  const main = document.querySelector('main:not(.main-container)');
  if (main) main.classList.remove('hidden');
  const footer = document.querySelector('footer');
  if (footer) footer.classList.remove('hidden');
  
  document.body.classList.remove('exam-mode');
  document.body.classList.remove('ceo-view-mode');
  window.scrollTo({ top: 0, behavior: 'instant' });

  if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname);
  }
}

export function renderCEODashboard(
  container: HTMLElement,
  activeSession?: StudentSessionTelemetry,
  activePlacement?: PlacementResult
) {
  const existing = localStorage.getItem('codera_all_sessions') || localStorage.getItem('cognix_all_sessions');
  const sessions: StudentSessionTelemetry[] = existing ? JSON.parse(existing) : [];

  if (sessions.length === 0) {
    container.innerHTML = `
      <div class="glass-card" style="padding: 3.5rem 2rem; max-width: 900px; margin: 0 auto; text-align: center; background: #ffffff; border: 4px solid #ffffff; border-radius: 2rem; box-shadow: 0 20px 40px -15px rgba(0,0,0,0.07);">
        <div style="font-size: 4rem; margin-bottom: 1rem;">🏛️</div>
        <h2 style="font-size: 2rem; font-weight: 900; color: #1e293b; margin-bottom: 0.5rem;">CEO Executive Dashboard</h2>
        <p style="color: #64748b; margin-bottom: 2rem; max-width: 500px; margin-left: auto; margin-right: auto; font-size: 1rem; line-height: 1.5; font-weight: 600;">
          No completed student assessments found in the registry. Complete an assessment to generate real-time CEO analytics.
        </p>
        <div style="display:flex; justify-content:center; gap:1rem; flex-wrap:wrap;">
          <button id="ceo-home-btn" class="btn btn-secondary" style="font-size: 1.05rem; padding: 0.85rem 2rem; font-weight: 800; background: #f8fafc; border: 2px solid #e2e8f0; border-bottom: 4px solid #cbd5e1; color: #1e293b; cursor:pointer;">
            🏠 Back to Home
          </button>
          <button id="ceo-new-test-btn" class="btn btn-primary" style="font-size: 1.05rem; padding: 0.85rem 2.2rem; font-weight: 800; background: #3b82f6; border-bottom: 4px solid #2563eb; color: #fff; cursor:pointer;">
            🚀 Start New Student Assessment
          </button>
        </div>
      </div>
    `;
    const homeBtn = container.querySelector('#ceo-home-btn');
    if (homeBtn) {
      homeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        returnToLandingPage();
      });
    }
    const newTestBtn = container.querySelector('#ceo-new-test-btn');
    if (newTestBtn) {
      newTestBtn.addEventListener('click', (e) => {
        e.preventDefault();
        AssessmentRunner.clearSavedSession();
        returnToLandingPage();
        const btnChild = document.getElementById('btnRoleChild');
        if (btnChild) btnChild.click();
      });
    }
    return;
  }

  const totalStudents = sessions.length;
  const avgTotalScore = Math.round(sessions.reduce((acc, s) => acc + (s.total_score || 0), 0) / totalStudents);
  const avgActiveMins = (sessions.reduce((acc, s) => acc + ((s.total_active_duration_ms || 0) / 60000), 0) / totalStudents).toFixed(1);

  let studentRowsHtml = sessions.map((s, idx) => {
    const activeMins = Math.round((s.total_active_duration_ms || 0) / 60000);
    const flagsCount = Array.isArray(s.flags) ? s.flags.length : 0;
    const dateStr = s.start_time ? new Date(s.start_time).toLocaleDateString() : 'Today';
    const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';

    return `
      <tr style="background: ${rowBg}; border-bottom: 1px solid #e2e8f0; font-size: 0.9rem; transition: background 0.2s;">
        <td style="padding: 1rem 1.25rem; font-weight: 800; color: #64748b;">#${idx + 1}</td>
        <td style="padding: 1rem 1.25rem; font-weight: 900; color: #1e293b;">${s.student_name}</td>
        <td style="padding: 1rem 1.25rem; color: #64748b; font-weight: 700;">${s.age_group || '13-16'}</td>
        <td style="padding: 1rem 1.25rem; font-weight: 900; color: #0284c7; font-size: 1rem;">${s.total_score}/100</td>
        <td style="padding: 1rem 1.25rem;">
          <span style="background: #ecfdf5; border: 1.5px solid #a7f3d0; color: #047857; padding: 0.35rem 0.75rem; border-radius: 10px; font-weight: 800; font-size: 0.82rem; display: inline-block;">
            ${s.placed_track || s.recommended_track || 'L1 Coder'}
          </span>
        </td>
        <td style="padding: 1rem 1.25rem; text-align: center; font-weight: 700; color: #475569;">${activeMins}m</td>
        <td style="padding: 1rem 1.25rem; text-align: center;">
          ${flagsCount > 0
            ? `<span style="background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 0.25rem 0.6rem; border-radius: 8px; font-weight: 800; font-size: 0.8rem;">⚠️ ${flagsCount} Flag${flagsCount > 1 ? 's' : ''}</span>`
            : '<span style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #059669; padding: 0.25rem 0.6rem; border-radius: 8px; font-weight: 800; font-size: 0.8rem;">✅ Clean</span>'
          }
        </td>
        <td style="padding: 1rem 1.25rem; color: #64748b; font-size: 0.82rem; font-weight: 600;">${dateStr}</td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div class="glass-card" style="padding: 2.5rem; max-width: 1150px; margin: 0 auto; background: #ffffff; border: 4px solid #ffffff; border-radius: 2rem; box-shadow: 0 20px 40px -15px rgba(0,0,0,0.07);">
      
      <!-- CEO Top Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: #ecfeff; border: 1.5px solid #a5f3fc; color: #0891b2; padding: 0.35rem 0.85rem; border-radius: 12px; font-weight: 800; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.4rem;">
            🏛️ Executive Oversight
          </div>
          <h1 style="font-size: 2.2rem; font-weight: 900; color: #1e293b; margin: 0;">CodeRa CEO Executive Dashboard</h1>
          <p style="color: #64748b; font-size: 1rem; margin-top: 0.25rem; font-weight: 600;">Overview of all completed student assessments and readiness metrics</p>
        </div>
        <div class="ceo-actions-group" style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
          <button id="ceo-parent-hub-btn" class="btn btn-secondary" style="font-size: 0.88rem; font-weight: 800; background: #f0fdf4; border: 2px solid #bbf7d0; border-bottom: 4px solid #86efac; color: #15803d; padding: 0.6rem 1.25rem; cursor:pointer;">
            👨‍👩‍👧‍👦 Parent Hub
          </button>
          <button id="ceo-export-pdf-btn" class="btn btn-primary" style="font-size: 0.88rem; font-weight: 800; background: #3b82f6; border: 2px solid #2563eb; border-bottom: 4px solid #1d4ed8; color: #ffffff; padding: 0.6rem 1.25rem; cursor:pointer; display:inline-flex; align-items:center; gap:0.5rem;" title="Generate and Download Executive PDF Report">
            📥 Generate Report PDF
          </button>
          ${activeSession ? `
            <button id="back-to-report-btn" class="btn btn-secondary" style="font-size: 0.88rem; font-weight: 800; background: #ecfeff; border: 2px solid #a5f3fc; border-bottom: 4px solid #67e8f9; color: #0891b2; padding: 0.6rem 1.25rem; cursor:pointer;">
              📄 Current Student Report
            </button>
          ` : ''}
          <button id="back-to-home-btn" onclick="window.returnToLandingPage ? window.returnToLandingPage() : window.location.reload()" class="btn btn-secondary" style="font-size: 0.88rem; font-weight: 800; background: #f8fafc; border: 2px solid #e2e8f0; border-bottom: 4px solid #cbd5e1; color: #1e293b; padding: 0.6rem 1.25rem; cursor:pointer;">
            🏠 Back to Home
          </button>
        </div>
      </div>

      <!-- Stat Cards Grid (Green & White High Contrast) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem;">
        
        <!-- Stat 1: Total Students -->
        <div style="background: #eff6ff; border: 2px solid #bfdbfe; border-bottom: 4px solid #60a5fa; padding: 1.75rem; border-radius: 1.5rem; text-align: center; box-shadow: 0 4px 15px rgba(59,130,246,0.05);">
          <div style="font-size: 0.82rem; color: #1e40af; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">Total Students Assessed</div>
          <div style="font-size: 2.8rem; font-weight: 900; color: #1d4ed8; margin-top: 0.35rem; line-height: 1;">${totalStudents}</div>
          <div style="font-size: 0.75rem; color: #3b82f6; font-weight: 700; margin-top: 0.5rem;">Cumulative Registry</div>
        </div>

        <!-- Stat 2: Average Readiness Score -->
        <div style="background: #ecfdf5; border: 2px solid #a7f3d0; border-bottom: 4px solid #34d399; padding: 1.75rem; border-radius: 1.5rem; text-align: center; box-shadow: 0 4px 15px rgba(16,185,129,0.05);">
          <div style="font-size: 0.82rem; color: #065f46; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">Average Readiness Score</div>
          <div style="font-size: 2.8rem; font-weight: 900; color: #047857; margin-top: 0.35rem; line-height: 1;">${avgTotalScore}/100</div>
          <div style="font-size: 0.75rem; color: #10b981; font-weight: 700; margin-top: 0.5rem;">Cohort Accuracy Metric</div>
        </div>

        <!-- Stat 3: Average Thinking Time -->
        <div style="background: #fef3c7; border: 2px solid #fde68a; border-bottom: 4px solid #f59e0b; padding: 1.75rem; border-radius: 1.5rem; text-align: center; box-shadow: 0 4px 15px rgba(245,158,11,0.05);">
          <div style="font-size: 0.82rem; color: #92400e; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">Average Thinking Time</div>
          <div style="font-size: 2.8rem; font-weight: 900; color: #b45309; margin-top: 0.35rem; line-height: 1;">${avgActiveMins} <span style="font-size: 1.4rem; font-weight: 800;">min</span></div>
          <div style="font-size: 0.75rem; color: #d97706; font-weight: 700; margin-top: 0.5rem;">Active Engagement Duration</div>
        </div>

      </div>

      <!-- Table Section -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
        <h3 style="font-size: 1.3rem; font-weight: 900; color: #1e293b; margin: 0;">Student Assessment Registry</h3>
        <span style="font-size: 0.82rem; color: #64748b; font-weight: 700;">Showing ${totalStudents} records</span>
      </div>

      <div style="overflow-x: auto; border: 2px solid #e2e8f0; border-radius: 1.25rem; background: #ffffff; box-shadow: 0 4px 15px rgba(0,0,0,0.02);">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead style="background: #f8fafc; font-size: 0.78rem; text-transform: uppercase; color: #475569; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0;">
            <tr>
              <th style="padding: 1rem 1.25rem; font-weight: 800;">#</th>
              <th style="padding: 1rem 1.25rem; font-weight: 800;">Student Name</th>
              <th style="padding: 1rem 1.25rem; font-weight: 800;">Age Group</th>
              <th style="padding: 1rem 1.25rem; font-weight: 800;">Total Score</th>
              <th style="padding: 1rem 1.25rem; font-weight: 800;">Placed Level</th>
              <th style="padding: 1rem 1.25rem; text-align: center; font-weight: 800;">Active Time</th>
              <th style="padding: 1rem 1.25rem; text-align: center; font-weight: 800;">Flags</th>
              <th style="padding: 1rem 1.25rem; font-weight: 800;">Date</th>
            </tr>
          </thead>
          <tbody>
            ${studentRowsHtml}
          </tbody>
        </table>
      </div>
    </div>
  `;

  const ceoParentHubBtn = container.querySelector('#ceo-parent-hub-btn');
  if (ceoParentHubBtn) {
    ceoParentHubBtn.addEventListener('click', (e) => {
      e.preventDefault();
      import('./ParentDashboard').then(mod => {
        mod.renderParentDashboard(container);
      });
    });
  }

  const pdfBtn = container.querySelector('#ceo-export-pdf-btn');
  if (pdfBtn) {
    pdfBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.print();
    });
  }

  const floatingPdfBtn = container.querySelector('#floating-export-pdf-btn');
  if (floatingPdfBtn) {
    floatingPdfBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.print();
    });
  }

  const homeBtn = container.querySelector('#back-to-home-btn');
  if (homeBtn) {
    homeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      returnToLandingPage();
    });
  }

  const floatingHomeBtn = container.querySelector('#floating-home-btn');
  if (floatingHomeBtn) {
    floatingHomeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      returnToLandingPage();
    });
  }

  const reportBtn = container.querySelector('#back-to-report-btn');
  if (reportBtn && activeSession) {
    reportBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const placement = activePlacement || PlacementEngine.evaluatePlacement(
        activeSession.total_score,
        activeSession.domain_scores,
        activeSession.item_telemetries,
        activeSession.schema_version || '2.0'
      );
      renderReportDashboard(container, activeSession, placement);
    });
  }
}
