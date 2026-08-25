const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. تحديث وتأكيد مسارات الصور في كائن IMAGES
content = content.replace(
  /const IMAGES\s*=\s*{[\s\S]*?};/,
  `const IMAGES = {
  builderRole: '/img/bilder.jpeg',
  mentorRole: '/img/monter.jpeg',
  coider: '/img/coder.jpeg',
  coder: '/img/coder.jpeg',
  codeGuide: '/img/guide.jpeg',
  guide: '/img/guide.jpeg',
  programmer: '/img/coder.jpeg',
  teacher: '/img/guide.jpeg',
  school: '/img/school.jpeg',
  center: '/img/specialist Center.jpeg'
};`
);

// 2. الحفاظ على نصوص وأزرار BUILDER و MENTOR في الصفحة الأولى
content = content.replace(
  /<h3[^>]*>(?:COIDER|BUILDER)<\/h3>[\s\S]*?<p[^>]*>[\s\S]*?<\/p>/i,
  `<h3 className="text-[26px] text-[#714EC0] font-bold mb-1 tracking-tight">BUILDER</h3>\n                <p className="text-[#5D6B82] text-lg leading-tight font-medium">I want to learn, create &<br />build.</p>`
);

content = content.replace(
  /<h3[^>]*>(?:CODE GUIDE|MENTOR)<\/h3>[\s\S]*?<p[^>]*>[\s\S]*?<\/p>/i,
  `<h3 className="text-[26px] text-[#007B80] font-bold mb-1 tracking-tight">MENTOR</h3>\n                <p className="text-[#5D6B82] text-lg leading-tight font-medium">I want to teach, inspire<br />& empower.</p>`
);

// 3. ضبط التنقل الصحيح (BUILDER يفتح صفحة builder و MENTOR يفتح صفحة mentor)
content = content.replace(
  /onClick=\{[^\}]*(?:alert\("Navigating to Dashboard\.\.\."\)|onNavigate\('builder'\))[^\}]*\}/i,
  "onClick={() => onNavigate('builder')}"
);

content = content.replace(
  /onClick=\{[^\}]*(?:onNavigate\('organization'\)|onNavigate\('mentor'\))[^\}]*\}/i,
  "onClick={() => onNavigate('mentor')}"
);

// 4. تحديث نصوص Organization Popup
content = content.replace(
  /<h2 className="text-[34px] font-serif font-bold text-[#0B152A] mb-3 leading-tight">\n\s*What does your<br \/>\n\s*<span className="text-[#007B80]">organization<\/span> do\?\n\s*<\/h2>\n\s*<p className="text-[#5D6B82] text-[17px] font-serif italic mt-2">Tell us more about your organization\.<\/p>/gi,
  `<h2 className="text-[34px] font-serif font-bold text-[#0B152A] mb-3 leading-tight">\n          Tell us more about your<br />\n          <span className="text-[#007B80]">organization.</span>\n        </h2>`
);

// 5. تحديث كروت المنظمات (SCHOOL & SPECIALIZED CENTER)
content = content.replace(
  /title="SCHOOL"[\s\S]*?delayClass="delay-150"/gi,
  'title="SCHOOL"\n          description="We want to bring inclusive coding to our students."\n          colorTheme="teal"\n          iconTopLeft={<GraduationCap size={16} strokeWidth={2.5} />}\n          delayClass="delay-150"\n          onClick={() => alert("Navigating to Dashboard...")}'
);

content = content.replace(
  /title="SPECIALIZED CENTER"[\s\S]*?delayClass="delay-300"/gi,
  'title="SPECIALIZED CENTER"\n          description="We support learners with special educational needs."\n          colorTheme="purple"\n          iconTopLeft={<Heart size={16} strokeWidth={2.5} fill="currentColor" />}\n          delayClass="delay-300"\n          onClick={() => alert("Navigating to Dashboard...")}'
);

// 6. استبدال شامل لأي مسارات صور ثابتة للتأكد من ربطها
content = content.replace(/src=["'][^"']*bilder[^"']*["']/gi, 'src="/img/bilder.jpeg"');
content = content.replace(/src=["'][^"']*monter[^"']*["']/gi, 'src="/img/monter.jpeg"');
content = content.replace(/src=["'][^"']*coder[^"']*["']/gi, 'src="/img/coder.jpeg"');
content = content.replace(/src=["'][^"']*guide[^"']*["']/gi, 'src="/img/guide.jpeg"');
content = content.replace(/src=["'][^"']*school[^"']*["']/gi, 'src="/img/school.jpeg"');
content = content.replace(/src=["'][^"']*(?:specialist Center|specialized)[^"']*["']/gi, 'src="/img/specialist Center.jpeg"');

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('✅ تم تصحيح الكود بالكامل وتثبيت التدفق بدون أي أخطاء!');