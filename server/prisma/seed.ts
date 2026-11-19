import {
  PrismaClient,
  Role,
  CourseCategory,
  QuestionType,
  SkillType,
  NotificationType,
  BlogStatus,
  MaterialType,
  WritingTaskType,
  WritingSubmissionStatus,
  SubmissionStatus,
  RoomStatus,
  AttendanceStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive production-grade seed for Teacher Dong Academy...');

  // Ensure private storage directory for materials exists
  const storageDir = path.join(process.cwd(), 'private_storage', 'materials');
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  const passwordHashAdmin = await bcrypt.hash('Admin@123456', 10);
  const passwordHashStudent = await bcrypt.hash('Student@123456', 10);

  // ==========================================
  // 1. SEED USERS (Admin & Diverse Students)
  // ==========================================
  console.log('👤 Seeding Users (Admin & Students)...');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@englishweb.com' },
    update: {
      fullName: 'Teacher & Admin Master (Thầy Đông)',
      phone: '0987654321',
      role: Role.ADMIN,
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
    create: {
      email: 'admin@englishweb.com',
      passwordHash: passwordHashAdmin,
      fullName: 'Teacher & Admin Master (Thầy Đông)',
      phone: '0987654321',
      role: Role.ADMIN,
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
  });

  const studentsData = [
    {
      email: 'student@englishweb.com',
      fullName: 'Nguyễn Thị Mai',
      phone: '0912345678',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    },
    {
      email: 'bao.tran@englishweb.com',
      fullName: 'Trần Văn Bảo',
      phone: '0988776655',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
    {
      email: 'nam.le@englishweb.com',
      fullName: 'Lê Hoàng Nam',
      phone: '0901234567',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    },
    {
      email: 'anh.pham@englishweb.com',
      fullName: 'Phạm Minh Anh',
      phone: '0933445566',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
    },
    {
      email: 'ha.vu@englishweb.com',
      fullName: 'Vũ Thu Hà',
      phone: '0977889900',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    },
    {
      email: 'huy.dang@englishweb.com',
      fullName: 'Đặng Quốc Huy',
      phone: '0909112233',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    },
  ];

  const students: any[] = [];
  for (const s of studentsData) {
    const createdStudent = await prisma.user.upsert({
      where: { email: s.email },
      update: {
        fullName: s.fullName,
        phone: s.phone,
        avatarUrl: s.avatarUrl,
        isActive: true,
      },
      create: {
        email: s.email,
        passwordHash: passwordHashStudent,
        fullName: s.fullName,
        phone: s.phone,
        role: Role.STUDENT,
        isActive: true,
        avatarUrl: s.avatarUrl,
      },
    });
    students.push(createdStudent);
  }
  const primaryStudent = students[0]; // Nguyễn Thị Mai

  // ==========================================
  // 2. SEED OFFICIAL CAMBRIDGE IELTS COURSE
  // ==========================================
  console.log('📚 Seeding Official Cambridge IELTS Course...');

  const course = await prisma.course.upsert({
    where: { slug: 'ielts-masterclass-band-7' },
    update: {
      title: 'Cambridge IELTS 18 & 19 Academic: Masterclass Intensive (Target 7.5+)',
      description: 'Chương trình đào tạo toàn diện 4 kỹ năng Nghe - Đọc - Viết - Nói bản quyền chuẩn Cambridge University Press (Bộ đề Cambridge IELTS 18 & 19 Academic mới nhất). Tích hợp phòng học WebRTC LiveKit 1-on-1, AI Writing Instant Assessment và Speaking Studio dạng sóng âm thời gian thực.',
      category: CourseCategory.IELTS,
      isEnglishCourse: true,
      isPublished: true,
      thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop',
    },
    create: {
      title: 'Cambridge IELTS 18 & 19 Academic: Masterclass Intensive (Target 7.5+)',
      slug: 'ielts-masterclass-band-7',
      description: 'Chương trình đào tạo toàn diện 4 kỹ năng Nghe - Đọc - Viết - Nói bản quyền chuẩn Cambridge University Press (Bộ đề Cambridge IELTS 18 & 19 Academic mới nhất). Tích hợp phòng học WebRTC LiveKit 1-on-1, AI Writing Instant Assessment và Speaking Studio dạng sóng âm thời gian thực.',
      category: CourseCategory.IELTS,
      isEnglishCourse: true,
      isPublished: true,
      thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop',
    },
  });

  // Clean old modules of this course to re-seed fresh curriculum
  const oldModules = await prisma.courseModule.findMany({ where: { courseId: course.id } });
  for (const om of oldModules) {
    await prisma.courseModule.delete({ where: { id: om.id } });
  }

  // --- MODULE 1: Cambridge 18 Listening & Reading ---
  const module1 = await prisma.courseModule.create({
    data: {
      courseId: course.id,
      title: 'Module 01: Cambridge 18 Academic Listening & Reading Masterclass',
      description: 'Chiến thuật bắt từ đồng nghĩa (Paraphrasing), nhận diện Distractors bẫy nghe và giải quyết triệt để dạng Matching Headings & True/False/Not Given.',
      orderIndex: 1,
    },
  });

  // Lesson 1.1: Cambridge 18 Listening
  const lesson1_1 = await prisma.lesson.create({
    data: {
      moduleId: module1.id,
      title: 'Lesson 1.1: Cambridge 18 Test 1 — Section 1 & 2 Note Completion & Map Labelling',
      description: 'Phân tích băng ghi âm Cambridge 18 Test 1: Đăng ký ký túc xá Westlake Hall và kỹ năng định hướng không gian sơ đồ khuôn viên trường đại học.',
      orderIndex: 1,
      durationMinutes: 60,
      isFreePreview: true,
      videoUrl: 'https://cdn.englishweb.com/videos/cambridge18-listening-test1.mp4',
    },
  });

  // Lesson 1.2: Cambridge 18 Reading Passage 1
  const lesson1_2 = await prisma.lesson.create({
    data: {
      moduleId: module1.id,
      title: 'Lesson 1.2: Cambridge 18 Test 1 — Passage 1: The Architecture of Sustainable Smart Cities',
      description: 'Kỹ thuật Skimming & Scanning bài đọc học thuật về kiến trúc rừng thẳng đứng Bosco Verticale và phương pháp làm bài Matching Headings không bị quá giờ.',
      orderIndex: 2,
      durationMinutes: 60,
      isFreePreview: false,
      videoUrl: 'https://cdn.englishweb.com/videos/cambridge18-reading-passage1.mp4',
    },
  });

  // Lesson 1.3: Cambridge 18 Reading Passage 2
  const lesson1_3 = await prisma.lesson.create({
    data: {
      moduleId: module1.id,
      title: 'Lesson 1.3: Cambridge 18 Test 2 — Passage 2: Ancient Oratory and Public Discourse',
      description: 'Phân tích học thuật lịch sử nghệ thuật hùng biện cổ đại La Mã & Hy Lạp, bẫy True/False/Not Given và Summary Completion.',
      orderIndex: 3,
      durationMinutes: 60,
      isFreePreview: false,
    },
  });

  // --- MODULE 2: Cambridge 18 Writing Task 1 & 2 ---
  const module2 = await prisma.courseModule.create({
    data: {
      courseId: course.id,
      title: 'Module 02: Cambridge 18 Academic Writing Task 1 & Task 2 Studio',
      description: 'Làm chủ cấu trúc 4 đoạn chuẩn xác, khai thác bộ Academic Collocations C1/C2 và phương pháp phân tích biểu đồ xu hướng (Trend & Comparative Charts).',
      orderIndex: 2,
    },
  });

  const lesson2_1 = await prisma.lesson.create({
    data: {
      moduleId: module2.id,
      title: 'Lesson 2.1: Writing Task 1 — Line Graph & Bar Chart: Renewable Energy Share (2010-2024)',
      description: 'Chiến lược Overview 2 điểm nổi bật, nhóm số liệu logic và từ vựng mô tả biến động tăng giảm đạt tiêu chí Lexical Resource Band 8.0+.',
      orderIndex: 1,
      durationMinutes: 45,
      isFreePreview: false,
    },
  });

  const lesson2_2 = await prisma.lesson.create({
    data: {
      moduleId: module2.id,
      title: 'Lesson 2.2: Writing Task 2 — 4-Paragraph Essay: Compulsory Community Service in High School',
      description: 'Lập dàn ý 4 đoạn cho dạng bài Opinion / Discussion, triển khai luận điểm mạch lạc với câu phức nhượng bộ và luận chứng thuyết phục.',
      orderIndex: 2,
      durationMinutes: 60,
      isFreePreview: false,
    },
  });

  // --- MODULE 3: Cambridge Speaking Studio ---
  const module3 = await prisma.courseModule.create({
    data: {
      courseId: course.id,
      title: 'Module 03: Cambridge Speaking Studio & Fluency Reflexes',
      description: 'Phương pháp chuẩn bị Cue Card trong 60 giây theo trục Quá Khứ - Hiện Tại - Cảm Xúc, luyện phản xạ 1-1 và chuẩn hóa ngữ điệu phát âm.',
      orderIndex: 3,
    },
  });

  const lesson3_1 = await prisma.lesson.create({
    data: {
      moduleId: module3.id,
      title: 'Lesson 3.1: Speaking Part 1 — Hometown, Neighborhood & Daily Habits',
      description: 'Mô hình trả lời 3-4 câu tự nhiên, mở rộng lý do và ví dụ cá nhân mà không bị cụt ý hay nói quá ngắn.',
      orderIndex: 1,
      durationMinutes: 45,
      isFreePreview: false,
    },
  });

  const lesson3_2 = await prisma.lesson.create({
    data: {
      moduleId: module3.id,
      title: 'Lesson 3.2: Speaking Part 2 & Part 3 — A Challenging Decision & Societal Impact',
      description: 'Thu âm 2 phút liền mạch với Cue Card "A Challenging Decision", phát triển tư duy phản biện trừu tượng cho Part 3.',
      orderIndex: 2,
      durationMinutes: 60,
      isFreePreview: false,
    },
  });

  // --- MODULE 4: Cambridge 19 Diagnostics & Full Mock Exams ---
  const module4 = await prisma.courseModule.create({
    data: {
      courseId: course.id,
      title: 'Module 04: Cambridge 19 Official Diagnostics & Full Mock Examinations',
      description: 'Phòng thi thử trực tuyến chia đôi màn hình chuẩn thi thật, phân tích radar chart điểm mạnh điểm yếu và chẩn đoán dạng bài.',
      orderIndex: 4,
    },
  });

  const lesson4_1 = await prisma.lesson.create({
    data: {
      moduleId: module4.id,
      title: 'Lesson 4.1: Cambridge 19 Academic Full Mock Exam — Split-Screen Reading & Listening',
      description: 'Bài thi thử toàn diện 40 câu Listening và 40 câu Reading có đếm ngược thời gian, highlight từ vựng và tự động chấm điểm.',
      orderIndex: 1,
      durationMinutes: 90,
      isFreePreview: false,
    },
  });

  const lesson4_2 = await prisma.lesson.create({
    data: {
      moduleId: module4.id,
      title: 'Lesson 4.2: Cambridge 19 Final Diagnostic Review & Live Assessment with Teacher Dong',
      description: 'Buổi tổng kết chẩn đoán kỹ năng chuyên sâu, rà soát lỗi ngữ pháp và vạch lộ trình bứt phá điểm số trước ngày thi thật.',
      orderIndex: 2,
      durationMinutes: 90,
      isFreePreview: false,
    },
  });

  // --- ADDITIONAL COURSES FOR DUAL-TRACK ARCHITECTURE ---
  console.log('📚 Seeding Non-IELTS Courses (Pedagogy, Life Skills, Business)...');

  const coursePedagogy = await prisma.course.upsert({
    where: { slug: 'nang-luc-su-pham-edtech-mastery' },
    update: {
      title: 'Năng Lực Sư Phạm 4.0 & Kỹ Năng Thiết Kế Lớp Học Trực Tuyến EdTech',
      description: 'Chương trình chuẩn hóa năng lực giảng dạy trực tuyến, làm chủ công nghệ tương tác, quản lý lớp học WebRTC và tâm lý học lứa tuổi.',
      category: CourseCategory.PEDAGOGY,
      isEnglishCourse: false,
      isPublished: true,
      thumbnail: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop',
    },
    create: {
      title: 'Năng Lực Sư Phạm 4.0 & Kỹ Năng Thiết Kế Lớp Học Trực Tuyến EdTech',
      slug: 'nang-luc-su-pham-edtech-mastery',
      description: 'Chương trình chuẩn hóa năng lực giảng dạy trực tuyến, làm chủ công nghệ tương tác, quản lý lớp học WebRTC và tâm lý học lứa tuổi.',
      category: CourseCategory.PEDAGOGY,
      isEnglishCourse: false,
      isPublished: true,
      thumbnail: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop',
    },
  });

  const courseLifeSkills = await prisma.course.upsert({
    where: { slug: 'nghe-thuat-thuyet-trinh-phan-xa' },
    update: {
      title: 'Nghệ Thuật Thuyết Trình, Làm Chủ Sân Khấu & Phản Biện Tình Huống',
      description: 'Luyện phản xạ tư duy phản biện, kiểm soát nỗi sợ nói trước đám đông, kỹ thuật điều tiết giọng nói và làm chủ các cuộc tranh luận.',
      category: CourseCategory.LIFE_SKILLS,
      isEnglishCourse: false,
      isPublished: true,
      thumbnail: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop',
    },
    create: {
      title: 'Nghệ Thuật Thuyết Trình, Làm Chủ Sân Khấu & Phản Biện Tình Huống',
      slug: 'nghe-thuat-thuyet-trinh-phan-xa',
      description: 'Luyện phản xạ tư duy phản biện, kiểm soát nỗi sợ nói trước đám đông, kỹ thuật điều tiết giọng nói và làm chủ các cuộc tranh luận.',
      category: CourseCategory.LIFE_SKILLS,
      isEnglishCourse: false,
      isPublished: true,
      thumbnail: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop',
    },
  });

  const courseBusiness = await prisma.course.upsert({
    where: { slug: 'business-english-executives' },
    update: {
      title: 'Business English Intensive: Đàm Phán Hợp Đồng & Thư Tín Thương Mại',
      description: 'Tiếng Anh thương mại cao cấp cho quản lý và chuyên viên: Văn phong email chuẩn mực, thuật ngữ hợp đồng và kỹ năng đàm phán quốc tế.',
      category: CourseCategory.BUSINESS,
      isEnglishCourse: true,
      isPublished: true,
      thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop',
    },
    create: {
      title: 'Business English Intensive: Đàm Phán Hợp Đồng & Thư Tín Thương Mại',
      slug: 'business-english-executives',
      description: 'Tiếng Anh thương mại cao cấp cho quản lý và chuyên viên: Văn phong email chuẩn mực, thuật ngữ hợp đồng và kỹ năng đàm phán quốc tế.',
      category: CourseCategory.BUSINESS,
      isEnglishCourse: true,
      isPublished: true,
      thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop',
    },
  });

  // ==========================================
  // 3. SEED SECURED DIGITAL LIBRARY (Materials)
  // ==========================================
  console.log('📑 Seeding Cambridge Materials (PDFs & Audio Streams)...');

  const materialsData = [
    {
      lessonId: lesson1_1.id,
      title: 'Cambridge_IELTS_18_Academic_Student_Book_With_Answers.pdf',
      type: MaterialType.PDF,
      fileKey: 'Cambridge_IELTS_18_Academic_Student_Book.pdf',
      fileSize: 14889728, // ~14.2 MB
    },
    {
      lessonId: lesson1_1.id,
      title: 'Cambridge_IELTS_18_Test1_Listening_Audio_Track.mp3',
      type: MaterialType.AUDIO,
      fileKey: 'Cambridge_IELTS_18_Test1_Listening.mp3',
      fileSize: 29779456, // ~28.4 MB
      durationSeconds: 1840,
    },
    {
      lessonId: lesson2_2.id,
      title: 'IELTS_Writing_Task_2_Band_8_Formula_Handbook.pdf',
      type: MaterialType.PDF,
      fileKey: 'IELTS_Writing_Task_2_Band_8_Formula.pdf',
      fileSize: 8912896, // ~8.5 MB
    },
    {
      lessonId: lesson3_1.id,
      title: 'IELTS_Speaking_Native_Model_Audio_Set_01.mp3',
      type: MaterialType.AUDIO,
      fileKey: 'IELTS_Speaking_Native_Model_Audio_01.mp3',
      fileSize: 23383296, // ~22.3 MB
      durationSeconds: 1520,
    },
    {
      lessonId: lesson4_1.id,
      title: 'Cambridge_IELTS_19_Academic_Official_Test_Collection.pdf',
      type: MaterialType.PDF,
      fileKey: 'Cambridge_IELTS_19_Academic_Official_Test.pdf',
      fileSize: 18979328, // ~18.1 MB
    },
  ];

  for (const m of materialsData) {
    // Write sample mock file physically to private_storage so real streaming works
    const physicalFile = path.join(storageDir, m.fileKey);
    if (!fs.existsSync(physicalFile)) {
      fs.writeFileSync(
        physicalFile,
        m.type === MaterialType.PDF
          ? `%PDF-1.4\n% Teacher Dong Academy Secured Cambridge Document: ${m.title}\n%%EOF`
          : `ID3\x04\x00\x00\x00\x00\x00\x23Teacher Dong Academy Cambridge Audio Stream: ${m.title}`,
      );
    }

    await prisma.material.create({
      data: {
        courseId: course.id,
        lessonId: m.lessonId,
        title: m.title,
        type: m.type,
        fileKey: m.fileKey,
        fileSize: m.fileSize,
        durationSeconds: m.durationSeconds || null,
        isPrivate: true,
        isWatermarked: true,
      },
    });
  }

  // ==========================================
  // 4. SEED CAMBRIDGE QUIZZES & MULTI-TRACK TESTS
  // ==========================================
  console.log('📝 Seeding Multi-Track Quizzes & Situation Tests...');

  // Clean old quizzes for fresh reproducible seed
  await prisma.quizAnswer.deleteMany({});
  await prisma.quizSubmission.deleteMany({});
  await prisma.questionOption.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.quiz.deleteMany({});

  // Quiz 1: Cambridge 18 Reading Passage 1 (Smart Cities)
  const quizReading1 = await prisma.quiz.create({
    data: {
      courseId: course.id,
      lessonId: lesson1_2.id,
      title: 'Cambridge 18 Academic Reading Test 1: The Architecture of Sustainable Smart Cities',
      description: 'Mô phỏng đề thi Cambridge Reading chính thức chia đôi màn hình với công cụ Highlight và bài đọc 3 Passage.',
      category: CourseCategory.IELTS,
      quizType: 'FULL_MOCK_TEST',
      skill: SkillType.READING,
      testType: 'FULL_MOCK_TEST',
      timeLimitMinutes: 20,
      passScore: 80,
      passage: `READING PASSAGE 1: THE ARCHITECTURE OF SUSTAINABLE SMART CITIES\n\nParagraph A: Over the past two decades, the conceptual paradigm of urban development has pivoted drastically towards environmental sustainability. Rapid demographic expansion in metropolitan centers has precipitated acute ecological strains, notably escalating carbon emissions, the creation of urban heat islands, and municipal water shortages. Contemporary urban planners argue that municipal viability in the late 21st century hinges upon "biophilic architecture" — an engineering philosophy that systematically incorporates living plant life, passive solar thermal regulation, and rainwater harvesting infrastructure directly into multi-tier residential complexes.\n\nParagraph B: One of the pioneering manifestations of this architectural evolution is the Bosco Verticale (Vertical Forest) in Milan, Italy. Designed by Stefano Boeri, the dual residential towers host over 900 trees and 15,000 perennial plants distributed along cantilevered concrete balconies. The vegetative perimeter acts as an organic microclimatic filter, sequestering approximately 30 tons of atmospheric carbon dioxide annually while diminishing indoor ambient temperatures by up to three degrees Celsius during summer heatwaves. Crucially, acoustic monitoring indicates that the foliage dampens external traffic resonance by approximately 25 decibels compared to adjacent conventional glass-clad towers.\n\nParagraph C: Despite these celebrated ecological dividends, structural engineers underscore substantial technical and logistical liabilities. Sustaining mature trees at elevations exceeding 100 meters necessitates specialized soil substrates capable of retaining nutrients without imposing catastrophic deadweight loads upon structural foundations. Furthermore, automated drip-irrigation networks, which recycle filtered greywater from residential sinks and showers, require redundant mechanical failsafes to forestall internal moisture infiltration and steel rebar oxidisation within the reinforced concrete frame.\n\nParagraph D: Economic analysts also caution against viewing vertical foliage as an immediate panacea for mass urban housing. The construction expenditures for biophilic skyscrapers are estimated to be 15 to 25 percent greater than traditional structural counterparts, largely attributable to structural steel reinforcement and complex aerodynamic wind-tunnel testing. Consequently, these developments have predominantly served affluent demographic strata, prompting critics to label them as "boutique greenwashing" unless municipal governments introduce statutory density bonuses and subsidies that mandate affordable units within such sustainable developments.`,
    },
  });

  const qR1 = await prisma.question.create({
    data: {
      quizId: quizReading1.id,
      content: 'Which heading corresponds to the main idea of Paragraph A?',
      type: QuestionType.MATCHING_HEADINGS,
      skill: SkillType.READING,
      subCategory: 'Matching Headings',
      points: 2.0,
      explanation: 'Đoạn A nêu rõ các áp lực môi trường (carbon, đảo nhiệt, thiếu nước) thúc đẩy sự ra đời của triết lý quy hoạch biophilic architecture.',
      orderIndex: 1,
    },
  });
  await prisma.questionOption.createMany({
    data: [
      { questionId: qR1.id, content: 'i. Financial obstacles and equity challenges in green architecture', isCorrect: false },
      { questionId: qR1.id, content: 'ii. Urgent environmental pressures driving biological city planning', isCorrect: true },
      { questionId: qR1.id, content: 'iii. Maintenance hurdles and water system mechanics', isCorrect: false },
      { questionId: qR1.id, content: 'iv. Empirical ecological benefits of a landmark European project', isCorrect: false },
    ],
  });

  const qR2 = await prisma.question.create({
    data: {
      quizId: quizReading1.id,
      content: 'Which heading corresponds to the main idea of Paragraph B?',
      type: QuestionType.MATCHING_HEADINGS,
      skill: SkillType.READING,
      subCategory: 'Matching Headings',
      points: 2.0,
      explanation: 'Đoạn B đưa ra ví dụ điển hình là tòa tháp Bosco Verticale tại Milan với các số liệu cụ thể về hấp thụ CO2 và giảm tiếng ồn.',
      orderIndex: 2,
    },
  });
  await prisma.questionOption.createMany({
    data: [
      { questionId: qR2.id, content: 'i. Urgent environmental pressures driving biological city planning', isCorrect: false },
      { questionId: qR2.id, content: 'ii. Empirical ecological benefits of a landmark European project', isCorrect: true },
      { questionId: qR2.id, content: 'iii. Technical risks associated with heavy high-elevation soil', isCorrect: false },
      { questionId: qR2.id, content: 'iv. Economic exclusivity and greenwashing accusations', isCorrect: false },
    ],
  });

  const qR3 = await prisma.question.create({
    data: {
      quizId: quizReading1.id,
      content: 'According to Paragraph B, the foliage on the Milan towers reduces incoming traffic noise by 25 decibels.',
      type: QuestionType.TRUE_FALSE_NOT_GIVEN,
      skill: SkillType.READING,
      subCategory: 'True / False / Not Given',
      points: 2.0,
      explanation: 'Đoạn B nêu rõ: "acoustic monitoring indicates that the foliage dampens external traffic resonance by approximately 25 decibels" -> TRUE.',
      orderIndex: 3,
    },
  });
  await prisma.questionOption.createMany({
    data: [
      { questionId: qR3.id, content: 'TRUE', isCorrect: true },
      { questionId: qR3.id, content: 'FALSE', isCorrect: false },
      { questionId: qR3.id, content: 'NOT GIVEN', isCorrect: false },
    ],
  });

  const qR4 = await prisma.question.create({
    data: {
      quizId: quizReading1.id,
      content: 'Building biophilic skyscrapers typically costs 15 to 25 percent less than building conventional towers.',
      type: QuestionType.TRUE_FALSE_NOT_GIVEN,
      skill: SkillType.READING,
      subCategory: 'True / False / Not Given',
      points: 2.0,
      explanation: 'Đoạn D ghi nhận: "construction expenditures are estimated to be 15 to 25 percent greater than traditional structural counterparts" (đắt hơn chứ không phải rẻ hơn) -> FALSE.',
      orderIndex: 4,
    },
  });
  await prisma.questionOption.createMany({
    data: [
      { questionId: qR4.id, content: 'TRUE', isCorrect: false },
      { questionId: qR4.id, content: 'FALSE', isCorrect: true },
      { questionId: qR4.id, content: 'NOT GIVEN', isCorrect: false },
    ],
  });

  // Quiz 2: Cambridge 18 Listening Section 1 (Campus Registration)
  const quizListening1 = await prisma.quiz.create({
    data: {
      courseId: course.id,
      lessonId: lesson1_1.id,
      title: 'Cambridge 18 Listening Test 1: University Campus Accommodation & Facilities Registration',
      description: 'Mô phỏng đề thi Cambridge Listening Section 1 với trình phát Audio trực quan và biểu mẫu Note Completion.',
      category: CourseCategory.IELTS,
      quizType: 'FULL_MOCK_TEST',
      skill: SkillType.LISTENING,
      testType: 'FULL_MOCK_TEST',
      timeLimitMinutes: 15,
      passScore: 80,
      audioUrl: 'https://actions.google.com/sounds/v1/ambiences/office_room_tone.ogg',
    },
  });

  const qL1 = await prisma.question.create({
    data: {
      quizId: quizListening1.id,
      content: 'Complete the student registration card with NO MORE THAN TWO WORDS: "Hall of Residence preference: _______ Hall"',
      type: QuestionType.NOTE_COMPLETION,
      skill: SkillType.LISTENING,
      subCategory: 'Note Completion',
      points: 2.5,
      explanation: 'Sinh viên nêu rõ trong đoạn hội thoại: "I would prefer Westlake Hall due to its proximity to the library".',
      orderIndex: 1,
    },
  });
  await prisma.questionOption.create({
    data: { questionId: qL1.id, content: 'Westlake', isCorrect: true },
  });

  const qL2 = await prisma.question.create({
    data: {
      quizId: quizListening1.id,
      content: 'What is the student\'s primary academic major for the upcoming semester?',
      type: QuestionType.SINGLE_CHOICE,
      skill: SkillType.LISTENING,
      subCategory: 'Multiple Choice (Section 1)',
      points: 2.5,
      explanation: 'Sinh viên trả lời: "I am taking the Environmental Engineering Master course".',
      orderIndex: 2,
    },
  });
  await prisma.questionOption.createMany({
    data: [
      { questionId: qL2.id, content: 'International Business Law', isCorrect: false },
      { questionId: qL2.id, content: 'Environmental Engineering', isCorrect: true },
      { questionId: qL2.id, content: 'Modern Architectural Design', isCorrect: false },
      { questionId: qL2.id, content: 'Computer Science & AI', isCorrect: false },
    ],
  });

  // Quiz 3: Academic Grammar Checkpoint
  const quizGrammar = await prisma.quiz.create({
    data: {
      courseId: course.id,
      lessonId: lesson2_2.id,
      title: 'Academic Grammar Checkpoint: Inversion & Cleft Sentences (GRA Band 7.5+)',
      description: 'Kiểm tra độ thành thục cấu trúc đảo ngữ và câu chẻ phục vụ tiêu chí Grammatical Range trong Writing & Speaking.',
      category: CourseCategory.ENGLISH,
      quizType: 'LESSON_QUIZ',
      skill: SkillType.WRITING,
      testType: 'LESSON_QUIZ',
      timeLimitMinutes: 10,
      passScore: 80,
    },
  });

  const qG1 = await prisma.question.create({
    data: {
      quizId: quizGrammar.id,
      content: 'Which sentence correctly applies negative inversion for formal emphasis?',
      type: QuestionType.SINGLE_CHOICE,
      skill: SkillType.WRITING,
      subCategory: 'Grammar Accuracy',
      points: 5.0,
      explanation: 'Sau trạng từ phủ định "Not only" phải đảo trợ động từ lên trước chủ ngữ: "Not only do students acquire... but they also develop...".',
      orderIndex: 1,
    },
  });
  await prisma.questionOption.createMany({
    data: [
      { questionId: qG1.id, content: 'Not only students acquire practical skills, but they also develop empathy.', isCorrect: false },
      { questionId: qG1.id, content: 'Not only do students acquire practical skills, but they also develop empathy.', isCorrect: true },
      { questionId: qG1.id, content: 'Not only students do acquire practical skills, but also they develop empathy.', isCorrect: false },
    ],
  });

  // Quiz 4: PEDAGOGY - Situation Case Study Quiz
  const quizPedagogy = await prisma.quiz.create({
    data: {
      courseId: coursePedagogy.id,
      title: 'Case Study Sư Phạm EdTech 01: Quản Trị Tương Tác & Giải Quyết Xung Đột Nhóm Trong Lớp Trực Tuyến',
      description: 'Trắc nghiệm xử lý tình huống thực tế dành cho giáo viên và giảng viên: Phân tích bối cảnh, đánh giá tâm lý người học và đưa ra can thiệp sư phạm chuẩn xác.',
      category: CourseCategory.PEDAGOGY,
      quizType: 'SITUATION_QUIZ',
      skill: SkillType.READING,
      testType: 'SITUATION_QUIZ',
      timeLimitMinutes: 20,
      passScore: 80,
      passage: `TÌNH HUỐNG THỰC TẾ (PEDAGOGICAL CASE STUDY):\n\nBối cảnh: Trong một buổi học trực tuyến qua WebRTC kéo dài 90 phút với 8 học viên người lớn (khóa đào tạo kỹ năng doanh nghiệp), giáo viên giao bài tập thảo luận nhóm (Breakout Room) 4 người để xây dựng kế hoạch dự án.\n\nDiễn biến 1: Tại Phòng 1, học viên A (giữ vị trí trưởng phòng ngoài đời) lập tức áp đặt quan điểm, liên tục ngắt lời và phủ nhận ý kiến của học viên B (một sinh viên mới ra trường). Học viên B sau đó tắt hoàn toàn camera và micro, không tham gia thêm bất kỳ hoạt động nào.\n\nDiễn biến 2: Giáo viên ghé thăm Phòng 1 và nhận thấy không khí căng thẳng cực độ, chỉ có học viên A nói một mình trong khi 3 thành viên còn lại đều im lặng. Thời gian thảo luận nhóm chỉ còn lại 7 phút trước khi quay trở lại phòng chính.\n\nYêu cầu: Người học trong vai trò Giáo viên điều phối cần phân tích động lực tâm lý nhóm và lựa chọn phương án can thiệp tức thời và hậu kỳ sư phạm tối ưu.`,
    },
  });

  const qPed1 = await prisma.question.create({
    data: {
      quizId: quizPedagogy.id,
      content: 'Khi bước vào phòng breakout và thấy học viên B tắt cam/mic còn học viên A độc thoại, hành động can thiệp tức thời (Immediate Action) nào của giáo viên là sư phạm và chuyên nghiệp nhất?',
      type: QuestionType.SINGLE_CHOICE,
      skill: SkillType.READING,
      subCategory: 'Tình Huống Sư Phạm',
      points: 3.5,
      explanation: 'Không nên chỉ trích công khai học viên A làm mất thể diện. Giáo viên cần tái cấu trúc hoạt động bằng cách phân bổ mỗi thành viên 90 giây trình bày một khía cạnh cụ thể theo vòng tròn, tạo không gian an toàn cho học viên B cất tiếng nói.',
      orderIndex: 1,
    },
  });
  await prisma.questionOption.createMany({
    data: [
      { questionId: qPed1.id, content: 'Ngắt lời học viên A ngay lập tức và phê bình trước nhóm vì hành vi lấn át người khác.', isCorrect: false },
      { questionId: qPed1.id, content: 'Tái cấu trúc vòng thảo luận (Round-robin): Đặt câu hỏi mở và mời lần lượt từng thành viên có 90 giây nêu góc nhìn riêng theo vai trò.', isCorrect: true },
      { questionId: qPed1.id, content: 'Bỏ qua và chờ hết giờ thảo luận để gọi học viên B phát biểu trước toàn lớp lớn.', isCorrect: false },
      { questionId: qPed1.id, content: 'Đưa ngay học viên B sang một nhóm breakout khác để tránh xung đột.', isCorrect: false },
    ],
  });

  const qPed2 = await prisma.question.create({
    data: {
      quizId: quizPedagogy.id,
      content: 'Để tái kết nối với học viên B sau buổi học nhằm giữ chân và duy trì động lực học tập, giáo viên nên thực hiện bước nào?',
      type: QuestionType.SINGLE_CHOICE,
      skill: SkillType.READING,
      subCategory: 'Tâm Lý Học Viên',
      points: 3.5,
      explanation: 'Nhắn tin riêng 1-on-1 bày tỏ sự đồng cảm, lắng nghe khó khăn của học viên và khích lệ họ là nguyên tắc then chốt trong sư phạm hiện đại.',
      orderIndex: 2,
    },
  });
  await prisma.questionOption.createMany({
    data: [
      { questionId: qPed2.id, content: 'Gửi tin nhắn riêng thăm hỏi, ghi nhận sự đóng góp ở các buổi trước và lắng nghe cảm nhận mà không đổ lỗi.', isCorrect: true },
      { questionId: qPed2.id, content: 'Yêu cầu học viên B phải tự tin hơn nếu muốn tiếp tục theo học khóa học.', isCorrect: false },
      { questionId: qPed2.id, content: 'Yêu cầu học viên A gửi lời xin lỗi học viên B trong nhóm chat chung.', isCorrect: false },
      { questionId: qPed2.id, content: 'Đánh giá điểm chuyên cần thấp cho học viên B vì tắt camera giữa chừng.', isCorrect: false },
    ],
  });

  const qPed3 = await prisma.question.create({
    data: {
      quizId: quizPedagogy.id,
      content: 'Nguyên tắc thiết lập luật chơi (Class Norms) nào giúp ngăn ngừa hoàn toàn tình trạng một người áp đặt trong các buổi học tiếp theo?',
      type: QuestionType.SINGLE_CHOICE,
      skill: SkillType.READING,
      subCategory: 'Quy Chuẩn Lớp Học',
      points: 3.0,
      explanation: 'Thiết lập quy tắc phân vai rõ ràng (Facilitator, Timekeeper, Note-taker, Spokesperson) luân phiên trong mỗi buổi thảo luận.',
      orderIndex: 3,
    },
  });
  await prisma.questionOption.createMany({
    data: [
      { questionId: qPed3.id, content: 'Phân vai trò cố định: Điều phối viên (Facilitator), Thư ký (Timekeeper) và Đại diện phát ngôn luân phiên.', isCorrect: true },
      { questionId: qPed3.id, content: 'Cấm các học viên có chức vụ cao phát biểu trước trong nhóm.', isCorrect: false },
      { questionId: qPed3.id, content: 'Hủy bỏ hoàn toàn hoạt động thảo luận nhóm và chuyển sang giảng bài 1 chiều.', isCorrect: false },
    ],
  });

  // Quiz 5: LIFE_SKILLS - Situation Quiz
  const quizLifeSkills = await prisma.quiz.create({
    data: {
      courseId: courseLifeSkills.id,
      title: 'Trắc Nghiệm Tình Huống Kỹ Năng Sống: Thuyết Trình Trước Hội Đồng & Vượt Qua Nỗi Sợ Phản Biện',
      description: 'Đánh giá năng lực xử lý tình huống bất ngờ khi diễn thuyết trước đám đông, kỹ thuật làm chủ cảm xúc và nghệ thuật trả lời câu hỏi hóc búa.',
      category: CourseCategory.LIFE_SKILLS,
      quizType: 'SITUATION_QUIZ',
      skill: SkillType.READING,
      testType: 'SITUATION_QUIZ',
      timeLimitMinutes: 15,
      passScore: 80,
      passage: `BỐI CẢNH TÌNH HUỐNG THUYẾT TRÌNH (PRESENTATION DILEMMA):\n\nBạn đang trình bày dự án chiến lược trước Hội đồng thẩm định gồm 5 thành viên ban giám đốc và các chuyên gia cấp cao. Bài thuyết trình đã chuẩn bị kỹ lưỡng kéo dài 15 phút.\n\nKhi bạn đang ở slide thứ 3 trình bày về dự toán ngân sách, một thành viên hội đồng có tầm ảnh hưởng lớn đột ngột cắt ngang bằng giọng điệu gay gắt: "Số liệu chi phí này hoàn toàn phi thực tế và thiếu căn cứ thị trường, bạn lấy nguồn khảo sát này từ đâu mà dám đưa vào đây?"\n\nCả hội trường im lặng hướng mắt về phía bạn. Bạn cảm thấy tim đập nhanh, cổ họng nghẹn lại và nhận ra số liệu đó do một đồng nghiệp phụ trách tài chính cung cấp chưa kịp đối chiếu bảng gốc sáng nay.`,
    },
  });

  const qLife1 = await prisma.question.create({
    data: {
      quizId: quizLifeSkills.id,
      content: 'Trong 5 giây đầu tiên sau khi bị ngắt lời gay gắt, phản ứng tâm lý và hành vi chuẩn mực của diễn giả chuyên nghiệp là gì?',
      type: QuestionType.SINGLE_CHOICE,
      skill: SkillType.READING,
      subCategory: 'Làm Chủ Cảm Xúc',
      points: 5.0,
      explanation: 'Dừng lại 2-3 giây hít thở sâu, duy trì giao tiếp ánh mắt điềm tĩnh, mỉm cười nhẹ và ghi nhận câu hỏi thay vì phản xạ cãi lại hoặc tỏ ra bối rối.',
      orderIndex: 1,
    },
  });
  await prisma.questionOption.createMany({
    data: [
      { questionId: qLife1.id, content: 'Lập tức thanh minh rằng số liệu do đồng nghiệp làm sai chứ không phải lỗi của mình.', isCorrect: false },
      { questionId: qLife1.id, content: 'Hít sâu 3 giây, giữ ánh mắt bình thản, ghi nhận sự chú ý sắc sảo của giám khảo và cảm ơn câu hỏi phản biện.', isCorrect: true },
      { questionId: qLife1.id, content: 'Im lặng lướt nhanh qua slide tiếp theo để tránh tranh cãi.', isCorrect: false },
      { questionId: qLife1.id, content: 'Bật lại giám khảo rằng số liệu đã được nghiên cứu kỹ và không thể vô lý.', isCorrect: false },
    ],
  });

  const qLife2 = await prisma.question.create({
    data: {
      quizId: quizLifeSkills.id,
      content: 'Kỹ thuật trả lời "Bridge & Reframe" nào dưới đây giúp biến câu hỏi chất vấn thành cơ hội thể hiện năng lực giải quyết vấn đề?',
      type: QuestionType.SINGLE_CHOICE,
      skill: SkillType.READING,
      subCategory: 'Phản Biện Sắc Bén',
      points: 5.0,
      explanation: 'Tách biệt giữa giá trị cốt lõi của giải pháp và việc kiểm chứng số liệu chi tiết, cam kết gửi bảng đối chiếu kèm nguồn khảo sát ngay sau cuộc họp.',
      orderIndex: 2,
    },
  });
  await prisma.questionOption.createMany({
    data: [
      { questionId: qLife2.id, content: 'Cảm ơn góc nhìn thận trọng của anh/chị. Mô hình ngân sách này dựa trên kịch bản thị trường thận trọng, và tôi xin phép gửi bảng chi tiết nguồn khảo sát ngay sau buổi họp, đồng thời xin trình bày cơ chế tối ưu chi phí ở slide tiếp theo.', isCorrect: true },
      { questionId: qLife2.id, content: 'Tôi nghĩ anh chưa đọc kỹ tài liệu đính kèm nên mới hỏi câu này.', isCorrect: false },
      { questionId: qLife2.id, content: 'Dạ số liệu này em xin nhận khuyết điểm và xin dừng bài thuyết trình tại đây.', isCorrect: false },
    ],
  });

  // Quiz 6: BUSINESS - Practice Test
  const quizBusiness = await prisma.quiz.create({
    data: {
      courseId: courseBusiness.id,
      title: 'Business English Diagnostic: Professional Email Tone & Contract Negotiation Nuances',
      description: 'Kiểm tra năng lực sử dụng ngôn ngữ thương mại quốc tế, phong cách ngoại giao lịch thiệp và từ vựng đàm phán hợp đồng chuyên nghiệp.',
      category: CourseCategory.BUSINESS,
      quizType: 'PRACTICE_TEST',
      skill: SkillType.READING,
      testType: 'PRACTICE_TEST',
      timeLimitMinutes: 15,
      passScore: 80,
      passage: `CASE STUDY: INTERNATIONAL SUPPLY CONTRACT DISPUTE\n\nTo: Senior Procurement Officer (You)\nFrom: Global Logistics Director, Apex Corporation\nSubject: Critical Delay in Shipment #4092 - Component Delivery Milestone\n\n"Dear Team,\nWe are writing to express our acute disappointment regarding the delivery schedule for Batch #4092. As per Clause 8.2 of the Master Supply Agreement, the agreed dispatch date was November 10th. Our assembly plant in Yokohama will face complete operational shutdown if these components fail to arrive by Friday.\nWe hereby request an immediate teleconference to discuss contractual liquidated damages and freight reimbursement."`,
    },
  });

  const qBiz1 = await prisma.question.create({
    data: {
      quizId: quizBusiness.id,
      content: 'Which opening sentence establishes the highest level of diplomatic professionalism in your email reply?',
      type: QuestionType.SINGLE_CHOICE,
      skill: SkillType.READING,
      subCategory: 'Business Correspondence',
      points: 5.0,
      explanation: 'Thừa nhận quan ngại của đối tác một cách trang trọng, thể hiện sự thấu hiểu tác động kinh doanh mà không vội vàng thừa nhận sai phạm pháp lý.',
      orderIndex: 1,
    },
  });
  await prisma.questionOption.createMany({
    data: [
      { questionId: qBiz1.id, content: 'We fully appreciate the critical urgency regarding Shipment #4092 and sincerely regret the unforeseen logistical friction your assembly line is experiencing.', isCorrect: true },
      { questionId: qBiz1.id, content: 'It is not our fault because the typhoon delayed all flights from Singapore.', isCorrect: false },
      { questionId: qBiz1.id, content: 'Sorry for the delay, we will send the goods soon.', isCorrect: false },
      { questionId: qBiz1.id, content: 'You should calm down because Clause 8.2 also mentions force majeure.', isCorrect: false },
    ],
  });

  const qBiz2 = await prisma.question.create({
    data: {
      quizId: quizBusiness.id,
      content: 'In business contract negotiations, what does the term "liquidated damages" specifically signify?',
      type: QuestionType.SINGLE_CHOICE,
      skill: SkillType.READING,
      subCategory: 'Contract Terminology',
      points: 5.0,
      explanation: '"Liquidated damages" là khoản tiền bồi thường thiệt hại được các bên thỏa thuận trước trong hợp đồng khi xảy ra vi phạm (như chậm tiến độ).',
      orderIndex: 2,
    },
  });
  await prisma.questionOption.createMany({
    data: [
      { questionId: qBiz2.id, content: 'A pre-estimated compensation amount predetermined in the contract to be paid in event of a specific breach.', isCorrect: true },
      { questionId: qBiz2.id, content: 'The total value of liquid inventory in the warehouse.', isCorrect: false },
      { questionId: qBiz2.id, content: 'Bankruptcy costs when a company dissolves its assets.', isCorrect: false },
    ],
  });

  // ==========================================
  // 5. SEED QUIZ SUBMISSIONS (Student History)
  // ==========================================
  console.log('📊 Seeding Quiz Submissions & Answers...');

  // Primary student (Nguyen Thi Mai) completed Quiz Reading 1 (Score 100%)
  const sub1 = await prisma.quizSubmission.create({
    data: {
      quizId: quizReading1.id,
      userId: primaryStudent.id,
      score: 100,
      totalQuestions: 4,
      correctAnswers: 4,
      isPassed: true,
      submittedAt: new Date(Date.now() - 3600000 * 24),
    },
  });
  await prisma.quizAnswer.createMany({
    data: [
      { submissionId: sub1.id, questionId: qR1.id, textAnswer: 'ii', isCorrect: true },
      { submissionId: sub1.id, questionId: qR2.id, textAnswer: 'ii', isCorrect: true },
      { submissionId: sub1.id, questionId: qR3.id, textAnswer: 'TRUE', isCorrect: true },
      { submissionId: sub1.id, questionId: qR4.id, textAnswer: 'FALSE', isCorrect: true },
    ],
  });

  // Second student (Tran Van Bao) completed Quiz Reading 1 (Score 75%)
  const sub2 = await prisma.quizSubmission.create({
    data: {
      quizId: quizReading1.id,
      userId: students[1].id,
      score: 75,
      totalQuestions: 4,
      correctAnswers: 3,
      isPassed: false,
      submittedAt: new Date(Date.now() - 3600000 * 12),
    },
  });
  await prisma.quizAnswer.createMany({
    data: [
      { submissionId: sub2.id, questionId: qR1.id, textAnswer: 'ii', isCorrect: true },
      { submissionId: sub2.id, questionId: qR2.id, textAnswer: 'i', isCorrect: false },
      { submissionId: sub2.id, questionId: qR3.id, textAnswer: 'TRUE', isCorrect: true },
      { submissionId: sub2.id, questionId: qR4.id, textAnswer: 'FALSE', isCorrect: true },
    ],
  });

  // ==========================================
  // 6. SEED CAMBRIDGE WRITING PROMPTS & ESSAYS
  // ==========================================
  console.log('✍️ Seeding Cambridge Writing Prompts & Submissions...');

  // Prompt 1: Cambridge 18 Test 1 Task 2
  const writingPrompt1 = await prisma.writingPrompt.create({
    data: {
      lessonId: lesson2_2.id,
      title: 'Cambridge 18 Academic Test 1: Compulsory Community Service in High School (Task 2)',
      taskType: WritingTaskType.TASK_2,
      topic: 'Some people believe that unpaid community service should be a compulsory part of high school programmes (for example, working for a charity, improving the relationship of neighbourhood or teaching sports to younger children). To what extent do you agree or disagree?',
      targetWords: 250,
      timeLimitMinutes: 40,
      sampleEssay: `It is widely contended that secondary school curricula should mandate unpaid voluntary service as an integral graduation prerequisite. From my perspective, I wholeheartedly endorse this policy, as engaging in community initiatives not only cultivates civic accountability but also imparts indispensable vocational proficiencies that cannot be acquired within traditional classroom confines.\n\nTo begin with, mandatory voluntary initiatives play a pivotal role in nurturing social empathy among adolescents. In contemporary urban society, youngsters are increasingly ensconced in digital echo chambers, resulting in a conspicuous detachment from grassroots socioeconomic realities. By actively participating in charitable endeavors, such as aiding impoverished senior citizens or organizing localized environmental clean-ups, pupils are exposed to diverse social strata. Consequently, this experiential immersion fosters profound empathy and dismantling elitist preconceptions, ultimately shaping them into conscientious, socially conscious citizens.\n\nFurthermore, voluntary community involvement serves as an exceptional incubator for essential soft skills. Practical engagement in neighborhood development projects necessitates collaborative teamwork, conflict mediation, and strategic logistical planning. For instance, mentoring underprivileged children in athletic programs requires adolescents to demonstrate patience, verbal articulateness, and adaptive leadership. These foundational attributes provide a competitive edge in prospective tertiary education and high-pressure corporate environments, bridging the chasm between theoretical scholastic knowledge and real-world execution.\n\nIn conclusion, I firmly advocate that community service should be instituted as a compulsory educational element. The synergistic blend of heightened social consciousness and empirical interpersonal acumen undeniably equips students to navigate the intricate complexities of adult life.`,
    },
  });

  // Prompt 2: Cambridge 18 Test 1 Task 1
  const writingPrompt2 = await prisma.writingPrompt.create({
    data: {
      lessonId: lesson2_1.id,
      title: 'Cambridge 18 Academic Test 1: Renewable Electricity Generation in Four Countries (Task 1)',
      taskType: WritingTaskType.TASK_1,
      topic: 'The chart below gives information about the proportion of electricity generated from renewable sources in four countries between 2010 and 2024. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
      targetWords: 150,
      timeLimitMinutes: 20,
    },
  });

  // Student 1 (Nguyen Thi Mai) submitted essay - APPROVED by Teacher Dong (Band 7.5)
  await prisma.writingSubmission.create({
    data: {
      promptId: writingPrompt1.id,
      userId: primaryStudent.id,
      content: `In modern educational discourse, there is an ongoing debate regarding whether community service should be made an obligatory component of secondary education. In my opinion, I fully agree with this viewpoint because volunteer work fosters civic empathy and equips students with crucial life skills.\n\nFirstly, participating in community projects enhances adolescents' understanding of social disparities. When high school students assist local charities or tutor disadvantaged children, they develop genuine compassion for vulnerable communities. This hands-on experience broadens their worldview significantly.\n\nSecondly, voluntary initiatives serve as a practical platform for interpersonal development. Leading small-scale environmental campaigns or organizing neighborhood sports events allows students to practice teamwork, communication, and time management. These valuable competencies are vital for their future career prospects.\n\nIn conclusion, making community service compulsory in high schools brings profound individual and societal benefits.`,
      wordCount: 165,
      timeSpentSeconds: 1980,
      status: WritingSubmissionStatus.APPROVED,
      overallBand: 7.5,
      taskAchievementScore: 7.5,
      coherenceCohesionScore: 7.5,
      lexicalResourceScore: 7.5,
      grammarScore: 7.5,
      aiFeedback: 'Bài viết có luận điểm chặt chẽ, bố cục 4 đoạn mẫu mực. Tiêu chí Task Response phát triển đầy đủ 2 luận cứ chính. Tiêu chí Lexical Resource sử dụng chính xác các collocation học thuật: civic empathy, social disparities, interpersonal development.',
      adminFeedback: 'Bài viết tiến bộ rõ rệt so với bài trước! Thầy đánh giá cao cách em phát triển câu phức nhượng bộ và dùng từ vựng đúng ngữ cảnh. Đạt Band 7.5 hoàn toàn xứng đáng.',
      adminOverrideBand: 7.5,
      approvedAt: new Date(Date.now() - 3600000 * 6),
      approvedById: admin.id,
      submittedAt: new Date(Date.now() - 3600000 * 8),
    },
  });

  // Student 2 (Tran Van Bao) submitted essay - AI_EVALUATED (Pending Teacher Dong Review)
  await prisma.writingSubmission.create({
    data: {
      promptId: writingPrompt1.id,
      userId: students[1].id,
      content: `Nowadays, many educators argue that high school students should do unpaid community service before graduating. From my perspective, I strongly agree with this proposal because it helps young people gain social experience and teamwork ability.\n\nOn the one hand, doing volunteer work helps students become more mature. They learn how to help poor people and protect the environment instead of playing video games all day.\n\nOn the other hand, students who engage in voluntary activities can build good relationships with their neighbors. This is very good for their future.\n\nIn conclusion, community service should be compulsory in all schools.`,
      wordCount: 104,
      timeSpentSeconds: 1400,
      status: WritingSubmissionStatus.AI_EVALUATED,
      overallBand: 6.5,
      taskAchievementScore: 6.0,
      coherenceCohesionScore: 6.5,
      lexicalResourceScore: 6.5,
      grammarScore: 6.5,
      aiFeedback: 'Bài viết nêu được quan điểm rõ ràng. Tuy nhiên số lượng từ chưa đạt mức yêu cầu tối thiểu (104/250 từ). Cần triển khai thêm ví dụ minh họa và nâng cấp từ vựng học thuật C1/C2.',
      submittedAt: new Date(Date.now() - 3600000 * 2),
    },
  });

  // Save active draft for Nguyen Thi Mai
  await prisma.writingDraft.upsert({
    where: { id: 'draft-seed-mai' },
    update: {},
    create: {
      id: 'draft-seed-mai',
      userId: primaryStudent.id,
      promptId: writingPrompt2.id,
      content: 'The provided line graph delineates the trajectory of electricity generation originating from renewable energy alternatives across four distinct countries from 2010 to 2024...',
      wordCount: 28,
      durationSeconds: 320,
    },
  });

  // ==========================================
  // 7. SEED CAMBRIDGE SPEAKING PROMPTS & AUDIO
  // ==========================================
  console.log('🎙️ Seeding Cambridge Speaking Prompts & Submissions...');

  const speakingPrompt1 = await prisma.speakingPrompt.create({
    data: {
      lessonId: lesson3_1.id,
      title: 'Cambridge 18 Speaking Part 1: Hometown, Neighborhood & Daily Routines',
      topic: 'Let\'s talk about your hometown. Where is your hometown located? What do you like most about the area you grew up in? Do you think you will continue living there in the foreseeable future?',
      sampleAudioUrl: 'https://actions.google.com/sounds/v1/ambiences/office_room_tone.ogg',
      minSeconds: 30,
      maxSeconds: 90,
    },
  });

  const speakingPrompt2 = await prisma.speakingPrompt.create({
    data: {
      lessonId: lesson3_2.id,
      title: 'Cambridge 18 Speaking Part 2 Cue Card: Describe a challenging decision you made',
      topic: 'Describe a challenging decision that took you a long time to make. You should say: what the decision was, why it was difficult to decide, what you finally chose, and explain how you felt after making this decision.',
      minSeconds: 60,
      maxSeconds: 120,
    },
  });

  // Primary student (Nguyen Thi Mai) Speaking Submission - GRADED by Teacher Dong (Band 7.5)
  await prisma.speakingSubmission.create({
    data: {
      promptId: speakingPrompt2.id,
      userId: primaryStudent.id,
      audioUrl: 'https://actions.google.com/sounds/v1/ambiences/office_room_tone.ogg',
      durationSeconds: 114,
      status: SubmissionStatus.GRADED,
      bandScore: 7.5,
      fluencyScore: 7.5,
      lexicalScore: 8.0,
      grammarScore: 7.5,
      pronunciationScore: 7.5,
      feedback: 'Bài nói rất tự nhiên, cấu trúc trả lời 3 phần rõ ràng. Em kiểm soát tốc độ nói tốt, có ngữ điệu nhấn nhá tự nhiên. Chú ý các nguyên âm dài và nối âm đuôi (-ed) chuẩn xác hơn ở đoạn cao trào.',
      timestampFeedback: [
        { time: 15, text: 'Mở đầu ấn tượng, paraphrase đề bài thành công với collocation "pivotal juncture".' },
        { time: 48, text: 'Phần giải thích lý do thuyết phục, sử dụng linh hoạt câu điều kiện loại 3.' },
        { time: 92, text: 'Kết bài súc tích, phản ánh cảm xúc chân thực và thể hiện sự tự tin.' },
      ],
      gradedAt: new Date(Date.now() - 3600000 * 5),
      gradedById: admin.id,
      submittedAt: new Date(Date.now() - 3600000 * 10),
    },
  });

  // Second student (Tran Van Bao) Speaking Submission - PENDING Grading
  await prisma.speakingSubmission.create({
    data: {
      promptId: speakingPrompt1.id,
      userId: students[1].id,
      audioUrl: 'https://actions.google.com/sounds/v1/ambiences/office_room_tone.ogg',
      durationSeconds: 78,
      status: SubmissionStatus.PENDING,
      submittedAt: new Date(Date.now() - 3600000 * 1),
    },
  });

  // ==========================================
  // 8. SEED LIVEKIT WEBRTC CLASSROOMS & ATTENDANCE
  // ==========================================
  console.log('📹 Seeding LiveKit Classrooms & Webhook Attendance Records...');

  // Classroom 1: ACTIVE Room currently running
  const class1 = await prisma.classroom.create({
    data: {
      name: 'Cambridge IELTS 18 Speaking Part 2 Forecast — Intensive Live Session',
      courseId: course.id,
      hostId: admin.id,
      scheduledStartTime: new Date(Date.now() - 3600000 * 1), // Started 1h ago
      scheduledEndTime: new Date(Date.now() + 3600000 * 1), // Ends in 1h
      actualStartTime: new Date(Date.now() - 3600000 * 1),
      status: RoomStatus.ACTIVE,
    },
  });

  // Classroom 2: Past FINISHED Room
  const class2 = await prisma.classroom.create({
    data: {
      name: 'Writing Task 2 Academic Collocations Workshop (Cambridge 18)',
      courseId: course.id,
      hostId: admin.id,
      scheduledStartTime: new Date(Date.now() - 3600000 * 26),
      scheduledEndTime: new Date(Date.now() - 3600000 * 24.5),
      actualStartTime: new Date(Date.now() - 3600000 * 26),
      actualEndTime: new Date(Date.now() - 3600000 * 24.5),
      status: RoomStatus.ENDED,
    },
  });

  // Classroom 3: SCHEDULED upcoming Room
  await prisma.classroom.create({
    data: {
      name: 'IELTS Speaking Mock Simulation 1-on-1 with Teacher Dong',
      courseId: course.id,
      hostId: admin.id,
      scheduledStartTime: new Date(Date.now() + 3600000 * 18),
      scheduledEndTime: new Date(Date.now() + 3600000 * 19.5),
      status: RoomStatus.SCHEDULED,
    },
  });

  // Attendance Records for Classroom 2 (Past finished room)
  await prisma.attendanceRecord.createMany({
    data: [
      {
        classroomId: class2.id,
        studentId: primaryStudent.id,
        firstJoinedAt: new Date(Date.now() - 3600000 * 26),
        lastLeftAt: new Date(Date.now() - 3600000 * 24.5),
        totalMinutes: 89,
        status: AttendanceStatus.PRESENT,
        note: 'Tham gia đúng giờ, tương tác giơ tay phát biểu sôi nổi.',
      },
      {
        classroomId: class2.id,
        studentId: students[1].id, // Tran Van Bao
        firstJoinedAt: new Date(Date.now() - 3600000 * 25.5),
        lastLeftAt: new Date(Date.now() - 3600000 * 24.5),
        totalMinutes: 68,
        status: AttendanceStatus.LATE,
        note: 'Tham gia sau 25 phút đầu do kẹt xe. LiveKit Webhook tự động phân loại LATE.',
      },
      {
        classroomId: class2.id,
        studentId: students[2].id, // Le Hoang Nam
        firstJoinedAt: new Date(Date.now() - 3600000 * 26),
        lastLeftAt: new Date(Date.now() - 3600000 * 24.5),
        totalMinutes: 90,
        status: AttendanceStatus.PRESENT,
        note: 'Có mặt đầy đủ 100% thời lượng.',
      },
      {
        classroomId: class2.id,
        studentId: students[3].id, // Pham Minh Anh
        firstJoinedAt: new Date(Date.now() - 3600000 * 26),
        lastLeftAt: new Date(Date.now() - 3600000 * 24.5),
        totalMinutes: 88,
        status: AttendanceStatus.PRESENT,
        note: 'Tương tác tốt trên Whiteboard canvas.',
      },
      {
        classroomId: class2.id,
        studentId: students[4].id, // Vu Thu Ha
        totalMinutes: 0,
        status: AttendanceStatus.ABSENT,
        note: 'Vắng không phép. Hệ thống đã gửi video bài giảng qua email tự động.',
      },
    ],
  });

  // ==========================================
  // 9. SEED ENROLLMENTS & LESSON PROGRESS
  // ==========================================
  console.log('🎓 Seeding Enrollments & Course Progress...');

  // Student 1: 100% Active Enrollment
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: primaryStudent.id, courseId: course.id } },
    update: { progressPercent: 85, status: 'ACTIVE' },
    create: {
      userId: primaryStudent.id,
      courseId: course.id,
      progressPercent: 85,
      status: 'ACTIVE',
      paymentAmount: 4500000,
      paymentNote: 'TD 0912345678 IELTS18 - CK MBBank Nguyen Thi Mai',
      enrolledAt: new Date(Date.now() - 3600000 * 24 * 30),
      approvedAt: new Date(Date.now() - 3600000 * 24 * 30),
    },
  });

  // Student 1: Active Enrollment in Pedagogy Course
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: primaryStudent.id, courseId: coursePedagogy.id } },
    update: { progressPercent: 40, status: 'ACTIVE' },
    create: {
      userId: primaryStudent.id,
      courseId: coursePedagogy.id,
      progressPercent: 40,
      status: 'ACTIVE',
      paymentAmount: 3200000,
      paymentNote: 'TD 0912345678 PEDAGOGY - CK MBBank Nguyen Thi Mai',
      enrolledAt: new Date(Date.now() - 3600000 * 24 * 10),
      approvedAt: new Date(Date.now() - 3600000 * 24 * 10),
    },
  });

  // Student 1: Active Enrollment in Life Skills Course
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: primaryStudent.id, courseId: courseLifeSkills.id } },
    update: { progressPercent: 20, status: 'ACTIVE' },
    create: {
      userId: primaryStudent.id,
      courseId: courseLifeSkills.id,
      progressPercent: 20,
      status: 'ACTIVE',
      paymentAmount: 2800000,
      paymentNote: 'TD 0912345678 LIFESKILLS - CK MBBank Nguyen Thi Mai',
      enrolledAt: new Date(Date.now() - 3600000 * 24 * 5),
      approvedAt: new Date(Date.now() - 3600000 * 24 * 5),
    },
  });

  // Mark lessons completed for Student 1
  const completedLessonIds = [lesson1_1.id, lesson1_2.id, lesson2_1.id, lesson2_2.id, lesson3_1.id];
  for (const lid of completedLessonIds) {
    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: primaryStudent.id, lessonId: lid } },
      update: { isCompleted: true },
      create: {
        userId: primaryStudent.id,
        lessonId: lid,
        isCompleted: true,
        completedAt: new Date(),
      },
    });
  }

  // Other students enrollments
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: students[1].id, courseId: course.id } },
    update: {},
    create: {
      userId: students[1].id,
      courseId: course.id,
      progressPercent: 45,
      status: 'ACTIVE',
      paymentAmount: 4500000,
      paymentNote: 'TD 0988776655 IELTS18 - CK Techcombank Tran Van Bao',
      enrolledAt: new Date(Date.now() - 3600000 * 24 * 20),
      approvedAt: new Date(Date.now() - 3600000 * 24 * 20),
    },
  });

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: students[2].id, courseId: course.id } },
    update: {},
    create: {
      userId: students[2].id,
      courseId: course.id,
      progressPercent: 60,
      status: 'ACTIVE',
      paymentAmount: 4500000,
      paymentNote: 'TD 0901234567 IELTS18 - CK Vietcombank Le Hoang Nam',
      enrolledAt: new Date(Date.now() - 3600000 * 24 * 15),
      approvedAt: new Date(Date.now() - 3600000 * 24 * 15),
    },
  });

  // Pending enrollment awaiting Admin approval (for Admin Courses Management page)
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: students[5].id, courseId: course.id } }, // Dang Quoc Huy
    update: {},
    create: {
      userId: students[5].id,
      courseId: course.id,
      progressPercent: 0,
      status: 'PENDING',
      paymentAmount: 4500000,
      paymentNote: 'TD 0909112233 IELTS18 - Đã chuyển khoản qua MBBank Đặng Quốc Huy',
      enrolledAt: new Date(Date.now() - 3600000 * 2),
    },
  });

  // ==========================================
  // 10. SEED REALTIME CHAT (Teacher Dong - Student)
  // ==========================================
  console.log('💬 Seeding Realtime Chat Conversations & Messages...');

  const conv = await prisma.conversation.upsert({
    where: {
      studentId_adminId: {
        studentId: primaryStudent.id,
        adminId: admin.id,
      },
    },
    update: { lastMessageAt: new Date() },
    create: {
      studentId: primaryStudent.id,
      adminId: admin.id,
      lastMessageAt: new Date(),
    },
  });

  // Clean old messages for fresh seed
  await prisma.message.deleteMany({ where: { conversationId: conv.id } });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conv.id,
        senderId: primaryStudent.id,
        content: 'Thầy ơi, bài Writing Task 2 Cambridge 18 em vừa viết xong, nhờ Thầy xem giúp em phần luận cứ ở đoạn Body 2 nhé ạ!',
        isRead: true,
        createdAt: new Date(Date.now() - 3600000 * 5),
      },
      {
        conversationId: conv.id,
        senderId: admin.id,
        content: 'Chào Mai! Thầy vừa duyệt bài của em rồi nhé. Bài viết lần này rất chắc chắn, luận cứ sâu và collocation chuẩn. Em đã đạt Band 7.5!',
        isRead: true,
        createdAt: new Date(Date.now() - 3600000 * 4),
      },
      {
        conversationId: conv.id,
        senderId: primaryStudent.id,
        content: 'Dạ em cảm ơn Thầy nhiều ạ! Tối nay em sẽ vào phòng LiveKit đúng giờ để luyện tiếp Speaking Part 2.',
        isRead: false,
        createdAt: new Date(Date.now() - 3600000 * 1),
      },
    ],
  });

  // ==========================================
  // 11. SEED NOTIFICATIONS
  // ==========================================
  console.log('🔔 Seeding System Notifications...');

  await prisma.notification.deleteMany({
    where: { userId: { in: [admin.id, primaryStudent.id] } },
  });

  await prisma.notification.createMany({
    data: [
      // Admin Notifications
      {
        userId: admin.id,
        title: 'Bài viết Writing mới chờ duyệt',
        content: 'Học viên Trần Văn Bảo vừa nộp bài Cambridge 18 Task 2, AI đã phân tích Band 6.5 cần bạn đánh giá và phê duyệt.',
        type: NotificationType.WRITING,
        link: '/admin/writing-review',
        isRead: false,
      },
      {
        userId: admin.id,
        title: 'Bản ghi âm Speaking mới cần chấm điểm',
        content: 'Học viên Trần Văn Bảo đã gửi bản ghi âm Speaking Part 1 đang chờ Thầy nghe và cho điểm chi tiết.',
        type: NotificationType.SPEAKING,
        link: '/admin/speaking-grading',
        isRead: false,
      },
      {
        userId: admin.id,
        title: 'Đăng ký ghi danh khóa học mới chờ duyệt',
        content: 'Học viên Đặng Quốc Huy đã chuyển khoản học phí 4.500.000 VNĐ cho khóa Cambridge IELTS 18 & 19 Academic.',
        type: NotificationType.SYSTEM,
        link: '/admin/courses',
        isRead: false,
      },
      // Student Notifications
      {
        userId: primaryStudent.id,
        title: 'Bài viết IELTS Writing đã được phê duyệt',
        content: 'Thầy Đông đã phê duyệt bài Cambridge 18 Task 2 của bạn đạt Band 7.5 kèm nhận xét chi tiết!',
        type: NotificationType.WRITING,
        link: '/student/writing',
        isRead: false,
      },
      {
        userId: primaryStudent.id,
        title: 'Lớp học trực tuyến WebRTC đang diễn ra',
        content: 'Buổi học LiveKit IELTS Speaking Part 2 Forecast của Thầy Đông đang diễn ra, bấm để tham gia ngay.',
        type: NotificationType.LIVE,
        link: '/student/classroom',
        isRead: false,
      },
    ],
  });

  // ==========================================
  // 12. SEED OFFICIAL BLOG POSTS
  // ==========================================
  console.log('📰 Seeding Official Cambridge Blog Posts...');

  const blogPostsData = [
    {
      title: 'Bí Quyết Nâng Band IELTS Writing Task 2 Từ 6.0 Lên 7.5+ Với Collocation Học Thuật & Lập Luận 4 Đoạn',
      slug: 'nang-band-ielts-writing-task-2-collocation',
      summary: 'Phân tích cách biến đổi câu đơn thành câu phức với cấu trúc nhượng bộ, tận dụng Academic Collocations và phương pháp lập luận 4 đoạn chặt chẽ chuẩn Cambridge.',
      content: `## 1. Nút thắt tại sao nhiều bạn kẹt lại ở Band 6.0 - 6.5?\nRất nhiều học viên ôn thi IELTS chia sẻ rằng dù đã nạp hàng trăm từ vựng "khủng", bài viết Task 2 vẫn chỉ dừng lại ở band 6.0 đến 6.5. Nguyên nhân chủ yếu nằm ở:\n1. Lạm dụng từ hiếm nhưng sai ngữ cảnh.\n2. Luận điểm rời rạc thiếu dẫn chứng cụ thể.\n3. Thiếu Collocations tự nhiên của người bản ngữ.\n\n## 2. Chiến lược 4 đoạn chuẩn mực Cambridge\n- Introduction (40 từ): Paraphrase đề bài + Thesis Statement rõ ràng.\n- Body 1 (90 từ): Triển khai luận điểm 1 + Giải thích + Ví dụ thực tế + Hệ quả.\n- Body 2 (90 từ): Triển khai luận điểm 2 phản biện + Cấu trúc nhượng bộ (While/Although).\n- Conclusion (35 từ): Tóm lược luận điểm và dự báo tương lai.`,
      category: 'IELTS Writing',
      tags: 'IELTS, Writing Task 2, Collocations, Band 7.5',
      coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
      status: BlogStatus.PUBLISHED,
      isFeatured: true,
      viewCount: 1420,
    },
    {
      title: 'Làm Chủ 60 Giây Chuẩn Bị Cue Card IELTS Speaking Part 2 Không Bị Bí Ý Tưởng',
      slug: 'lam-chu-60s-chuan-bi-cue-card-speaking-part-2',
      summary: 'Chiến thuật chia nhánh ý tưởng theo trục Quá Khứ - Hiện Tại - Cảm Xúc để nói liền mạch 2 phút không vấp ngữ pháp và tối ưu tiêu chí Fluency & Coherence.',
      content: `## Thách thức 60 giây trong phòng thi Speaking\nTrong phòng thi IELTS Speaking, bạn chỉ có 60 giây để chuẩn bị cho bài nói 2 phút. Áp dụng ngay quy tắc 3 Trục Thời Gian:\n1. Background & Past (30 giây đầu): Bối cảnh, thời gian, sự việc bắt đầu ra sao?\n2. Current Action & Turning Point (60 giây giữa): Tình huống cao trào và chi tiết ấn tượng nhất.\n3. Personal Reflection & Emotion (30 giây cuối): Bài học rút ra và cảm xúc thay đổi suy nghĩ của bạn.`,
      category: 'IELTS Speaking',
      tags: 'IELTS, Speaking Part 2, Cue Card, Fluency',
      coverImage: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
      status: BlogStatus.PUBLISHED,
      isFeatured: false,
      viewCount: 2150,
    },
    {
      title: 'Chiến Thuật Bắt Keyword & Tránh Bẫy Distractor Trong Cambridge IELTS Listening Part 3',
      slug: 'chien-thuat-bat-keyword-tranh-bay-listening-part-3',
      summary: 'Cách nhận diện từ đồng nghĩa (Paraphrasing) và kỹ năng dự đoán trước loại từ cần điền giúp học viên chinh phục mức điểm 8.0+ Listening.',
      content: `## Quy tắc bắt bẫy Distractor trong Part 3\n1. Gạch chân Change-of-mind Signals: Chú ý cao độ khi nghe thấy các từ nối đảo ý như However, On second thoughts, Actually.\n2. Paraphrase trước các phương án A, B, C trong 30 giây chuẩn bị.\n3. Tuyệt đối không chọn phương án lặp nguyên xi từ ngữ phát ra trong băng, vì 90% đó là bẫy câu giờ.`,
      category: 'IELTS Reading & Listening',
      tags: 'IELTS, Listening, Cambridge, Distractor',
      coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      status: BlogStatus.PUBLISHED,
      isFeatured: false,
      viewCount: 1890,
    },
  ];

  for (const bp of blogPostsData) {
    await prisma.blogPost.upsert({
      where: { slug: bp.slug },
      update: {
        title: bp.title,
        summary: bp.summary,
        content: bp.content,
        category: bp.category,
        tags: bp.tags,
        coverImage: bp.coverImage,
        status: bp.status,
        isFeatured: bp.isFeatured,
        viewCount: bp.viewCount,
      },
      create: {
        ...bp,
        authorId: admin.id,
        publishedAt: new Date(),
      },
    });
  }

  console.log('✅ Successfully seeded full production-grade Cambridge IELTS dataset!');
  console.log('🎓 Ready for full production deployment with authentic API consumption.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
