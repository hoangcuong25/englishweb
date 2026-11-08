/* ==========================================================
   Teacher Dong Academy — i18n.js
   Đa ngôn ngữ: Tiếng Việt (vi), English (en), 中文 (zh), 日本語 (ja)

   Mỗi khóa có dạng:  "khóa": [vi, en, zh, ja]
   - Chữ trong HTML dùng thuộc tính:
       data-i18n="khóa"            → thay textContent
       data-i18n-html="khóa"       → thay innerHTML (chỉ dùng cho chuỗi tin cậy)
       data-i18n-attr="aria-label:khóa;alt:khóa"  → thay thuộc tính
   - Chữ trong JS dùng:  I18N.t("khóa")
   Nội dung mẫu được đánh dấu [Mẫu]/[Sample]/[样例]/[サンプル] — thay bằng nội dung chính thức.
   Bản dịch EN/ZH/JA nên được người bản ngữ rà soát trước khi công bố.
   ========================================================== */

const T = {
  /* ---- Meta & chung ---- */
  "meta.desc":      ["Teacher Dong Academy: tiếng Anh, IELTS, Business English, English for Kids, phát triển chuyên môn và kỹ năng sống.",
                     "Teacher Dong Academy: English, IELTS, Business English, English for Kids, professional development and life skills.",
                     "Teacher Dong Academy：英语、IELTS、商务英语、少儿英语、专业成长与生活技能。",
                     "Teacher Dong Academy：英語、IELTS、ビジネス英語、子ども英語、専門スキルとライフスキル。"],
  "skip":           ["Bỏ qua điều hướng", "Skip to content", "跳到主要内容", "メインコンテンツへ移動"],
  "lang.label":     ["Ngôn ngữ", "Language", "语言", "言語"],
  "footer.top":     ["Về đầu trang", "Back to top", "返回顶部", "ページ先頭へ"],
  "badge.sample":   ["Mẫu", "Sample", "样例", "サンプル"],
  "badge.data":     ["Dữ liệu mẫu", "Sample data", "样例数据", "サンプルデータ"],
  "badge.todo":     ["Cần bổ sung", "To be added", "待补充", "要追加"],

  /* ---- Header ---- */
  "brand.aria":     ["Teacher Dong Academy - về đầu trang", "Teacher Dong Academy – back to top", "Teacher Dong Academy – 返回顶部", "Teacher Dong Academy – ページ先頭へ"],
  "nav.aria":       ["Điều hướng chính", "Main navigation", "主导航", "メインナビゲーション"],
  "nav.categories": ["Chương trình", "Programs", "课程方向", "プログラム"],
  "nav.courses":    ["Khóa học", "Courses", "课程", "コース"],
  "nav.resources":  ["Tài nguyên", "Resources", "学习资源", "学習リソース"],
  "nav.about":      ["Về Teacher Dong", "About", "关于老师", "講師紹介"],
  "nav.blog":       ["Blog", "Blog", "博客", "ブログ"],
  "nav.contact":    ["Liên hệ tư vấn", "Get advice", "咨询联系", "無料相談"],
  "nav.menuOpen":   ["Mở menu", "Open menu", "打开菜单", "メニューを開く"],
  "nav.menuClose":  ["Đóng menu", "Close menu", "关闭菜单", "メニューを閉じる"],

  /* ---- Hero ---- */
  "hero.title":     ["Học tiếng Anh để <span class=\"hl\">tự tin</span> bước xa hơn",
                     "Learn English to go <span class=\"hl\">further</span> with confidence",
                     "学好英语，<span class=\"hl\">自信</span>走得更远",
                     "英語を学んで、<span class=\"hl\">自信</span>を持ってさらに遠くへ"],
  "hero.lead":      ["Teacher Dong Academy đồng hành cùng học sinh, sinh viên và người đi làm trên hành trình học ngoại ngữ, phát triển chuyên môn và kỹ năng sống.",
                     "Teacher Dong Academy supports school students, university learners and working professionals on their journey in language learning, professional development and life skills.",
                     "Teacher Dong Academy 陪伴中小学生、大学生和职场人士，在语言学习、专业成长与生活技能的道路上不断前行。",
                     "Teacher Dong Academy は、学生から社会人まで、語学学習・専門スキルの向上・ライフスキルの習得を支えます。"],
  "hero.cta1":      ["Khám phá khóa học", "Explore courses", "探索课程", "コースを見る"],
  "hero.cta2":      ["Nhận tư vấn lộ trình", "Get a learning plan", "获取学习规划", "学習プランを相談"],
  "hero.tags.aria": ["Các chương trình", "Programs", "课程方向", "プログラム"],
  "skill.listening": ["Listening", "Listening", "听力", "リスニング"],
  "skill.speaking":  ["Speaking", "Speaking", "口语", "スピーキング"],
  "skill.reading":   ["Reading", "Reading", "阅读", "リーディング"],
  "skill.writing":   ["Writing", "Writing", "写作", "ライティング"],
  "hero.photoAria": ["Khung ảnh giữ chỗ cho ảnh lớp học hoặc ảnh Teacher Dong",
                     "Photo placeholder for a classroom or Teacher Dong photo",
                     "课堂或 Teacher Dong 照片的占位框",
                     "教室または Teacher Dong の写真用プレースホルダー"],
  "hero.photoNote": ["Khung ảnh giữ chỗ — thay bằng ảnh lớp học / Teacher Dong thật.",
                     "Photo placeholder — replace with a real classroom / Teacher Dong photo.",
                     "照片占位 — 请替换为真实的课堂或 Teacher Dong 照片。",
                     "写真プレースホルダー — 実際の教室や Teacher Dong の写真に差し替えてください。"],

  /* ---- Pillars ---- */
  "pillars.aria":   ["Bốn giá trị của Teacher Dong Academy", "The four values of Teacher Dong Academy", "Teacher Dong Academy 的四大理念", "Teacher Dong Academy の4つの価値観"],
  "p.learn":        ["Học có phương pháp, có mục tiêu.", "Learn with method and clear goals.", "有方法、有目标地学习。", "方法と目標を持って学ぶ。"],
  "p.grow":         ["Phát triển năng lực và sự tự tin.", "Build skills and confidence.", "提升能力，增强自信。", "力と自信を育てる。"],
  "p.share":        ["Chia sẻ kiến thức và kinh nghiệm.", "Share knowledge and experience.", "分享知识与经验。", "知識と経験を分かち合う。"],
  "p.inspire":      ["Truyền cảm hứng học tập lâu dài.", "Inspire lifelong learning.", "激发长久的学习热情。", "学び続ける意欲を育む。"],

  /* ---- Categories ---- */
  "cat.eyebrow":    ["Chương trình học", "Programs", "课程方向", "プログラム"],
  "cat.title":      ["Chọn lĩnh vực phù hợp với bạn", "Choose the path that fits you", "选择适合你的方向", "あなたに合った分野を選ぼう"],
  "cat.lead":       ["Sáu nhóm chương trình cho nhiều độ tuổi và mục tiêu. Chọn một nhóm để xem các khóa học liên quan.",
                     "Six program areas for different ages and goals. Pick one to see related courses.",
                     "六大课程方向，适合不同年龄与目标。点击任一方向即可查看相关课程。",
                     "年齢や目標に合わせた6つのプログラム。気になる分野を選ぶと関連コースが表示されます。"],
  "cat.view":       ["Xem khóa học", "View courses", "查看课程", "コースを見る"],

  /* ---- 5 Trụ Cột Đào Tạo Trọng Tâm (Chuẩn theo hồ sơ thiết kế) ---- */
  "cat.english_proficiency.title": ["1. English Proficiency Course", "1. English Proficiency Course", "1. 英语能力提升课程", "1. 英語運用能力コース"],
  "cat.english_proficiency.desc":  ["Nền tảng đào tạo tiếng Anh học thuật, giao tiếp công sở và rèn luyện kỹ năng thực chiến toàn diện mọi lứa tuổi.",
                                    "Comprehensive language training from workplace communication to IELTS preparation.",
                                    "全面的英语能力提升，涵盖商务、雅思、日常与少儿英语。",
                                    "ビジネス、IELTS、日常会話、子ども英語まで総合的な語学力養成。"],
  
  "cat.professional_dev.title":    ["2. Professional Development", "2. Professional Development", "2. 教师专业发展与赋能", "2. 専門スキル開発"],
  "cat.professional_dev.desc":     ["Nâng cao chuyên môn sư phạm, phương pháp giảng dạy hiện đại, ứng dụng Trí tuệ nhân tạo (AI) và năng lực quản lý lãnh đạo.",
                                    "Enhance teaching pedagogy, AI integration in education, leadership and career guidance.",
                                    "提升教学方法、AI教育应用、领导力与职业发展规划。",
                                    "指導法、教育AI活用、リーダーシップ、キャリアガイダンスの向上。"],
  
  "cat.life_skills.title":         ["3. Life Skills and Personal Growth", "3. Life Skills and Personal Growth", "3. 生活技能与个人成长", "3. ライフスキルと自己成長"],
  "cat.life_skills.desc":          ["Trang bị bộ kỹ năng thế kỷ 21: tư duy phản biện sắc bén, khả năng làm chủ sân khấu và quản trị áp lực hiệu quả.",
                                    "Master critical thinking, public speaking, and time management under pressure.",
                                    "掌握批判性思维、公众演讲表达与高压下的时间管理。",
                                    "批判的思考力、パブリックスピーキング、タイムマネジメントの習得。"],
  
  "cat.life_experiences.title":    ["4. Life Experiences and Inspiration", "4. Life Experiences and Inspiration", "4. 人生阅历与灵感启发", "4. 人生の経験とインスピレーション"],
  "cat.life_experiences.desc":     ["Những câu chuyện thực tế, bài học xương máu và chuỗi chia sẻ truyền cảm hứng từ hành trình giảng dạy, sinh sống tại nhiều quốc gia.",
                                    "Inspiring talks, teaching abroad lessons, living overseas, and personal reflections.",
                                    "励志演讲、海外教学经验、跨国生活与深度个人感悟。",
                                    "刺激的な対談、海外指導経験、海外生活、個人の深い思索。"],
  
  "cat.travel_culture.title":      ["5. Travel and Culture Blog", "5. Travel and Culture Blog", "5. 旅游与文化专栏", "5. 旅行と文化ブログ"],
  "cat.travel_culture.desc":       ["Không gian khám phá vẻ đẹp văn hóa, phong tục tập quán, con người các quốc gia Châu Á và sự kỳ diệu của ngôn ngữ.",
                                    "Explore cultural awareness, discovering Asia, and the beauty of language and people.",
                                    "探索跨文化认知、发现亚洲之美与语言人文故事。",
                                    "多文化理解、アジア探訪、言葉と人々の魅力の探求。"],

  /* Khóa học chi tiết theo từng trụ cột */
  "course.c_business.title":       ["Business English for Communication", "Business English for Communication", "商务英语沟通", "ビジネス英語コミュニケーション"],
  "course.c_business.desc":        ["Tiếng Anh thương mại cho người đi làm: viết email, họp đối tác, đàm phán và thuyết trình quốc tế.", "English for workplace communication, meetings and emails.", "职场与商务沟通实用英语。", "職場の英語、会議・メールの実践。"],
  
  "course.c_ielts.title":          ["IELTS – Test Preparation", "IELTS – Test Preparation", "IELTS 备考冲刺", "IELTS 対策"],
  "course.c_ielts.desc":           ["Lộ trình luyện thi IELTS Academic Band 6.5 - 7.5+ với phòng chấm Writing AI và Speaking Studio ghim nhận xét.", "Structured IELTS Academic path with AI Writing & Speaking Studio.", "雅思全真模考与名师精批。", "IELTS 目標バンド別対策。"],

  "course.c_conversation.title":   ["Conversational English", "Conversational English", "日常英语口语交流", "日常英会話"],
  "course.c_conversation.desc":    ["Rèn luyện phản xạ nghe nói tự nhiên, phát âm chuẩn IPA và tự tin giao tiếp đời sống hàng ngày.", "Daily speaking fluency and natural pronunciation.", "自然流畅的日常口语表达。", "自然な発音と流暢な英会話。"],

  "course.c_kids.title":           ["English for Early Childhood", "English for Early Childhood", "幼儿与少儿启蒙英语", "子ども英語"],
  "course.c_kids.desc":            ["Phương pháp tiếp cận tiếng Anh tự nhiên cho trẻ 4-10 tuổi qua trò chơi và truyện tranh sinh động.", "Fun activities and storytelling for young learners.", "生动有趣的游戏式少儿英语。", "ゲームや物語で楽しく学ぶ英語。"],

  "course.c_ai_edu.title":         ["AI Integration in Education", "AI Integration in Education", "AI 赋能教学实战", "教育における AI 活用"],
  "course.c_ai_edu.desc":          ["Ứng dụng AI (ChatGPT, Claude, Prompt Engineering) trong soạn giáo án và tạo bài giảng tự động.", "AI tools and prompts for modern educators.", "利用 AI 工具提高教学效能。", "AI ツールを用いた授業設計。"],

  "course.c_career.title":         ["Career Guidance", "Career Guidance", "职业规划与求职指导", "キャリアガイダンス"],
  "course.c_career.desc":          ["Định hướng nghề nghiệp quốc tế, kỹ năng viết CV và phỏng vấn trường quốc tế.", "International career roadmap and resume coaching.", "国际化职业路线与面试技巧。", "グローバルキャリア支援。"],

  "course.c_classroom.title":      ["Classroom Management", "Classroom Management", "课堂组织与管理艺术", "学級経営と授業運営"],
  "course.c_classroom.desc":       ["Nghệ thuật tổ chức, điều phối lớp học thông minh và duy trì kỷ luật tích cực.", "Positive discipline and engaging classroom strategies.", "积极纪律与生动课堂策略。", "学級運営と生徒の意欲向上。"],

  "course.c_leadership.title":     ["Leadership and Management", "Leadership and Management", "教育领导力与团队管理", "リーダーシップと管理"],
  "course.c_leadership.desc":      ["Kỹ năng lãnh đạo đội ngũ sư phạm và điều phối dự án giáo dục chuyên nghiệp.", "Leadership and team management in education.", "教育团队领导力与项目协调。", "教育リーダーシップ研修。"],

  "course.c_research.title":       ["Research Mentorship", "Research Mentorship", "教育科研与学术论文辅导", "研究指導・メンターシップ"],
  "course.c_research.desc":        ["Hướng dẫn phương pháp nghiên cứu khoa học giáo dục và viết luận văn học thuật.", "Mentorship for academic research and paper publishing.", "学术研究方法与论文写作指导。", "学術論文執筆と研究指導。"],

  "course.c_teaching.title":       ["Teaching Methodology", "Teaching Methodology", "现代英语教学法", "英語教授法"],
  "course.c_teaching.desc":        ["Phương pháp giảng dạy hiện đại: CLT, Task-based Learning, Flipped Classroom.", "Modern communicative and task-based teaching practices.", "交际教学法与任务驱动型课堂。", "コミュニカティブ指導法。"],

  "course.c_critical.title":       ["Critical Thinking and Problem Solving", "Critical Thinking and Problem Solving", "批判性思维与问题解决", "批判的思考と問題解決"],
  "course.c_critical.desc":        ["Rèn luyện tư duy phản biện, nhận diện bẫy ngụy biện và giải quyết vấn đề đa chiều.", "Analytical thinking and structured problem solving.", "培养逻辑思辨与复杂问题攻坚能力。", "論理的思考と課題解決力。"],

  "course.c_public_speaking.title":["Public Speaking and Presentation Skills", "Public Speaking and Presentation Skills", "公众演讲与表达艺术", "パブリックスピーキング"],
  "course.c_public_speaking.desc": ["Tự tin nói trước công chúng, nghệ thuật kể chuyện (Storytelling) và ngôn ngữ cơ thể.", "Stage presence, storytelling, and impactful delivery.", "舞台气场、故事力与肢体语言。", "人を惹きつけるスピーチ力。"],

  "course.c_time_management.title":["Time Management and Working Under Pressure", "Time Management and Working Under Pressure", "时间管理与抗压工作法", "タイムマネジメントと抗圧力"],
  "course.c_time_management.desc": ["Làm chủ thời gian, quản trị stress và duy trì phong độ làm việc đỉnh cao.", "Productivity habits and resilience under stress.", "番茄工作法、抗压管理与高效产出。", "ストレス下での高い生産性維持。"],

  "course.c_talks.title":          ["Inspirational Talks", "Inspirational Talks", "主题励志演讲与对话", "インスピレーショントーク"],
  "course.c_talks.desc":           ["Chuỗi tọa đàm thắp sáng khát vọng học hỏi và vượt qua rào cản tự ti ngôn ngữ.", "Keynote talks igniting passion for lifelong learning.", "点燃终身学习激情的系列主题对话。", "学びの情熱を呼び覚ます対話。"],

  "course.c_teaching_abroad.title":["Lessons from Teaching Abroad", "Lessons from Teaching Abroad", "跨国支教与海外任教手记", "海外指導のレッスン"],
  "course.c_teaching_abroad.desc": ["Kinh nghiệm thực tiễn đúc rút từ nhiều năm giảng dạy tại các môi trường quốc tế.", "Field insights from international classroom teaching.", "国际化课堂一线教学心得。", "国際教育現場からの生きた教訓。"],

  "course.c_living_overseas.title":["Living and Working Overseas", "Living and Working Overseas", "海外生活与职场融入指南", "海外生活と就労"],
  "course.c_living_overseas.desc": ["Cẩm nang hòa nhập văn hóa, thích nghi môi trường sống và làm việc đa quốc gia.", "Practical guide to expat life and multicultural adaptation.", "跨文化适应、跨国求职与海外生存指南。", "異文化適応とグローバル就労。"],

  "course.c_reflections.title":    ["Personal Stories and Reflections", "Personal Stories and Reflections", "人生感悟与成长随笔", "個人の思索とストーリー"],
  "course.c_reflections.desc":     ["Tản văn và những chiêm nghiệm sâu sắc của Teacher Dong về hành trình trưởng thành.", "Personal essays and pedagogical philosophy from Teacher Dong.", "Teacher Dong 的教育初心与生命思考。", "Teacher Dong の教育哲学と随想。"],

  "course.c_culture_aware.title":  ["Cultural Awareness", "Cultural Awareness", "跨文化意识与国际礼仪", "多文化理解"],
  "course.c_culture_aware.desc":   ["Nhận thức văn hóa đa quốc gia và kỹ năng ứng xử tinh tế trong thế giới phẳng.", "Intercultural competence and international etiquette.", "提升全球视野与跨文化交往敏感度。", "グローバルな異文化対応力。"],

  "course.c_asia.title":           ["Discovering Asia", "Discovering Asia", "探访亚洲：风景与风物", "アジア探訪"],
  "course.c_asia.desc":            ["Hành trình khám phá vẻ đẹp danh thắng, ẩm thực và phong tục các nước Châu Á.", "Travel guides, heritage and cuisines across Asia.", "沉浸式探索亚洲人文美景与美食文化。", "アジアの自然と文化をめぐる旅。"],

  "course.c_language_people.title":["Language and People", "Language and People", "语言演变与人文百态", "言葉と人々"],
  "course.c_language_people.desc": ["Sự kỳ diệu của ngôn ngữ bản xứ và những câu chuyện con người bình dị.", "Fascinating linguistic stories and inspiring individuals.", "探寻在地语言趣味与鲜活的人物故事。", "言葉の魅力と心温まる人間模様。"],


  /* ---- Courses ---- */
  "courses.eyebrow": ["Khóa học", "Courses", "课程", "コース"],
  "courses.title":   ["Khóa học nổi bật", "Featured courses", "精选课程", "おすすめコース"],
  "courses.note":    ["Tên khóa, mô tả, thời lượng và học phí cần được thay bằng thông tin chính thức.",
                      "Course names, descriptions, duration and fees must be replaced with official information.",
                      "课程名称、介绍、时长和学费需替换为正式信息。",
                      "コース名・説明・期間・料金は正式な情報に置き換えてください。"],
  "filter.all":      ["Tất cả", "All", "全部", "すべて"],
  "filter.aria":     ["Lọc khóa học theo chương trình", "Filter courses by program", "按课程方向筛选", "プログラムでコースを絞り込む"],
  "course.detail":   ["Xem chi tiết", "View details", "查看详情", "詳細を見る"],
  "course.duration": ["[Cập nhật thời lượng]", "[Add duration]", "[待补充时长]", "[期間を入力]"],
  "course.format":   ["[Cập nhật hình thức]", "[Add format]", "[待补充授课形式]", "[形式を入力]"],
  "course.empty":    ["Chưa có khóa học trong nhóm này.", "No courses in this group yet.", "该方向暂无课程。", "このグループにはまだコースがありません。"],
  "level.all":       ["Mọi trình độ", "All levels", "各个水平", "全レベル"],
  "level.goal":      ["Theo mục tiêu", "Goal-based", "按目标定制", "目標別"],
  "level.work":      ["Người đi làm", "Working professionals", "职场人士", "社会人"],
  "level.kids":      ["Thiếu nhi", "Children", "少儿", "子ども"],
  "level.student":   ["Sinh viên & đi làm", "Students & professionals", "大学生与职场人士", "学生・社会人"],
  "level.everyone":  ["Mọi lứa tuổi", "All ages", "全年龄", "全年齢"],

  "course.c1.title": ["[Mẫu] Tiếng Anh giao tiếp nền tảng", "[Sample] Foundation Everyday English", "[样例] 英语口语基础", "[サンプル] 基礎英会話"],
  "course.c1.desc":  ["Khóa học giúp học viên làm quen và sử dụng tiếng Anh trong tình huống hằng ngày.",
                      "Helps learners get comfortable using English in everyday situations.",
                      "帮助学员熟悉并在日常场景中运用英语。",
                      "日常のさまざまな場面で英語を使うことに慣れていきます。"],
  "course.c2.title": ["[Mẫu] IELTS Foundation", "[Sample] IELTS Foundation", "[样例] IELTS 基础班", "[サンプル] IELTS 基礎コース"],
  "course.c2.desc":  ["Làm quen cấu trúc bài thi và xây dựng kỹ năng nền tảng cho IELTS.",
                      "Get to know the exam format and build the core skills for IELTS.",
                      "了解考试结构，打好 IELTS 所需的基础技能。",
                      "試験形式に慣れ、IELTS に必要な基礎力を身につけます。"],
  "course.c3.title": ["[Mẫu] English for the Workplace", "[Sample] English for the Workplace", "[样例] 职场英语", "[サンプル] 職場の英語"],
  "course.c3.desc":  ["Thực hành email, họp, thuyết trình và giao tiếp trong môi trường công việc.",
                      "Practice emails, meetings, presentations and everyday workplace communication.",
                      "练习邮件、会议、演示与日常职场沟通。",
                      "メール、会議、プレゼン、日常の職場コミュニケーションを実践します。"],
  "course.c4.title": ["[Mẫu] English for Kids", "[Sample] English for Kids", "[样例] 少儿英语", "[サンプル] 子ども英語"],
  "course.c4.desc":  ["Hoạt động học tập sinh động giúp trẻ yêu thích và tự tin với tiếng Anh.",
                      "Lively activities that help children enjoy English and speak with confidence.",
                      "生动有趣的活动，帮助孩子爱上英语并自信表达。",
                      "楽しい活動で、子どもが英語を好きになり自信を持てるようにします。"],
  "course.c5.title": ["[Mẫu] Professional Communication", "[Sample] Professional Communication", "[样例] 职业沟通", "[サンプル] プロフェッショナル・コミュニケーション"],
  "course.c5.desc":  ["Phát triển kỹ năng giao tiếp, trình bày và làm việc nhóm chuyên nghiệp.",
                      "Develop communication, presentation and teamwork skills for the workplace.",
                      "培养职场所需的沟通、表达与团队协作能力。",
                      "職場で求められるコミュニケーション・発表・チームワークの力を伸ばします。"],
  "course.c6.title": ["[Mẫu] Life Skills Workshop", "[Sample] Life Skills Workshop", "[样例] 生活技能工作坊", "[サンプル] ライフスキル・ワークショップ"],
  "course.c6.desc":  ["Chuỗi hoạt động về tư duy tích cực, quản lý thời gian và đặt mục tiêu.",
                      "A series of activities on positive thinking, time management and goal setting.",
                      "围绕积极思维、时间管理与目标设定的系列活动。",
                      "前向きな思考、時間管理、目標設定をテーマにした一連の活動です。"],

  /* ---- Resources ---- */
  "res.eyebrow":    ["Learning Resources", "Learning Resources", "Learning Resources", "Learning Resources"],
  "res.title":      ["Tài nguyên học tập", "Learning resources", "学习资源", "学習リソース"],
  "res.lead":       ["Không gian tập hợp tài liệu, bài luyện và công cụ hỗ trợ tự học. Nội dung bên dưới là khung mẫu để mở rộng thành thư viện/LMS.",
                     "A space for materials, practice and self-study tools. The items below are a sample framework that can grow into a library or LMS.",
                     "汇集资料、练习与自学工具的空间。以下内容为示例框架，可扩展为资料库或 LMS。",
                     "教材・練習問題・自習ツールをまとめるスペースです。以下はサンプルの枠組みで、ライブラリや LMS へ拡張できます。"],
  "res.r1.title":   ["Thư viện tài liệu", "Material library", "资料库", "教材ライブラリ"],
  "res.r1.desc":    ["Tài liệu học tập theo chủ đề và trình độ.", "Study materials by topic and level.", "按主题和水平分类的学习资料。", "トピックとレベル別の学習教材。"],
  "res.r2.title":   ["Luyện nghe", "Listening practice", "听力练习", "リスニング練習"],
  "res.r2.desc":    ["Bài nghe kèm gợi ý luyện tập.", "Audio lessons with practice tips.", "听力材料及练习建议。", "練習のヒント付きリスニング教材。"],
  "res.r3.title":   ["Bài tập & kiểm tra", "Exercises & quizzes", "练习与测验", "練習問題とテスト"],
  "res.r3.desc":    ["Bài luyện tập và đề kiểm tra nhanh.", "Practice exercises and quick tests.", "练习题与快速测验。", "練習問題とクイックテスト。"],
  "res.r4.title":   ["Từ vựng & ngữ pháp", "Vocabulary & grammar", "词汇与语法", "語彙と文法"],
  "res.r4.desc":    ["Tổng hợp từ vựng, cấu trúc câu và mẹo ghi nhớ.", "Vocabulary, sentence patterns and memory tips.", "词汇、句型与记忆技巧汇总。", "語彙・文型・記憶のコツをまとめて。"],

  /* ---- About ---- */
  "about.eyebrow":  ["Về Teacher Dong", "About Teacher Dong", "关于 Teacher Dong", "Teacher Dong について"],
  "about.title":    ["Người đồng hành trên hành trình học tập của bạn", "A companion on your learning journey", "陪你走过学习之路的伙伴", "あなたの学びの旅に寄り添うパートナー"],
  "about.lead":     ["Teacher Dong Academy được xây dựng với tinh thần Learn. Grow. Share. Inspire. — học để trưởng thành, chia sẻ để lan tỏa cảm hứng.",
                     "Teacher Dong Academy is built on the spirit of Learn. Grow. Share. Inspire. — learn to grow, share to inspire.",
                     "Teacher Dong Academy 秉持 Learn. Grow. Share. Inspire. 的精神——学以成长，分享启迪。",
                     "Teacher Dong Academy は Learn. Grow. Share. Inspire. の精神で作られています。学んで成長し、分かち合って刺激を広げます。"],
  "about.todo":     ["Giới thiệu cá nhân, quá trình giảng dạy, bằng cấp/chứng chỉ và phương pháp sư phạm sẽ được điền bằng thông tin chính thức do Teacher Dong cung cấp. Trang này không tự tạo số liệu hay thành tích nào.",
                     "Personal introduction, teaching background, degrees/certificates and teaching methods will be filled in with official information provided by Teacher Dong. This page does not invent any figures or achievements.",
                     "个人简介、教学经历、学历/证书及教学方法将由 Teacher Dong 提供正式信息后填写。本页不会自行编造任何数据或成绩。",
                     "自己紹介、指導歴、学位・資格、指導方法は、Teacher Dong から提供される正式な情報で記入します。このページでは数値や実績を一切作成していません。"],
  "about.p1":       ["Mục tiêu học tập rõ ràng cho từng người học", "Clear learning goals for every learner", "为每位学员设定清晰的学习目标", "学習者ごとに明確な学習目標を設定"],
  "about.p2":       ["Phù hợp học sinh, sinh viên và người đi làm", "Suitable for students, university learners and professionals", "适合中小学生、大学生和职场人士", "学生から社会人まで対応"],
  "about.p3":       ["Kết hợp ngôn ngữ với kỹ năng sống và phát triển bản thân", "Combining language with life skills and personal growth", "语言学习与生活技能、自我成长相结合", "語学とライフスキル・自己成長を組み合わせる"],
  "about.cta":      ["Trò chuyện cùng Teacher Dong", "Talk with Teacher Dong", "与 Teacher Dong 聊聊", "Teacher Dong に相談する"],
  "about.photoAria": ["Khung ảnh giữ chỗ cho chân dung Teacher Dong", "Photo placeholder for Teacher Dong's portrait", "Teacher Dong 肖像照片的占位框", "Teacher Dong のポートレート用プレースホルダー"],
  "about.photoNote": ["Ảnh giữ chỗ — thay bằng chân dung Teacher Dong.", "Placeholder — replace with Teacher Dong's portrait.", "占位图 — 请替换为 Teacher Dong 的肖像。", "プレースホルダー — Teacher Dong のポートレートに差し替えてください。"],

  /* ---- Blog ---- */
  "blog.eyebrow":   ["Blog & Inspiration", "Blog & Inspiration", "Blog & Inspiration", "Blog & Inspiration"],
  "blog.title":     ["Chia sẻ & cảm hứng", "Insights & inspiration", "分享与灵感", "共有とインスピレーション"],
  "blog.note":      ["Tiêu đề bài viết là gợi ý chủ đề, chưa phải nội dung chính thức.",
                     "Post titles are topic suggestions, not final content.",
                     "文章标题仅为主题建议，并非正式内容。",
                     "記事タイトルはトピック案であり、正式な内容ではありません。"],
  "blog.more":      ["Đọc thêm", "Read more", "阅读更多", "続きを読む"],
  "post.b1.tag":    ["Phương pháp học", "Study method", "学习方法", "学習法"],
  "post.b1.title":  ["[Mẫu] Xây thói quen học tiếng Anh mỗi ngày", "[Sample] Building a daily English habit", "[样例] 养成每天学英语的习惯", "[サンプル] 毎日の英語学習を習慣にするには"],
  "post.b1.excerpt": ["Gợi ý chủ đề: cách duy trì việc học đều đặn mà không bị quá tải.",
                      "Topic idea: how to study consistently without feeling overwhelmed.",
                      "主题建议：如何坚持规律学习而不感到压力过大。",
                      "トピック案：無理なく学習を続けるための方法。"],
  "post.b2.tag":    ["IELTS", "IELTS", "IELTS", "IELTS"],
  "post.b2.title":  ["[Mẫu] Làm quen với cấu trúc bài thi IELTS", "[Sample] Getting to know the IELTS exam structure", "[样例] 了解 IELTS 考试结构", "[サンプル] IELTS の試験構成を知ろう"],
  "post.b2.excerpt": ["Gợi ý chủ đề: tổng quan bốn kỹ năng và cách lên kế hoạch ôn tập.",
                      "Topic idea: an overview of the four skills and how to plan your revision.",
                      "主题建议：四项技能概览及备考规划方法。",
                      "トピック案：4技能の概要と学習計画の立て方。"],
  "post.b3.tag":    ["Cảm hứng", "Inspiration", "灵感", "インスピレーション"],
  "post.b3.title":  ["[Mẫu] Học để trưởng thành, chia sẻ để lan tỏa", "[Sample] Learn to grow, share to inspire", "[样例] 学以成长，分享启迪", "[サンプル] 学んで成長し、分かち合って刺激を広げる"],
  "post.b3.excerpt": ["Gợi ý chủ đề: câu chuyện và thông điệp truyền cảm hứng học tập.",
                      "Topic idea: stories and messages that inspire a love of learning.",
                      "主题建议：激发学习热情的故事与寄语。",
                      "トピック案：学ぶ意欲を高める物語やメッセージ。"],

  /* ---- CTA & form ---- */
  "cta.eyebrow":    ["Bắt đầu hôm nay", "Start today", "今天就开始", "今日から始めよう"],
  "cta.title":      ["Sẵn sàng bắt đầu hành trình của bạn?", "Ready to begin your journey?", "准备好开启你的学习之旅了吗？", "学びの旅を始める準備はできましたか？"],
  "cta.text":       ["Để lại thông tin, chúng tôi sẽ tư vấn chương trình phù hợp với mục tiêu và trình độ hiện tại của bạn.",
                     "Leave your details and we'll suggest the program that fits your goals and current level.",
                     "留下您的信息，我们将根据您的目标和当前水平推荐合适的课程。",
                     "ご連絡先をお知らせいただければ、目標と現在のレベルに合ったプログラムをご提案します。"],
  "form.name":      ["Họ và tên", "Full name", "姓名", "お名前"],
  "form.email":     ["Email", "Email", "邮箱", "メールアドレス"],
  "form.interest":  ["Chương trình quan tâm", "Program of interest", "感兴趣的课程", "興味のあるプログラム"],
  "form.none":      ["Chưa xác định", "Not sure yet", "暂未确定", "未定"],
  "form.msg":       ["Lời nhắn", "Message", "留言", "メッセージ"],
  "form.submit":    ["Gửi qua email", "Send by email", "通过邮件发送", "メールで送信"],
  "form.note":      ["Nút này mở ứng dụng email của bạn với nội dung đã soạn sẵn. Địa chỉ nhận hiện là địa chỉ mẫu — cập nhật trong <code>js/data.js</code> (<code>SITE.contactEmail</code>).",
                     "This button opens your email app with the message pre-filled. The recipient address is a sample — update it in <code>js/data.js</code> (<code>SITE.contactEmail</code>).",
                     "此按钮会打开您的邮件应用并预填内容。收件地址目前为示例，请在 <code>js/data.js</code>（<code>SITE.contactEmail</code>）中更新。",
                     "このボタンはメールアプリを開き、内容を入力済みの状態にします。宛先はサンプルのアドレスです。<code>js/data.js</code>（<code>SITE.contactEmail</code>）で更新してください。"],
  "form.errName":   ["Vui lòng nhập họ và tên.", "Please enter your name.", "请输入姓名。", "お名前を入力してください。"],
  "form.errEmail":  ["Vui lòng nhập email hợp lệ.", "Please enter a valid email.", "请输入有效的邮箱。", "有効なメールアドレスを入力してください。"],
  "mail.subject":   ["Đăng ký tư vấn - Teacher Dong Academy", "Consultation request – Teacher Dong Academy", "咨询申请 – Teacher Dong Academy", "相談のお申し込み – Teacher Dong Academy"],

  /* ---- Footer ---- */
  "footer.explore": ["Khám phá", "Explore", "探索", "探す"],
  "footer.contact": ["Liên hệ", "Contact", "联系方式", "お問い合わせ"],
  "footer.note":    ["Địa chỉ, số điện thoại và mạng xã hội sẽ được cập nhật khi có thông tin chính thức.",
                     "Address, phone number and social links will be added once official information is available.",
                     "地址、电话和社交媒体账号将在获得正式信息后更新。",
                     "住所・電話番号・SNS は正式な情報が確定次第、追加します。"],
  "footer.rights":  ["Bảo lưu mọi quyền.", "All rights reserved.", "版权所有。", "無断転載を禁じます。"],

  /* ---- Dialog ---- */
  "dlg.close":      ["Đóng", "Close", "关闭", "閉じる"],
  "dlg.post":       ["Bài viết", "Post", "文章", "記事"],
  "dlg.cta":        ["Hỏi tư vấn", "Ask for advice", "咨询", "相談する"],
  "dlg.sample":     ["Nội dung chi tiết sẽ được thay bằng thông tin chính thức khi sẵn sàng.",
                     "Detailed content will be replaced with official information when ready.",
                     "详细内容将在准备好后替换为正式信息。",
                     "詳細な内容は準備ができ次第、正式な情報に置き換えられます。"]
};

const I18N = (() => {
  const ORDER = { vi: 0, en: 1, zh: 2, ja: 3 };
  const HTML_LANG = { vi: "vi", en: "en", zh: "zh-Hans", ja: "ja" };
  const STORE_KEY = "tda-lang";
  const listeners = [];
  let lang = "vi";

  const t = (key) => {
    const row = T[key];
    if (!row) return key;
    return row[ORDER[lang]] || row[0];
  };

  function apply() {
    document.documentElement.lang = HTML_LANG[lang];
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      el.dataset.i18nAttr.split(";").forEach((pair) => {
        const [attr, key] = pair.split(":").map((s) => s.trim());
        if (attr && key) el.setAttribute(attr, t(key));
      });
    });
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", t("meta.desc"));
    const sel = document.getElementById("lang-select");
    if (sel) sel.value = lang;
  }

  function set(next) {
    if (!(next in ORDER)) return;
    lang = next;
    try { localStorage.setItem(STORE_KEY, next); } catch (e) { /* bỏ qua nếu bị chặn */ }
    apply();
    listeners.forEach((fn) => fn(lang));
  }

  function init() {
    let saved = null;
    try { saved = localStorage.getItem(STORE_KEY); } catch (e) { /* bỏ qua */ }
    const fromUrl = new URLSearchParams(window.location.search).get("lang");
    const pick = [fromUrl, saved].find((l) => l && l in ORDER);
    if (pick) lang = pick;
    apply();
  }

  return { t, set, init, apply, get: () => lang, onChange: (fn) => listeners.push(fn) };
})();
