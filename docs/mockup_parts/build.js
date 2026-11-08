const fs = require('fs');
const path = require('path');

const svgIcons = require('./svg-icons');
const styles = require('./styles');
const navHeader = require('./nav-header');
const modHome = require('./mod-home');
const modDashboard = require('./mod-dashboard');
const modLms = require('./mod-lms');
const modLibrary = require('./mod-library');
const modWebrtc = require('./mod-webrtc');
const modWriting = require('./mod-writing');
const modSpeaking = require('./mod-speaking');
const modQuiz = require('./mod-quiz');
const modAttendance = require('./mod-attendance');
const modChat = require('./mod-chat');
const modalsToasts = require('./modals-toasts');
const scripts = require('./scripts');

const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Teacher Dong Academy — Trang Chủ & Toàn Diện Hệ Thống Đào Tạo Trực Tuyến</title>
  <meta name="description" content="Trang chủ chính thức Teacher Dong Academy: 5 Trụ cột đào tạo (English Proficiency, Professional Development, Life Skills, Life Experiences, Travel & Culture Blog) cùng nền tảng LMS và WebRTC LiveKit.">
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='9' fill='%232868B2'/%3E%3Ctext x='16' y='22' font-size='17' text-anchor='middle' fill='white' font-family='Arial' font-weight='700'%3ETD%3C/text%3E%3C/svg%3E">
  
  <!-- Google Fonts: Be Vietnam Pro + Noto Sans SC + Noto Sans JP -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;700;800&family=Noto+Sans+JP:wght@400;500;700;800&display=swap" rel="stylesheet">
  
  ${styles}
</head>
<body>
  ${svgIcons}
  ${navHeader}

  <main class="main-wrapper">
    ${modHome}
    ${modDashboard}
    ${modLms}
    ${modLibrary}
    ${modWebrtc}
    ${modWriting}
    ${modSpeaking}
    ${modQuiz}
    ${modAttendance}
    ${modChat}
  </main>

  ${modalsToasts}
  ${scripts}
</body>
</html>
`;

const outputPath = path.join(__dirname, '..', 'mockup-test.html');
fs.writeFileSync(outputPath, html, 'utf8');
console.log('Successfully generated complete mockup with Home Page at:', outputPath);
console.log('Total file size:', html.length, 'bytes');
