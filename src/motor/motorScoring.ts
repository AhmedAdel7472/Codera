// ---------------------------------------------------------------------------
// CodeRA Platform — Motor Assessment Scoring Engine
// Calculates section percentages, mouse/keyboard readiness, and diagnostic flags
// ---------------------------------------------------------------------------

import { MotorTaskResult, MotorAssessmentReportData } from './types';

export class MotorScoringEngine {
  public static computeReport(studentName: string, results: MotorTaskResult[]): MotorAssessmentReportData {
    const totalDurationMs = results.reduce((acc, r) => acc + r.durationMs, 0);

    // Filter by section
    const postureTasks = results.filter((r) => r.task.section === 'posture');
    const wristTasks = results.filter((r) => r.task.section === 'wrist');
    const fingerTasks = results.filter((r) => r.task.section === 'fingers');
    const coordTasks = results.filter((r) => r.task.section === 'coordination');

    const sumScore = (tasks: MotorTaskResult[]) => tasks.reduce((acc, t) => acc + t.score, 0);

    const postureRaw = sumScore(postureTasks);
    const postureMax = Math.max(1, postureTasks.length * 5); // 3 * 5 = 15
    const wristRaw = sumScore(wristTasks);
    const wristMax = Math.max(1, wristTasks.length * 5); // 4 * 5 = 20
    const fingerRaw = sumScore(fingerTasks);
    const fingerMax = Math.max(1, fingerTasks.length * 5); // 8 * 5 = 40
    const coordRaw = sumScore(coordTasks);
    const coordMax = Math.max(1, coordTasks.length * 5); // 10 * 5 = 50

    // Weighted 100-point total according to Evaluation framework:
    // Posture: 10%
    // Wrist: 25%
    // Fingers: 35%
    // Coordination: 30%
    const posturePct = (postureRaw / postureMax) * 100;
    const wristPct = (wristRaw / wristMax) * 100;
    const fingerPct = (fingerRaw / fingerMax) * 100;
    const coordPct = (coordRaw / coordMax) * 100;

    const overallScore = Math.round(
      posturePct * 0.10 +
      wristPct * 0.25 +
      fingerPct * 0.35 +
      coordPct * 0.30
    );

    // Mouse Readiness evaluation
    // Depends primarily on: wrist stability, pinch grip (task 12), mouse simulation (task 20, 21), pointing (16)
    const mouseTasks = results.filter((r) => [4, 5, 12, 16, 20, 21].includes(r.task.slot));
    const mouseScore = mouseTasks.length > 0
      ? Math.round((sumScore(mouseTasks) / (mouseTasks.length * 5)) * 100)
      : Math.round((wristPct + coordPct) / 2);

    let mouseRating: MotorAssessmentReportData['mouseReadiness']['rating'] = 'متقدم';
    const mousePoints: string[] = [];
    if (mouseScore >= 80) {
      mouseRating = 'متقدم';
      mousePoints.push('تحكم عالي في استقرار المؤشر وسرعة النقر.');
      mousePoints.push('جاهز تمامًا لبيئات البرمجة بالسحب والإفلات (Drag & Drop) وبرامج التصميم ثلاثي الأبعاد.');
    } else if (mouseScore >= 60) {
      mouseRating = 'مؤهل';
      mousePoints.push('قدرة جيدة على توجيه المؤشر والنقر بدقة مقبولة.');
      mousePoints.push('يُنصح بفأرة ذات تصميم مريح أو مقاس صغير يناسب يد الطفل.');
    } else if (mouseScore >= 40) {
      mouseRating = 'يحتاج دعم تدريبي';
      mousePoints.push('يواجه تشتتًا خفيفًا في المحاذاة الدقيقة للنقر المزدوج (Double Click).');
      mousePoints.push('يوصى باستخدام شاشات اللمس كبداية مع أنشطة تقوية حركة المعصم.');
    } else {
      mouseRating = 'غير مؤهل حاليًا';
      mousePoints.push('صعوبة في الحفاظ على قبضة الفأرة وتوجيه المؤشر.');
      mousePoints.push('يوصى ببدائل ميسرة مثل (Trackball أو شاشات اللمس الكبيرة).');
    }

    // Keyboard Readiness evaluation
    // Depends on: finger isolation (task 10), thumb opposition (11), key targeting (22, 23, 25)
    const keyboardTasks = results.filter((r) => [10, 11, 22, 23, 25].includes(r.task.slot));
    const keyboardScore = keyboardTasks.length > 0
      ? Math.round((sumScore(keyboardTasks) / (keyboardTasks.length * 5)) * 100)
      : Math.round((fingerPct + coordPct) / 2);

    let keyboardRating: MotorAssessmentReportData['keyboardReadiness']['rating'] = 'متقدم';
    const keyboardPoints: string[] = [];
    if (keyboardScore >= 80) {
      keyboardRating = 'متقدم';
      keyboardPoints.push('عزل ممتاز للأصابع الفردية مع سرعة وصول للمفاتيح المطلوبة.');
      keyboardPoints.push('مستعد للبدء في كتابة الأكواد النصية وتمارين الطباعة المنتظمة.');
    } else if (keyboardScore >= 60) {
      keyboardRating = 'مؤهل';
      keyboardPoints.push('قدرة مقبولة على الضغط بإصبع السبابة بشكل مستقل.');
      keyboardPoints.push('يحتاج وقتًا إضافيًا للتعود على التبديل السلس بين الصفوف.');
    } else if (keyboardScore >= 40) {
      keyboardRating = 'يحتاج دعم تدريبي';
      keyboardPoints.push('تداخل ملحوظ بين حركة الأصابع المجاورة أثناء محاولة الضغط على المفاتيح.');
      keyboardPoints.push('يُفضل البدء بكتل الأكواد البصرية (Block-based) لتقليل الحاجة للكتابة المطولة.');
    } else {
      keyboardRating = 'غير مؤهل حاليًا';
      keyboardPoints.push('محدودية في عزل حركة الأصابع، مما يجعل استخدام لوحة المفاتيح مرهقًا.');
    }

    // Tremor & Stability calculation
    const avgSteadiness = results.reduce((s, r) => s + (r.steadinessRating || 0.8), 0) / Math.max(1, results.length);
    let tremorRating: MotorAssessmentReportData['tremorAndStability']['rating'] = 'ممتاز';
    let tremorDesc = 'ثبات حركي متقن ومثالي للأنشطة الدقيقة.';
    if (avgSteadiness < 0.5) {
      tremorRating = 'تشتت حركي ملحوظ';
      tremorDesc = 'لوحظت تذبذبات حركية أثناء تثبيت اليد، يُنصح بفترات راحة منتظمة ودعامات للمعصم.';
    } else if (avgSteadiness < 0.7) {
      tremorRating = 'رعشة خفيفة';
      tremorDesc = 'ثبات متوسط مع بعض الاهتزاز عند التوقف المطول.';
    } else if (avgSteadiness < 0.85) {
      tremorRating = 'مستقر';
      tremorDesc = 'ثبات جيد جدًا يسمح بالتحكم الدقيق في الماوس.';
    }

    // Real Asymmetry index (comparing Right vs Left hand performance)
    const rightTasks = results.filter((r) => r.handTested === 'اليمين');
    const leftTasks = results.filter((r) => r.handTested === 'اليسار');
    let asymmetryPercent = 0;
    let dominantHand: MotorAssessmentReportData['asymmetryIndex']['dominantHand'] = 'متوازن';

    if (rightTasks.length > 0 && leftTasks.length > 0) {
      const avgRight = rightTasks.reduce((s, r) => s + r.score, 0) / rightTasks.length;
      const avgLeft = leftTasks.reduce((s, r) => s + r.score, 0) / leftTasks.length;
      const diff = avgRight - avgLeft;
      asymmetryPercent = Math.min(100, Math.round((Math.abs(diff) / Math.max(avgRight, avgLeft, 1)) * 100));
      dominantHand = diff > 0.4 ? 'اليمين' : diff < -0.4 ? 'اليسار' : 'متوازن';
    } else {
      // Evaluate bilateral integration: compare bimanual task (#8) with unimanual tasks
      const bimanualTask = results.find((r) => r.handTested === 'كلتا اليدين' || r.task.slot === 15);
      const unimanualTasks = results.filter((r) => r.task.section === 'fingers' && r.task.slot !== 15);
      if (bimanualTask && unimanualTasks.length > 0) {
        const uniAvg = unimanualTasks.reduce((s, r) => s + r.score, 0) / unimanualTasks.length;
        asymmetryPercent = Math.min(45, Math.round(Math.abs(uniAvg - bimanualTask.score) * 10));
      } else {
        asymmetryPercent = 5;
      }
      const rightCount = results.filter((r) => r.handTested === 'اليمين').length;
      const leftCount = results.filter((r) => r.handTested === 'اليسار').length;
      dominantHand = leftCount > rightCount ? 'اليسار' : 'اليمين';
    }

    let asymmetryDesc = 'توازن وتناسق حركي ممتاز بين اليدين.';
    if (asymmetryPercent > 25) {
      asymmetryDesc = `اعتماد واضح على يد ${dominantHand} مع تباين في الكفاءة بين الجانبين.`;
    } else if (asymmetryPercent > 12) {
      asymmetryDesc = `هيمنة وظيفية طبيعية ليد ${dominantHand} مع أداء جيد لليد الأخرى.`;
    }

    // Diagnostic flags & recommendations
    const targetedSupportFlags: string[] = [];
    const recommendationsAr: string[] = [];

    if (fingerPct < 50) {
      targetedSupportFlags.push('🚩 مؤشر دعم المهارات الحركية الدقيقة (عزل الأصابع يحتاج تنمية)');
      recommendationsAr.push('ممارسة أنشطة الصلصال والمعجون الطبي والتقاط الأشياء الصغيرة لتقوية عضلات الأصابع.');
    }
    if (wristPct < 50) {
      targetedSupportFlags.push('🚩 مؤشر دعم مرونة المعصم والرسغ');
      recommendationsAr.push('تمارين تمديد وإطالة المعصم في جميع الاتجاهات قبل بدء جلسات الكمبيوتر.');
    }
    if (coordPct < 55) {
      targetedSupportFlags.push('🚩 مؤشر التنسيق البصري الحركي');
      recommendationsAr.push('ألعاب التتبع البصري التفاعلية ومسارات المتاهات باللمس.');
    }
    if (avgSteadiness < 0.55) {
      targetedSupportFlags.push('🚩 مؤشر ضبط الثبات ومقاومة الإجهاد الحركي');
      recommendationsAr.push('توفير وسادة دعم مبطنة لراحة اليد (Wrist Rest) أمام لوحة المفاتيح والفأرة.');
    }

    if (recommendationsAr.length === 0) {
      recommendationsAr.push('الطفل يمتلك مهارات حركية وبصرية مكتملة تؤهله لجميع مسارات البرمجة وتركيب الروبوتات.');
      recommendationsAr.push('البدء فورًا في مسار بناء الروبوتات وبرمجة الأردوينو دون عوائق حركية.');
    }

    return {
      studentName,
      sessionTimestamp: Date.now(),
      totalDurationMs,
      overallScore,
      sectionScores: {
        posture: { score: Math.round(postureRaw), max: postureMax, percentage: Math.round(posturePct) },
        wrist: { score: Math.round(wristRaw), max: wristMax, percentage: Math.round(wristPct) },
        fingers: { score: Math.round(fingerRaw), max: fingerMax, percentage: Math.round(fingerPct) },
        coordination: { score: Math.round(coordRaw), max: coordMax, percentage: Math.round(coordPct) },
      },
      mouseReadiness: {
        ready: mouseScore >= 55,
        rating: mouseRating,
        score: mouseScore,
        points: mousePoints,
      },
      keyboardReadiness: {
        ready: keyboardScore >= 55,
        rating: keyboardRating,
        score: keyboardScore,
        points: keyboardPoints,
      },
      asymmetryIndex: {
        dominantHand,
        asymmetryPercent,
        descriptionAr: `توازن ملحوظ في الأداء الحركي بين اليدين (فارق تباين ${asymmetryPercent}% فقط).`,
      },
      tremorAndStability: {
        rating: tremorRating,
        tremorScore: Math.round(avgSteadiness * 100),
        descriptionAr: tremorDesc,
      },
      targetedSupportFlags,
      recommendationsAr,
      taskResults: results,
    };
  }
}
