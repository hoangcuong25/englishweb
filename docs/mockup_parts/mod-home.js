module.exports = `
<!-- MODULE 0: HOME PAGE (TRANG CHỦ DÀNH CHO KHÁCH MỚI CHƯA CÓ TÀI KHOẢN) -->
<section id="tab-home" class="tab-pane active">

  <!-- 1. HERO SECTION DÀNH CHO KHÁCH MỚI -->
  <div style="background: radial-gradient(800px 420px at 85% 0%, rgba(85,184,232,.28), transparent 65%), radial-gradient(520px 320px at 0% 40%, rgba(255,181,71,.18), transparent 65%), var(--white); border:1.5px solid var(--line); border-radius:var(--radius-lg); padding: clamp(32px, 5vw, 64px) clamp(24px, 5vw, 56px); margin-bottom:32px; box-shadow:var(--shadow-sm); position:relative; overflow:hidden;">
    <div style="display:grid; grid-template-columns: 1.15fr 0.85fr; gap:40px; align-items:center;" class="hero-home-grid">
      <!-- Left: Headline & CTA -->
      <div>
        <div style="display:inline-flex; align-items:center; gap:8px; background:var(--light-blue); color:var(--primary); padding:7px 18px; border-radius:999px; font-size:.82rem; font-weight:800; letter-spacing:.08em; text-transform:uppercase; margin-bottom:18px;">
          <span style="width:8px; height:8px; border-radius:50%; background:var(--accent);"></span>
          Learn. Grow. Share. Inspire.
        </div>
        <h1 style="font-size:clamp(2.1rem, 4.2vw, 3.4rem); font-weight:800; line-height:1.2; margin:0 0 18px; color:var(--text); letter-spacing:-.02em;" data-i18n="home.heroTitle">
          Học tiếng Anh để <span style="color:var(--primary); position:relative;">tự tin<span style="position:absolute; left:0; right:0; bottom:4px; height:12px; background:var(--accent); opacity:.4; border-radius:6px; z-index:-1;"></span></span> bước xa hơn
        </h1>
        <p style="font-size:1.1rem; color:var(--text-soft); line-height:1.7; margin:0 0 28px;" data-i18n="home.heroSubtitle">
          Teacher Dong Academy đồng hành cùng học sinh, sinh viên và người đi làm trên hành trình học ngoại ngữ, nâng tầm chuyên môn và phát triển bản thân với nền tảng LMS và phòng học WebRTC LiveKit độc quyền.
        </p>

        <!-- CTA Action Buttons for Guest -->
        <div style="display:flex; flex-wrap:wrap; gap:14px; margin-bottom:28px;">
          <button type="button" class="btn btn-primary" onclick="scrollToPrograms()">
            <span data-i18n="home.exploreBtn">Khám phá 5 Chương trình trọng tâm</span>
            <svg class="ic"><use href="#i-arrow"/></svg>
          </button>
          <button type="button" class="btn btn-accent" onclick="openRegisterModal()">
            <svg class="ic"><use href="#i-users"/></svg>
            <span data-i18n="home.registerBtn">Đăng ký học viên mới</span>
          </button>
          <button type="button" class="btn btn-ghost" onclick="scrollToTech()">
            <svg class="ic"><use href="#i-video"/></svg>
            <span data-i18n="home.demoBtn">Trải nghiệm phòng học thử</span>
          </button>
        </div>

        <!-- Pillar Tags -->
        <div style="display:flex; flex-wrap:wrap; gap:10px; font-size:.84rem; font-weight:700;">
          <span style="background:var(--bg); border:1px solid var(--line); padding:6px 14px; border-radius:999px; color:var(--primary);"># English Proficiency</span>
          <span style="background:var(--bg); border:1px solid var(--line); padding:6px 14px; border-radius:999px; color:#1b83b6;"># Professional Development</span>
          <span style="background:var(--bg); border:1px solid var(--line); padding:6px 14px; border-radius:999px; color:#b26a00;"># Life Skills</span>
          <span style="background:var(--bg); border:1px solid var(--line); padding:6px 14px; border-radius:999px; color:#9F1239;"># Inspiration</span>
          <span style="background:var(--bg); border:1px solid var(--line); padding:6px 14px; border-radius:999px; color:#059669;"># Travel & Culture</span>
        </div>
      </div>

      <!-- Right: Hero Visual Frame & Floating Badges -->
      <div style="position:relative; width:100%; max-width:420px; margin:0 auto;">
        <div style="aspect-ratio:5/6; border-radius:999px 999px var(--radius-lg) var(--radius-lg); background:linear-gradient(165deg, var(--secondary), var(--primary) 70%); display:grid; place-items:center; box-shadow:var(--shadow-lg); position:relative; overflow:hidden;">
          <div style="width:140px; height:140px; border-radius:50%; background:#FFB547; opacity:.85; position:absolute; top:40px; right:30px;"></div>
          <div style="width:200px; height:200px; border-radius:50%; background:rgba(255,255,255,.15); position:absolute; bottom:20px; left:20px;"></div>
          <div style="position:relative; z-index:2; text-align:center; color:#fff; padding:20px;">
            <div style="width:100px; height:100px; border-radius:50%; background:#fff; color:var(--primary); font-size:2.8rem; font-weight:800; display:grid; place-items:center; margin:0 auto 14px; box-shadow:0 10px 24px rgba(0,0,0,.2);">TD</div>
            <div style="font-weight:800; font-size:1.3rem;">Teacher Dong</div>
            <div style="font-size:.85rem; color:#dbe9f8;">M.Ed • International Educator</div>
          </div>
        </div>

        <!-- Floating Skill Chips -->
        <div style="position:absolute; top:12%; left:-10%; background:#fff; padding:8px 16px; border-radius:999px; font-weight:700; font-size:.85rem; box-shadow:var(--shadow); display:flex; align-items:center; gap:8px;">
          <span class="tile t-blue" style="width:28px; height:28px; border-radius:50%;"><svg class="ic" style="width:16px; height:16px;"><use href="#i-headphones"/></svg></span>
          <span>Listening</span>
        </div>
        <div style="position:absolute; top:36%; right:-10%; background:#fff; padding:8px 16px; border-radius:999px; font-weight:700; font-size:.85rem; box-shadow:var(--shadow); display:flex; align-items:center; gap:8px;">
          <span class="tile t-amber" style="width:28px; height:28px; border-radius:50%;"><svg class="ic" style="width:16px; height:16px;"><use href="#i-mic"/></svg></span>
          <span>Speaking</span>
        </div>
        <div style="position:absolute; bottom:22%; left:-12%; background:#fff; padding:8px 16px; border-radius:999px; font-weight:700; font-size:.85rem; box-shadow:var(--shadow); display:flex; align-items:center; gap:8px;">
          <span class="tile t-sky" style="width:28px; height:28px; border-radius:50%;"><svg class="ic" style="width:16px; height:16px;"><use href="#i-book"/></svg></span>
          <span>Reading</span>
        </div>
        <div style="position:absolute; bottom:6%; right:-8%; background:#fff; padding:8px 16px; border-radius:999px; font-weight:700; font-size:.85rem; box-shadow:var(--shadow); display:flex; align-items:center; gap:8px;">
          <span class="tile t-blue" style="width:28px; height:28px; border-radius:50%;"><svg class="ic" style="width:16px; height:16px;"><use href="#i-edit"/></svg></span>
          <span>Writing AI</span>
        </div>
      </div>
    </div>
  </div>

  <!-- 2. BỐN GIÁ TRỊ CỐT LÕI (BRAND PILLARS) -->
  <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:16px; margin-bottom:48px;" class="grid-4">
    <div style="background:var(--white); border:1.5px solid var(--line); border-radius:var(--radius); padding:20px; display:flex; align-items:center; gap:14px; box-shadow:var(--shadow-sm);">
      <div class="tile t-blue"><svg class="ic"><use href="#i-book"/></svg></div>
      <div>
        <strong style="font-size:1.1rem; display:block;">Learn</strong>
        <span style="font-size:.82rem; color:var(--text-soft);">Học có phương pháp, lộ trình bài bản & mục tiêu rõ ràng.</span>
      </div>
    </div>
    <div style="background:var(--white); border:1.5px solid var(--line); border-radius:var(--radius); padding:20px; display:flex; align-items:center; gap:14px; box-shadow:var(--shadow-sm);">
      <div class="tile t-sky"><svg class="ic"><use href="#i-sprout"/></svg></div>
      <div>
        <strong style="font-size:1.1rem; display:block;">Grow</strong>
        <span style="font-size:.82rem; color:var(--text-soft);">Phát triển năng lực ngôn ngữ, tư duy & sự tự tin.</span>
      </div>
    </div>
    <div style="background:var(--white); border:1.5px solid var(--line); border-radius:var(--radius); padding:20px; display:flex; align-items:center; gap:14px; box-shadow:var(--shadow-sm);">
      <div class="tile t-amber"><svg class="ic"><use href="#i-users"/></svg></div>
      <div>
        <strong style="font-size:1.1rem; display:block;">Share</strong>
        <span style="font-size:.82rem; color:var(--text-soft);">Chia sẻ tri thức, bài học kinh nghiệm quốc tế quý báu.</span>
      </div>
    </div>
    <div style="background:var(--white); border:1.5px solid var(--line); border-radius:var(--radius); padding:20px; display:flex; align-items:center; gap:14px; box-shadow:var(--shadow-sm);">
      <div class="tile t-blue"><svg class="ic"><use href="#i-star"/></svg></div>
      <div>
        <strong style="font-size:1.1rem; display:block;">Inspire</strong>
        <span style="font-size:.82rem; color:var(--text-soft);">Thắp sáng niềm đam mê học tập suốt đời và vươn ra thế giới.</span>
      </div>
    </div>
  </div>

  <!-- 3. MAIN SECTION: 5 TRỤ CỘT ĐÀO TẠO TRỌNG TÂM (CHÍNH XÁC THEO ẢNH YÊU CẦU) -->
  <section id="home-programs-section" style="margin-bottom:56px; scroll-margin-top:120px;">
    <div style="text-align:center; max-width:840px; margin:0 auto 36px;">
      <div style="display:inline-flex; align-items:center; gap:8px; background:var(--light-blue); color:var(--primary); padding:6px 18px; border-radius:999px; font-weight:800; font-size:.82rem; text-transform:uppercase; letter-spacing:.08em; margin-bottom:12px;">
        <span style="width:7px; height:7px; border-radius:50%; background:var(--accent);"></span>
        CHƯƠNG TRÌNH ĐÀO TẠO CHÍNH THỨC
      </div>
      <h2 style="font-size:clamp(1.8rem, 3.5vw, 2.6rem); margin:0 0 14px; font-weight:800;" data-i18n="home.pillarsTitle">
        5 Trụ Cột Đào Tạo Trọng Tâm — Teacher Dong Academy
      </h2>
      <p style="color:var(--text-soft); font-size:1.05rem; line-height:1.6; margin:0;" data-i18n="home.pillarsSubtitle">
        Hệ sinh thái đào tạo toàn diện được thiết kế chuyên biệt, đáp ứng nhu cầu phát triển năng lực ngôn ngữ, chuyên môn sư phạm và kỹ năng sống cho mọi thế hệ người học.
      </p>
    </div>

    <!-- Filter Buttons Bar -->
    <div style="display:flex; justify-content:center; gap:10px; margin-bottom:32px; flex-wrap:wrap;">
      <button type="button" class="btn btn-sm btn-primary home-filter-btn" onclick="filterHomePillars('all', this)">Tất cả (5 Trụ Cột)</button>
      <button type="button" class="btn btn-sm btn-ghost home-filter-btn" onclick="filterHomePillars('p1', this)">1. English Proficiency</button>
      <button type="button" class="btn btn-sm btn-ghost home-filter-btn" onclick="filterHomePillars('p2', this)">2. Professional Development</button>
      <button type="button" class="btn btn-sm btn-ghost home-filter-btn" onclick="filterHomePillars('p3', this)">3. Life Skills</button>
      <button type="button" class="btn btn-sm btn-ghost home-filter-btn" onclick="filterHomePillars('p4', this)">4. Life Experiences</button>
      <button type="button" class="btn btn-sm btn-ghost home-filter-btn" onclick="filterHomePillars('p5', this)">5. Travel & Culture</button>
    </div>

    <!-- The 5 Cards Grid -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(370px, 1fr)); gap:26px;" id="pillars-container">

      <!-- ================= 1. English Proficiency Course ================= -->
      <div class="card pillar-block" data-pillar="p1" style="display:flex; flex-direction:column; border-top:5px solid var(--primary); padding:28px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
          <div style="display:flex; align-items:center; gap:14px;">
            <div class="tile t-blue"><svg class="ic"><use href="#i-chat"/></svg></div>
            <div>
              <span style="font-size:.76rem; font-weight:800; color:var(--primary); text-transform:uppercase; letter-spacing:.08em;">TRỤ CỘT 01</span>
              <h3 style="margin:2px 0 0; font-size:1.3rem;">1. English Proficiency Course</h3>
            </div>
          </div>
          <span class="badge badge-blue">4 KHÓA HỌC</span>
        </div>
        <p style="font-size:.9rem; color:var(--text-soft); line-height:1.6; margin-bottom:20px;">
          Chương trình phát triển năng lực tiếng Anh toàn diện, từ tiếng Anh công sở, luyện thi chứng chỉ quốc tế IELTS đến tiếng Anh giao tiếp và thiếu nhi.
        </p>

        <!-- Sub-items List (4 bullets) -->
        <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:22px; flex:1;">
          <!-- Item 1.1 -->
          <div class="pillar-sub-item" onclick="openProgramDetail('Business English for Communication', '1. English Proficiency Course', 'Tiếng Anh thương mại chuyên nghiệp: kỹ năng đàm phán hợp đồng, soạn thảo email đối tác quốc tế, thuyết trình dự án và chủ trì cuộc họp trực tuyến.', 'Người đi làm, Quản lý, Nhân viên văn phòng', 'LiveKit WebRTC 1:7 + LMS')">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="tile t-blue" style="width:28px; height:28px; border-radius:8px;"><svg class="ic" style="width:16px; height:16px;"><use href="#i-briefcase"/></svg></span>
              <strong style="font-size:.92rem;">Business English for Communication</strong>
            </div>
            <span class="badge badge-blue" style="font-size:.72rem;">Doanh nghiệp</span>
          </div>

          <!-- Item 1.2 -->
          <div class="pillar-sub-item" onclick="openProgramDetail('IELTS – Test Preparation', '1. English Proficiency Course', 'Lộ trình bứt phá IELTS Academic Band 6.5 -> 7.5+: tích hợp chấm Writing AI 4 tiêu chí chuẩn Cambridge và phòng Speaking Studio ghim nhận xét theo mốc thời gian từ Teacher Dong.', 'Học sinh cấp 3, Sinh viên, Du học sinh', 'WebRTC LiveKit + AI Writing Engine')">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="tile t-amber" style="width:28px; height:28px; border-radius:8px;"><svg class="ic" style="width:16px; height:16px;"><use href="#i-target"/></svg></span>
              <strong style="font-size:.92rem;">IELTS – Test Preparation</strong>
            </div>
            <span class="badge badge-amber" style="font-size:.72rem;">Band 6.5 - 7.5+</span>
          </div>

          <!-- Item 1.3 -->
          <div class="pillar-sub-item" onclick="openProgramDetail('Conversational English', '1. English Proficiency Course', 'Rèn luyện phản xạ nghe nói tiếng Anh tự nhiên, chỉnh sửa phát âm chuẩn IPA, làm chủ ngữ điệu và giao tiếp tự tin trong đời sống thực tế.', 'Mọi lứa tuổi muốn tự tin nói tiếng Anh', 'Lớp tương tác thời gian thực')">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="tile t-sky" style="width:28px; height:28px; border-radius:8px;"><svg class="ic" style="width:16px; height:16px;"><use href="#i-headphones"/></svg></span>
              <strong style="font-size:.92rem;">Conversational English</strong>
            </div>
            <span class="badge badge-blue" style="font-size:.72rem;">Phản xạ giao tiếp</span>
          </div>

          <!-- Item 1.4 -->
          <div class="pillar-sub-item" onclick="openProgramDetail('English for Early Childhood', '1. English Proficiency Course', 'Phương pháp thẩm thấu ngôn ngữ tự nhiên dành cho trẻ mầm non & tiểu học (4-10 tuổi) qua trò chơi, câu chuyện kể và bảng trắng trực quan nhiều màu sắc.', 'Trẻ em từ 4 - 10 tuổi', 'Lớp học vui nhộn LiveKit')">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="tile t-amber" style="width:28px; height:28px; border-radius:8px;"><svg class="ic" style="width:16px; height:16px;"><use href="#i-shapes"/></svg></span>
              <strong style="font-size:.92rem;">English for Early Childhood</strong>
            </div>
            <span class="badge badge-amber" style="font-size:.72rem;">Thiếu nhi</span>
          </div>
        </div>

        <button type="button" class="btn btn-ghost btn-sm" onclick="openEnrollForCategory('English Proficiency Course')" style="width:100%; justify-content:center;">
          <span>Xem chi tiết & Đăng ký tư vấn</span>
          <svg class="ic"><use href="#i-arrow"/></svg>
        </button>
      </div>

      <!-- ================= 2. Professional Development ================= -->
      <div class="card pillar-block" data-pillar="p2" style="display:flex; flex-direction:column; border-top:5px solid var(--secondary); padding:28px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
          <div style="display:flex; align-items:center; gap:14px;">
            <div class="tile t-sky"><svg class="ic"><use href="#i-briefcase"/></svg></div>
            <div>
              <span style="font-size:.76rem; font-weight:800; color:#1b83b6; text-transform:uppercase; letter-spacing:.08em;">TRỤ CỘT 02</span>
              <h3 style="margin:2px 0 0; font-size:1.3rem;">2. Professional Development</h3>
            </div>
          </div>
          <span class="badge badge-blue" style="background:#DDF3FC; color:#1b83b6;">6 CHỦ ĐỀ SƯ PHẠM</span>
        </div>
        <p style="font-size:.9rem; color:var(--text-soft); line-height:1.6; margin-bottom:20px;">
          Đào tạo chuyên môn sư phạm, kỹ năng giảng dạy hiện đại, đón đầu làn sóng Trí tuệ nhân tạo (AI) trong giáo dục và định hướng nghề nghiệp quốc tế.
        </p>

        <!-- Sub-items List (6 bullets) -->
        <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:22px; flex:1;">
          <div class="pillar-sub-item" onclick="openProgramDetail('AI Integration in Education', '2. Professional Development', 'Ứng dụng AI đột phá (ChatGPT, Claude, Prompt Engineering, Canva AI) để thiết kế bài giảng tự động, tạo đề kiểm tra thông minh và nâng cao hiệu suất sư phạm gấp 5 lần.', 'Giáo viên, Giảng viên, Nhà sáng tạo nội dung giáo dục', 'Chuyên đề thực hành AI')">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="tile t-green" style="width:28px; height:28px; border-radius:8px;"><svg class="ic" style="width:16px; height:16px;"><use href="#i-bulb"/></svg></span>
              <strong style="font-size:.92rem;">AI Integration in Education</strong>
            </div>
            <span class="badge badge-green" style="font-size:.72rem;">AI Xu hướng</span>
          </div>

          <div class="pillar-sub-item" onclick="openProgramDetail('Career Guidance', '2. Professional Development', 'Định hướng lộ trình nghề nghiệp trong ngành giáo dục & ngôn ngữ, chiến lược săn học bổng quốc tế và kỹ năng phỏng vấn tuyển dụng trường quốc tế.', 'Sinh viên sư phạm, Người chuyển ngành giáo dục', 'Mentoring 1:1')">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="tile t-blue" style="width:28px; height:28px; border-radius:8px;"><svg class="ic" style="width:16px; height:16px;"><use href="#i-chart"/></svg></span>
              <strong style="font-size:.92rem;">Career Guidance</strong>
            </div>
            <span class="badge badge-blue" style="font-size:.72rem;">Định hướng</span>
          </div>

          <div class="pillar-sub-item" onclick="openProgramDetail('Classroom Management', '2. Professional Development', 'Nghệ thuật tổ chức, điều phối lớp học thông minh (trực tiếp & trực tuyến), kỷ luật tích cực, khích lệ học sinh chủ động tương tác và xử lý tình huống sư phạm khéo léo.', 'Giáo viên các cấp, Trợ giảng', 'Phương pháp thực chiến')">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="tile t-sky" style="width:28px; height:28px; border-radius:8px;"><svg class="ic" style="width:16px; height:16px;"><use href="#i-monitor"/></svg></span>
              <strong style="font-size:.92rem;">Classroom Management</strong>
            </div>
            <span class="badge badge-blue" style="font-size:.72rem;">Quản lý lớp</span>
          </div>

          <div class="pillar-sub-item" onclick="openProgramDetail('Leadership and Management', '2. Professional Development', 'Năng lực lãnh đạo giáo dục, quản lý tổ bộ môn, xây dựng văn hóa làm việc chuyên nghiệp và điều phối dự án đào tạo chuẩn quốc tế.', 'Tổ trưởng chuyên môn, Quản lý học thuật', 'Lãnh đạo giáo dục')">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="tile t-amber" style="width:28px; height:28px; border-radius:8px;"><svg class="ic" style="width:16px; height:16px;"><use href="#i-crown"/></svg></span>
              <strong style="font-size:.92rem;">Leadership and Management</strong>
            </div>
            <span class="badge badge-amber" style="font-size:.72rem;">Quản lý</span>
          </div>

          <div class="pillar-sub-item" onclick="openProgramDetail('Research Mentorship', '2. Professional Development', 'Cố vấn phương pháp nghiên cứu khoa học giáo dục, kỹ năng phân tích định lượng/định tính, viết luận văn thạc sĩ/tiến sĩ và công bố bài báo quốc tế.', 'Học viên cao học, Nhà nghiên cứu', 'Cố vấn chuyên sâu')">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="tile t-blue" style="width:28px; height:28px; border-radius:8px;"><svg class="ic" style="width:16px; height:16px;"><use href="#i-book"/></svg></span>
              <strong style="font-size:.92rem;">Research Mentorship</strong>
            </div>
            <span class="badge badge-blue" style="font-size:.72rem;">Học thuật</span>
          </div>

          <div class="pillar-sub-item" onclick="openProgramDetail('Teaching Methodology', '2. Professional Development', 'Phương pháp giảng dạy hiện đại chuẩn quốc tế: Communicative Language Teaching (CLT), Task-Based Learning (TBL), Flipped Classroom và dạy học tương tác.', 'Giáo viên tiếng Anh', 'Phương pháp')">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="tile t-sky" style="width:28px; height:28px; border-radius:8px;"><svg class="ic" style="width:16px; height:16px;"><use href="#i-edit"/></svg></span>
              <strong style="font-size:.92rem;">Teaching Methodology</strong>
            </div>
            <span class="badge badge-blue" style="font-size:.72rem;">Sư phạm</span>
          </div>
        </div>

        <button type="button" class="btn btn-ghost btn-sm" onclick="openEnrollForCategory('Professional Development')" style="width:100%; justify-content:center;">
          <span>Xem chi tiết & Đăng ký tư vấn</span>
          <svg class="ic"><use href="#i-arrow"/></svg>
        </button>
      </div>

      <!-- ================= 3. Life Skills and Personal Growth ================= -->
      <div class="card pillar-block" data-pillar="p3" style="display:flex; flex-direction:column; border-top:5px solid var(--accent); padding:28px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
          <div style="display:flex; align-items:center; gap:14px;">
            <div class="tile t-amber"><svg class="ic"><use href="#i-sprout"/></svg></div>
            <div>
              <span style="font-size:.76rem; font-weight:800; color:#b26a00; text-transform:uppercase; letter-spacing:.08em;">TRỤ CỘT 03</span>
              <h3 style="margin:2px 0 0; font-size:1.3rem;">3. Life Skills and Personal Growth</h3>
            </div>
          </div>
          <span class="badge badge-amber">3 KỸ NĂNG VÀNG</span>
        </div>
        <p style="font-size:.9rem; color:var(--text-soft); line-height:1.6; margin-bottom:20px;">
          Học tiếng Anh gắn liền với bộ kỹ năng thế kỷ 21: mài sắc tư duy phản biện, làm chủ nghệ thuật thuyết trình trước công chúng và làm việc hiệu quả dưới áp lực cao.
        </p>

        <!-- Sub-items List (3 bullets) -->
        <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:22px; flex:1;">
          <div class="pillar-sub-item" onclick="openProgramDetail('Critical Thinking and Problem Solving', '3. Life Skills and Personal Growth', 'Rèn luyện thói quen tư duy phản biện, nhận diện bẫy ngụy biện logic, phân tích dữ liệu đa chiều và đưa ra giải pháp sáng tạo cho các thách thức thực tế.', 'Học sinh, Sinh viên, Người đi làm', 'Workshop tương tác')">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="tile t-amber" style="width:28px; height:28px; border-radius:8px;"><svg class="ic" style="width:16px; height:16px;"><use href="#i-bulb"/></svg></span>
              <strong style="font-size:.92rem;">Critical Thinking and Problem Solving</strong>
            </div>
            <span class="badge badge-amber" style="font-size:.72rem;">Tư duy phản biện</span>
          </div>

          <div class="pillar-sub-item" onclick="openProgramDetail('Public Speaking and Presentation Skills', '3. Life Skills and Personal Growth', 'Khắc phục nỗi sợ nói trước đám đông, nghệ thuật kể chuyện (Storytelling), kiểm soát cao độ giọng nói, ngôn ngữ hình thể và thiết kế bài thuyết trình cuốn hút.', 'Mọi lứa tuổi', 'Thực hành sân khấu trực tiếp')">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="tile t-blue" style="width:28px; height:28px; border-radius:8px;"><svg class="ic" style="width:16px; height:16px;"><use href="#i-mic"/></svg></span>
              <strong style="font-size:.92rem;">Public Speaking and Presentation Skills</strong>
            </div>
            <span class="badge badge-blue" style="font-size:.72rem;">Thuyết trình</span>
          </div>

          <div class="pillar-sub-item" onclick="openProgramDetail('Time Management and Working Under Pressure', '3. Life Skills and Personal Growth', 'Phương pháp quản trị thời gian tối ưu (Eisenhower Matrix, Pomodoro), giữ vững sự tập trung cao độ, quản trị căng thẳng và duy trì phong độ dưới áp lực thời gian.', 'Học sinh ôn thi, Nhân sự bận rộn', 'Kỹ năng sống thực chiến')">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="tile t-sky" style="width:28px; height:28px; border-radius:8px;"><svg class="ic" style="width:16px; height:16px;"><use href="#i-clock"/></svg></span>
              <strong style="font-size:.92rem;">Time Management and Working Under Pressure</strong>
            </div>
            <span class="badge badge-amber" style="font-size:.72rem;">Quản trị thời gian</span>
          </div>
        </div>

        <button type="button" class="btn btn-ghost btn-sm" onclick="openEnrollForCategory('Life Skills and Personal Growth')" style="width:100%; justify-content:center;">
          <span>Xem chi tiết Workshop & Đăng ký</span>
          <svg class="ic"><use href="#i-arrow"/></svg>
        </button>
      </div>

      <!-- ================= 4. Life Experiences and Inspiration ================= -->
      <div class="card pillar-block" data-pillar="p4" style="display:flex; flex-direction:column; border-top:5px solid #E11D48; padding:28px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
          <div style="display:flex; align-items:center; gap:14px;">
            <div class="tile t-red"><svg class="ic"><use href="#i-star"/></svg></div>
            <div>
              <span style="font-size:.76rem; font-weight:800; color:#E11D48; text-transform:uppercase; letter-spacing:.08em;">TRỤ CỘT 04</span>
              <h3 style="margin:2px 0 0; font-size:1.3rem;">4. Life Experiences and Inspiration</h3>
            </div>
          </div>
          <span class="badge" style="background:#FFE4E6; color:#9F1239;">4 CHUYÊN ĐỀ</span>
        </div>
        <p style="font-size:.9rem; color:var(--text-soft); line-height:1.6; margin-bottom:20px;">
          Những chia sẻ người thật việc thật, câu chuyện truyền cảm hứng và bài học xương máu đúc kết từ quá trình giảng dạy, sinh sống và lập nghiệp tại các quốc gia.
        </p>

        <!-- Sub-items List (4 bullets) -->
        <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:22px; flex:1;">
          <div class="pillar-sub-item" onclick="openProgramDetail('Inspirational Talks', '4. Life Experiences and Inspiration', 'Chuỗi tọa đàm thắp sáng khát vọng học hỏi, vượt qua rào cản tự ti ngôn ngữ, định hình lý tưởng sống và tiếp thêm năng lượng tích cực.', 'Cộng đồng học viên & Độc giả', 'Talkshow hàng tháng')">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="tile t-red" style="width:28px; height:28px; border-radius:8px;"><svg class="ic" style="width:16px; height:16px;"><use href="#i-star"/></svg></span>
              <strong style="font-size:.92rem;">Inspirational Talks</strong>
            </div>
            <span class="badge" style="background:#FFE4E6; color:#9F1239; font-size:.72rem;">Tọa đàm</span>
          </div>

          <div class="pillar-sub-item" onclick="openProgramDetail('Lessons from Teaching Abroad', '4. Life Experiences and Inspiration', 'Những trải nghiệm chân thực, sự khác biệt văn hóa lớp học và bài học sư phạm đúc rút từ nhiều năm trực tiếp giảng dạy tại các môi trường quốc tế.', 'Giáo viên, Giới trẻ đam mê giáo dục', 'Hồi ký & Chia sẻ')">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="tile t-blue" style="width:28px; height:28px; border-radius:8px;"><svg class="ic" style="width:16px; height:16px;"><use href="#i-globe"/></svg></span>
              <strong style="font-size:.92rem;">Lessons from Teaching Abroad</strong>
            </div>
            <span class="badge badge-blue" style="font-size:.72rem;">Quốc tế</span>
          </div>

          <div class="pillar-sub-item" onclick="openProgramDetail('Living and Working Overseas', '4. Life Experiences and Inspiration', 'Cẩm nang sinh tồn, kinh nghiệm tìm kiếm việc làm, hòa nhập cộng đồng và làm việc hiệu quả trong môi trường đa quốc gia ở nước ngoài.', 'Du học sinh, Người định cư', 'Cẩm nang thực tế')">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="tile t-sky" style="width:28px; height:28px; border-radius:8px;"><svg class="ic" style="width:16px; height:16px;"><use href="#i-briefcase"/></svg></span>
              <strong style="font-size:.92rem;">Living and Working Overseas</strong>
            </div>
            <span class="badge badge-blue" style="font-size:.72rem;">Hội nhập</span>
          </div>

          <div class="pillar-sub-item" onclick="openProgramDetail('Personal Stories and Reflections', '4. Life Experiences and Inspiration', 'Tản văn và những chiêm nghiệm sâu sắc của Teacher Dong về cuộc sống, triết lý giáo dục nhân văn và hành trình gầy dựng Teacher Dong Academy.', 'Tất cả bạn đọc', 'Tản văn & Tự sự')">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="tile t-amber" style="width:28px; height:28px; border-radius:8px;"><svg class="ic" style="width:16px; height:16px;"><use href="#i-book"/></svg></span>
              <strong style="font-size:.92rem;">Personal Stories and Reflections</strong>
            </div>
            <span class="badge badge-amber" style="font-size:.72rem;">Tự sự Teacher Dong</span>
          </div>
        </div>

        <button type="button" class="btn btn-ghost btn-sm" onclick="openEnrollForCategory('Life Experiences and Inspiration')" style="width:100%; justify-content:center;">
          <span>Đọc bài chia sẻ & Đăng ký Talkshow</span>
          <svg class="ic"><use href="#i-arrow"/></svg>
        </button>
      </div>

      <!-- ================= 5. Travel and Culture Blog ================= -->
      <div class="card pillar-block" data-pillar="p5" style="display:flex; flex-direction:column; border-top:5px solid #10B981; padding:28px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
          <div style="display:flex; align-items:center; gap:14px;">
            <div class="tile t-green"><svg class="ic"><use href="#i-globe"/></svg></div>
            <div>
              <span style="font-size:.76rem; font-weight:800; color:#059669; text-transform:uppercase; letter-spacing:.08em;">TRỤ CỘT 05</span>
              <h3 style="margin:2px 0 0; font-size:1.3rem;">5. Travel and Culture Blog</h3>
            </div>
          </div>
          <span class="badge badge-green">3 CHỦ ĐỀ BLOG</span>
        </div>
        <p style="font-size:.9rem; color:var(--text-soft); line-height:1.6; margin-bottom:20px;">
          Không gian văn hóa đa sắc tộc: khám phá vẻ đẹp danh lam thắng cảnh Châu Á, câu chuyện ngôn ngữ bản địa và nuôi dưỡng tư duy công dân toàn cầu.
        </p>

        <!-- Sub-items List (3 bullets) -->
        <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:22px; flex:1;">
          <div class="pillar-sub-item" onclick="openProgramDetail('Cultural Awareness', '5. Travel and Culture Blog', 'Mở rộng nhận thức văn hóa, tôn trọng phong tục đa quốc gia, nghi thức giao tiếp phi ngôn ngữ và kỹ năng ứng xử tinh tế trong thế giới phẳng.', 'Mọi người yêu thích văn hóa', 'Blog & Ký sự')">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="tile t-green" style="width:28px; height:28px; border-radius:8px;"><svg class="ic" style="width:16px; height:16px;"><use href="#i-globe"/></svg></span>
              <strong style="font-size:.92rem;">Cultural Awareness</strong>
            </div>
            <span class="badge badge-green" style="font-size:.72rem;">Nhận thức văn hóa</span>
          </div>

          <div class="pillar-sub-item" onclick="openProgramDetail('Discovering Asia', '5. Travel and Culture Blog', 'Hành trình trải nghiệm danh lam thắng cảnh, ẩm thực tinh hoa và chiều sâu lịch sử của các quốc gia Châu Á (Nhật Bản, Trung Quốc, Đông Nam Á...).', 'Người yêu du lịch & khám phá', 'Cẩm nang du lịch')">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="tile t-amber" style="width:28px; height:28px; border-radius:8px;"><svg class="ic" style="width:16px; height:16px;"><use href="#i-star"/></svg></span>
              <strong style="font-size:.92rem;">Discovering Asia</strong>
            </div>
            <span class="badge badge-amber" style="font-size:.72rem;">Khám phá Châu Á</span>
          </div>

          <div class="pillar-sub-item" onclick="openProgramDetail('Language and People', '5. Travel and Culture Blog', 'Sự kỳ diệu của ngôn ngữ bản xứ, nguồn gốc thú vị của các thành ngữ địa phương và những câu chuyện con người bình dị, ấm áp.', 'Người say mê ngôn ngữ học', 'Tản văn & Ngôn ngữ')">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="tile t-blue" style="width:28px; height:28px; border-radius:8px;"><svg class="ic" style="width:16px; height:16px;"><use href="#i-users"/></svg></span>
              <strong style="font-size:.92rem;">Language and People</strong>
            </div>
            <span class="badge badge-blue" style="font-size:.72rem;">Ngôn ngữ & Con người</span>
          </div>
        </div>

        <button type="button" class="btn btn-ghost btn-sm" onclick="openEnrollForCategory('Travel and Culture Blog')" style="width:100%; justify-content:center;">
          <span>Đọc bài viết Blog văn hóa</span>
          <svg class="ic"><use href="#i-arrow"/></svg>
        </button>
      </div>

    </div>
  </section>

  <!-- 4. TRẢI NGHIỆM CÔNG NGHỆ EDTECH ĐỘC QUYỀN (DÀNH CHO KHÁCH MỚI DÙNG THỬ) -->
  <section id="tech-preview-section" style="margin-bottom:56px; scroll-margin-top:120px;">
    <div class="card" style="background:#F1F6FC; border:1.5px solid var(--line); padding: clamp(28px, 4vw, 44px);">
      <div style="text-align:center; max-width:760px; margin:0 auto 32px;">
        <span class="badge badge-blue" style="margin-bottom:10px;">TRẢI NGHIỆM TƯƠNG TÁC MIỄN PHÍ</span>
        <h2 style="margin:0 0 10px; font-size:2rem;" data-i18n="home.techTitle">Công Nghệ Giảng Dạy Đột Phá — Trải Nghiệm Thử Ngay</h2>
        <p style="color:var(--text-soft); font-size:.95rem; margin:0;" data-i18n="home.techSubtitle">
          Teacher Dong Academy tích hợp công nghệ LiveKit SFU WebRTC độ trễ &lt; 150ms và Trí tuệ nhân tạo AI. Bạn có thể bấm thử nghiệm trực tiếp từng tính năng ngay dưới đây:
        </p>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:20px;">
        <!-- Demo 1: LiveKit -->
        <div style="background:#fff; border-radius:var(--radius-sm); border:1.5px solid var(--line); padding:22px; text-align:center; display:flex; flex-direction:column; align-items:center;">
          <div class="tile t-blue" style="margin-bottom:14px;"><svg class="ic"><use href="#i-video"/></svg></div>
          <h4 style="margin:0 0 6px;">Lớp Học LiveKit SFU</h4>
          <p style="font-size:.84rem; color:var(--text-soft); margin-bottom:16px;">1 Host + 7 Students, tương tác âm thanh & hình ảnh HD, bảng trắng trực tiếp.</p>
          <button type="button" class="btn btn-primary btn-sm" onclick="testFeatureFromHome('classroom')" style="margin-top:auto;">
            Thử phòng học WebRTC
          </button>
        </div>

        <!-- Demo 2: AI Writing -->
        <div style="background:#fff; border-radius:var(--radius-sm); border:1.5px solid var(--line); padding:22px; text-align:center; display:flex; flex-direction:column; align-items:center;">
          <div class="tile t-amber" style="margin-bottom:14px;"><svg class="ic"><use href="#i-edit"/></svg></div>
          <h4 style="margin:0 0 6px;">AI Writing 4 Tiêu Chí</h4>
          <p style="font-size:.84rem; color:var(--text-soft); margin-bottom:16px;">Phân tích bài viết IELTS Task 1 & 2 tức thì, chấm điểm TR, CC, LR, GRA và gợi ý từ vựng C1/C2.</p>
          <button type="button" class="btn btn-accent btn-sm" onclick="testFeatureFromHome('writing')" style="margin-top:auto;">
            Thử chấm bài Writing AI
          </button>
        </div>

        <!-- Demo 3: Speaking Studio -->
        <div style="background:#fff; border-radius:var(--radius-sm); border:1.5px solid var(--line); padding:22px; text-align:center; display:flex; flex-direction:column; align-items:center;">
          <div class="tile t-red" style="margin-bottom:14px;"><svg class="ic"><use href="#i-mic"/></svg></div>
          <h4 style="margin:0 0 6px;">Speaking Studio</h4>
          <p style="font-size:.84rem; color:var(--text-soft); margin-bottom:16px;">Phòng thu âm Web Audio trực tiếp trên trình duyệt, ghim nhận xét theo từng mốc thời gian.</p>
          <button type="button" class="btn btn-primary btn-sm" onclick="testFeatureFromHome('speaking')" style="margin-top:auto;">
            Thử phòng thu âm
          </button>
        </div>

        <!-- Demo 4: Watermark & Security -->
        <div style="background:#fff; border-radius:var(--radius-sm); border:1.5px solid var(--line); padding:22px; text-align:center; display:flex; flex-direction:column; align-items:center;">
          <div class="tile t-sky" style="margin-bottom:14px;"><svg class="ic"><use href="#i-shield"/></svg></div>
          <h4 style="margin:0 0 6px;">Bảo Mật Học Liệu Số</h4>
          <p style="font-size:.84rem; color:var(--text-soft); margin-bottom:16px;">Dynamic Watermark chuyển động chống quay lén, token ký số 15 phút và chặn tải lậu.</p>
          <button type="button" class="btn btn-ghost btn-sm" onclick="testFeatureFromHome('library')" style="margin-top:auto;">
            Xem tài liệu bảo mật
          </button>
        </div>
      </div>
    </div>
  </section>

  <!-- 5. ABOUT TEACHER DONG (GIỚI THIỆU GIẢNG VIÊN CHỦ NHIỆM) -->
  <section id="about-teacher-dong" style="margin-bottom:56px; scroll-margin-top:120px;">
    <div class="card" style="background:linear-gradient(135deg, var(--primary-deep), var(--primary)); color:#fff; padding: clamp(32px, 5vw, 56px);">
      <div style="display:grid; grid-template-columns: 280px 1fr; gap:40px; align-items:center;" class="about-dong-grid">
        <div style="text-align:center;">
          <div style="width:170px; height:170px; border-radius:50%; background:linear-gradient(135deg, var(--secondary), #fff); color:var(--primary); font-size:3.8rem; font-weight:800; display:grid; place-items:center; margin:0 auto 18px; border:5px solid var(--accent); box-shadow:var(--shadow-lg);">
            TD
          </div>
          <h3 style="color:#fff; margin:0 0 4px; font-size:1.35rem;">Teacher Dong</h3>
          <span class="badge badge-amber" style="background:var(--accent); color:#153a68; font-weight:800; font-size:.78rem;">
            FOUNDER & MASTER INSTRUCTOR
          </span>
          <p style="font-size:.82rem; color:#dbe9f8; margin:8px 0 0;">Thạc sĩ Sư phạm • 10+ Năm Giảng dạy Quốc tế</p>
        </div>

        <div>
          <div style="display:inline-flex; align-items:center; gap:8px; background:rgba(255,255,255,.15); color:#fff; padding:5px 16px; border-radius:999px; font-size:.8rem; font-weight:700; margin-bottom:14px;">
            LỜI NGỎ TỪ GIẢNG VIÊN
          </div>
          <h2 style="color:#fff; margin:0 0 14px; font-size:clamp(1.6rem, 3vw, 2.2rem);">
            "Học tiếng Anh để tự tin bước ra thế giới, chia sẻ để lan tỏa giá trị bền vững"
          </h2>
          <p style="color:#dbe9f8; font-size:1rem; line-height:1.75; margin:0 0 20px;">
            Chào bạn! Tôi thành lập <strong>Teacher Dong Academy</strong> với mong muốn tạo nên một không gian học tập thực sự khác biệt: nơi học viên không phải học vẹt hay sợ hãi khi nói sai, mà được khích lệ tư duy phản biện, làm chủ công nghệ hiện đại và mở rộng tầm nhìn toàn cầu.
          </p>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:14px; margin-bottom:24px;">
            <div style="background:rgba(255,255,255,.1); padding:12px 16px; border-radius:12px; border:1px solid rgba(255,255,255,.15);">
              <strong style="color:var(--accent); font-size:1.1rem; display:block;">100% Tận tâm</strong>
              <span style="font-size:.84rem; color:#e2e8f0;">Trực tiếp theo sát & chấm bài học viên</span>
            </div>
            <div style="background:rgba(255,255,255,.1); padding:12px 16px; border-radius:12px; border:1px solid rgba(255,255,255,.15);">
              <strong style="color:var(--accent); font-size:1.1rem; display:block;">Lớp Tối Đa 7 Học Viên</strong>
              <span style="font-size:.84rem; color:#e2e8f0;">Tương tác sâu, phản hồi tức thì</span>
            </div>
            <div style="background:rgba(255,255,255,.1); padding:12px 16px; border-radius:12px; border:1px solid rgba(255,255,255,.15);">
              <strong style="color:var(--accent); font-size:1.1rem; display:block;">EdTech Tiên Phong</strong>
              <span style="font-size:.84rem; color:#e2e8f0;">WebRTC SFU & Trợ lý Writing AI</span>
            </div>
          </div>

          <div style="display:flex; flex-wrap:wrap; gap:12px;">
            <button type="button" class="btn btn-accent" onclick="openRegisterModal()">
              <svg class="ic"><use href="#i-check"/></svg>
              <span>Đăng ký tham gia lớp học cùng Teacher Dong</span>
            </button>
            <button type="button" class="btn btn-ghost" style="color:#fff; border-color:rgba(255,255,255,.3);" onclick="scrollToContact()">
              <svg class="ic"><use href="#i-mail"/></svg>
              <span>Đặt lịch tư vấn 1:1 miễn phí</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- 6. FORM ĐĂNG KÝ TƯ VẤN & NHẬN LỘ TRÌNH MIỄN PHÍ -->
  <section id="consultation-section" style="margin-bottom:48px; scroll-margin-top:120px;">
    <div class="card" style="padding: clamp(28px, 4vw, 44px);">
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:44px; align-items:center;" class="consult-grid">
        <!-- Left: Copy & Promises -->
        <div>
          <span class="badge badge-amber" style="margin-bottom:12px;">TƯ VẤN LỘ TRÌNH HỌC TẬP</span>
          <h2 style="margin:0 0 14px; font-size:2rem;" data-i18n="home.consultTitle">Nhận Tư Vấn Lộ Trình & Đăng Ký Kiểm Tra Đầu Vào</h2>
          <p style="color:var(--text-soft); font-size:1rem; line-height:1.7; margin:0 0 24px;" data-i18n="home.consultSubtitle">
            Để lại thông tin bên cạnh, Teacher Dong Academy sẽ liên hệ trực tiếp với bạn trong vòng 24 giờ để đánh giá trình độ và xây dựng lộ trình học tập cá nhân hóa hoàn toàn miễn phí.
          </p>

          <ul style="display:flex; flex-direction:column; gap:14px; font-size:.92rem; color:var(--text-soft);">
            <li style="display:flex; align-items:center; gap:10px;">
              <svg class="ic" style="color:var(--success); width:20px; height:20px;"><use href="#i-check"/></svg>
              <span>Miễn phí kiểm tra 4 kỹ năng (Listening, Speaking, Reading, Writing)</span>
            </li>
            <li style="display:flex; align-items:center; gap:10px;">
              <svg class="ic" style="color:var(--success); width:20px; height:20px;"><use href="#i-check"/></svg>
              <span>Tư vấn trực tiếp 1:1 phù hợp theo 5 Trụ cột chương trình</span>
            </li>
            <li style="display:flex; align-items:center; gap:10px;">
              <svg class="ic" style="color:var(--success); width:20px; height:20px;"><use href="#i-check"/></svg>
              <span>Tặng 1 buổi học thử lớp trực tuyến LiveKit WebRTC tương tác</span>
            </li>
          </ul>
        </div>

        <!-- Right: Consultation Form -->
        <form onsubmit="handleConsultationSubmit(event)" style="background:var(--bg); border:1.5px solid var(--line); border-radius:var(--radius); padding:28px;">
          <h3 style="margin:0 0 16px; font-size:1.2rem;">Thông tin đăng ký tư vấn</h3>
          
          <div class="form-group">
            <label>Họ và tên của bạn: *</label>
            <input type="text" class="form-input" id="cf-guest-name" placeholder="Ví dụ: Nguyễn Văn An" required>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="form-group">
              <label>Địa chỉ Email: *</label>
              <input type="email" class="form-input" id="cf-guest-email" placeholder="email@example.com" required>
            </div>
            <div class="form-group">
              <label>Số điện thoại: *</label>
              <input type="tel" class="form-input" id="cf-guest-phone" placeholder="0987 654 321" required>
            </div>
          </div>

          <div class="form-group">
            <label>Chương trình đào tạo quan tâm: *</label>
            <select class="form-select" id="cf-guest-program" required>
              <option value="">-- Chọn 1 trong 5 Trụ Cột Đào Tạo --</option>
              <option value="p1">1. English Proficiency (IELTS, Business, Giao tiếp, Thiếu nhi)</option>
              <option value="p2">2. Professional Development (Sư phạm AI, Lãnh đạo, Nghiên cứu)</option>
              <option value="p3">3. Life Skills & Personal Growth (Tư duy phản biện, Thuyết trình)</option>
              <option value="p4">4. Life Experiences & Inspiration (Tọa đàm, Kinh nghiệm quốc tế)</option>
              <option value="p5">5. Travel & Culture Blog (Văn hóa, Khám phá Châu Á)</option>
            </select>
          </div>

          <div class="form-group">
            <label>Mục tiêu hoặc câu hỏi của bạn:</label>
            <textarea class="form-textarea" id="cf-guest-msg" rows="2" placeholder="Ví dụ: Em cần đạt IELTS 7.0 trong 6 tháng tới..."></textarea>
          </div>

          <button type="submit" class="btn btn-accent" style="width:100%; justify-content:center; padding:12px;">
            <svg class="ic"><use href="#i-send"/></svg>
            <span data-i18n="home.submitConsultBtn">Gửi thông tin đăng ký tư vấn</span>
          </button>
        </form>
      </div>
    </div>
  </section>

  <!-- 7. FOOTER CHUẨN TEACHER DONG ACADEMY -->
  <footer style="background:#14263d; color:#c3d1e2; border-radius:var(--radius-lg); padding: clamp(36px, 5vw, 60px) clamp(24px, 5vw, 48px); margin-bottom:20px;">
    <div style="display:grid; grid-template-columns: 1.4fr 1fr 1fr 1.2fr; gap:36px; padding-bottom:36px; border-bottom:1px solid rgba(255,255,255,.1);" class="footer-grid">
      <!-- Col 1: Brand -->
      <div>
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:14px;">
          <div class="brand-mark" style="width:40px; height:40px; border-radius:12px;">TD</div>
          <div>
            <strong style="color:#fff; font-size:1.1rem; display:block;">Teacher Dong Academy</strong>
            <small style="color:var(--secondary); font-weight:700; text-transform:uppercase; font-size:.68rem;">Learn. Grow. Share. Inspire.</small>
          </div>
        </div>
        <p style="font-size:.88rem; line-height:1.7; color:#94a3b8; margin:0 0 16px;">
          Nền tảng đào tạo tiếng Anh học thuật & phát triển năng lực toàn diện. Tiên phong ứng dụng WebRTC SFU và Trí tuệ nhân tạo AI trong giảng dạy trực tuyến.
        </p>
        <div style="font-size:.82rem; color:var(--accent);">
          © 2026 Teacher Dong Academy. All rights reserved.
        </div>
      </div>

      <!-- Col 2: 5 Programs -->
      <div>
        <h4 style="color:#fff; margin-bottom:14px; font-size:.95rem;">5 TRỤ CỘT ĐÀO TẠO</h4>
        <ul style="display:flex; flex-direction:column; gap:8px; font-size:.86rem;">
          <li><a href="#home-programs-section" onclick="filterHomePillars('p1', null)" style="color:#94a3b8;">1. English Proficiency</a></li>
          <li><a href="#home-programs-section" onclick="filterHomePillars('p2', null)" style="color:#94a3b8;">2. Professional Development</a></li>
          <li><a href="#home-programs-section" onclick="filterHomePillars('p3', null)" style="color:#94a3b8;">3. Life Skills & Growth</a></li>
          <li><a href="#home-programs-section" onclick="filterHomePillars('p4', null)" style="color:#94a3b8;">4. Life Experiences</a></li>
          <li><a href="#home-programs-section" onclick="filterHomePillars('p5', null)" style="color:#94a3b8;">5. Travel & Culture</a></li>
        </ul>
      </div>

      <!-- Col 3: Công nghệ LMS -->
      <div>
        <h4 style="color:#fff; margin-bottom:14px; font-size:.95rem;">HỆ SINH THÁI EDTECH</h4>
        <ul style="display:flex; flex-direction:column; gap:8px; font-size:.86rem;">
          <li><a href="javascript:void(0)" onclick="testFeatureFromHome('classroom')" style="color:#94a3b8;">WebRTC LiveKit Class</a></li>
          <li><a href="javascript:void(0)" onclick="testFeatureFromHome('writing')" style="color:#94a3b8;">AI IELTS Writing Evaluator</a></li>
          <li><a href="javascript:void(0)" onclick="testFeatureFromHome('speaking')" style="color:#94a3b8;">Speaking Audio Studio</a></li>
          <li><a href="javascript:void(0)" onclick="testFeatureFromHome('library')" style="color:#94a3b8;">Digital Secure Library</a></li>
          <li><a href="javascript:void(0)" onclick="testFeatureFromHome('quiz')" style="color:#94a3b8;">Interactive Quiz Engine</a></li>
        </ul>
      </div>

      <!-- Col 4: Liên hệ -->
      <div>
        <h4 style="color:#fff; margin-bottom:14px; font-size:.95rem;">KẾT NỐI VỚI CHÚNG TÔI</h4>
        <p style="font-size:.86rem; color:#94a3b8; line-height:1.6; margin-bottom:12px;">
          Hotline / Zalo tư vấn: <strong>0987 654 321</strong><br>
          Email: <strong>contact@teacherdong.academy</strong><br>
          Hỗ trợ kỹ thuật: 24/7
        </p>
        <button type="button" class="btn btn-accent btn-sm" onclick="openLoginModal()" style="width:100%; justify-content:center;">
          Đăng nhập hệ thống học viên
        </button>
      </div>
    </div>
  </footer>

  <!-- AUTH MODAL (ĐĂNG NHẬP / ĐĂNG KÝ HỌC VIÊN DÀNH CHO KHÁCH MỚI) -->
  <div class="modal-overlay" id="auth-modal">
    <div class="modal-content" style="max-width:440px; padding:32px;">
      <div style="text-align:center; margin-bottom:20px;">
        <div class="brand-mark" style="width:50px; height:50px; margin:0 auto 10px; font-size:1.3rem;">TD</div>
        <h3 style="margin:0 0 4px;" id="auth-modal-title">Đăng nhập tài khoản</h3>
        <p style="color:var(--text-soft); font-size:.85rem; margin:0;">Teacher Dong Academy LMS & LiveKit</p>
      </div>

      <!-- Tab Switcher: Login vs Register -->
      <div style="display:flex; background:var(--bg); padding:4px; border-radius:12px; margin-bottom:18px;">
        <button type="button" class="btn btn-sm" id="tab-auth-login" onclick="setAuthTab('login')" style="flex:1; border-radius:8px; background:var(--white); color:var(--text); box-shadow:0 2px 6px rgba(0,0,0,.08);">
          Đăng nhập
        </button>
        <button type="button" class="btn btn-sm btn-ghost" id="tab-auth-register" onclick="setAuthTab('register')" style="flex:1; border-radius:8px; border:none;">
          Đăng ký mới
        </button>
      </div>

      <!-- Google OAuth 1-Click Button -->
      <button type="button" class="btn btn-ghost" onclick="loginWithGoogleMock()" style="width:100%; border:1.5px solid var(--line); margin-bottom:16px; font-size:.88rem;">
        <svg class="ic" style="width:20px; height:20px;"><use href="#i-google"/></svg>
        <span>Tiếp tục với Google OAuth 2.0</span>
      </button>

      <div style="text-align:center; position:relative; margin-bottom:16px;">
        <hr style="border:none; border-top:1px solid var(--line); margin:0;">
        <span style="position:absolute; top:-10px; left:50%; transform:translateX(-50%); background:var(--white); padding:0 12px; font-size:.78rem; color:var(--text-soft);">HOẶC EMAIL</span>
      </div>

      <!-- Auth Form -->
      <form onsubmit="handleAuthSubmit(event)">
        <div class="form-group" id="group-fullname" style="display:none;">
          <label>Họ và tên của bạn: *</label>
          <input type="text" class="form-input" id="auth-fullname" placeholder="Nguyễn Văn An">
        </div>

        <div class="form-group">
          <label>Email: *</label>
          <input type="email" class="form-input" id="auth-email" placeholder="an.nguyen@example.com" value="nguyenvanan.ielts@gmail.com" required>
        </div>

        <div class="form-group">
          <label>Mật khẩu: *</label>
          <input type="password" class="form-input" id="auth-password" value="••••••••" required>
        </div>

        <!-- Role Selector (cho mục đích test mockup) -->
        <div class="form-group">
          <label>Đăng nhập với vai trò:</label>
          <select class="form-select" id="auth-role-select">
            <option value="STUDENT">Học viên (STUDENT) — Nguyễn Văn An</option>
            <option value="ADMIN">Giảng viên / Admin (ADMIN) — Teacher Dong</option>
          </select>
        </div>

        <div style="background:#FFFBEB; border:1px solid #FCD34D; border-radius:8px; padding:8px 12px; font-size:.76rem; color:#92400E; margin-bottom:16px;">
          🔒 Hệ thống áp dụng cơ chế <strong>Single Concurrent Session</strong>. Khi đăng nhập, mọi phiên cũ trên thiết bị khác sẽ tự động chấm dứt.
        </div>

        <button type="submit" class="btn btn-primary" id="btn-auth-submit" style="width:100%; justify-content:center; padding:12px;">
          Đăng nhập ngay
        </button>
      </form>

      <div style="text-align:center; margin-top:14px;">
        <button type="button" class="btn btn-ghost btn-sm" onclick="closeAuthModal()" style="font-size:.82rem;">Đóng cửa sổ</button>
      </div>
    </div>
  </div>

  <!-- PROGRAM DETAIL DRAWER MODAL -->
  <div class="modal-overlay" id="program-detail-modal">
    <div class="modal-content" style="max-width:580px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px;">
        <div>
          <span class="badge badge-blue" id="pmodal-category">Chương trình</span>
          <h3 style="margin:6px 0 0; font-size:1.35rem;" id="pmodal-title">Tên khóa học</h3>
        </div>
        <button type="button" onclick="closeProgramDetail()" style="background:none; border:none; color:var(--text-soft); cursor:pointer; padding:4px;">
          <svg class="ic" style="width:20px; height:20px;"><use href="#i-close"/></svg>
        </button>
      </div>

      <div style="background:var(--bg); border:1.5px solid var(--line); border-radius:var(--radius-sm); padding:16px; margin-bottom:16px;">
        <h4 style="margin:0 0 6px; font-size:.9rem; color:var(--primary);">Mục tiêu & Nội dung trọng tâm:</h4>
        <p style="font-size:.92rem; color:var(--text); margin:0; line-height:1.6;" id="pmodal-desc">Mô tả</p>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px; font-size:.85rem;">
        <div style="background:#FAFDFE; border:1px solid var(--line); border-radius:10px; padding:10px 14px;">
          <div style="color:var(--text-soft); font-size:.78rem;">Đối tượng học viên:</div>
          <strong id="pmodal-target" style="color:var(--text);">Học viên</strong>
        </div>
        <div style="background:#FAFDFE; border:1px solid var(--line); border-radius:10px; padding:10px 14px;">
          <div style="color:var(--text-soft); font-size:.78rem;">Hình thức đào tạo:</div>
          <strong id="pmodal-format" style="color:var(--primary);">LiveKit SFU + LMS</strong>
        </div>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px;">
        <button type="button" class="btn btn-ghost btn-sm" onclick="closeProgramDetail()">Đóng</button>
        <button type="button" class="btn btn-accent btn-sm" onclick="enrollProgramFromModal()">
          <svg class="ic"><use href="#i-check"/></svg>
          <span>Đăng ký tham gia ngay</span>
        </button>
      </div>
    </div>
  </div>

</section>
`;
