import {
  PrismaClient,
  Role,
  CourseCategory,
  QuestionType,
  SkillType,
  NotificationType,
  BlogStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const passwordHashAdmin = await bcrypt.hash('Admin@123456', 10);
  const passwordHashStudent = await bcrypt.hash('Student@123456', 10);

  // 1. Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@englishweb.com' },
    update: {},
    create: {
      email: 'admin@englishweb.com',
      passwordHash: passwordHashAdmin,
      fullName: 'Teacher & Admin Master',
      phone: '0987654321',
      role: Role.ADMIN,
      isActive: true,
    },
  });
  console.log(`✅ Seeded Admin: ${admin.email}`);

  // 2. Create Sample Student
  const student = await prisma.user.upsert({
    where: { email: 'student@englishweb.com' },
    update: {},
    create: {
      email: 'student@englishweb.com',
      passwordHash: passwordHashStudent,
      fullName: 'Nguyen Thi Mai',
      phone: '0912345678',
      role: Role.STUDENT,
      isActive: true,
    },
  });
  console.log(`✅ Seeded Student: ${student.email}`);

  // 3. Create Sample IELTS Course
  const course = await prisma.course.upsert({
    where: { slug: 'ielts-masterclass-band-7' },
    update: {},
    create: {
      title: 'IELTS Comprehensive Masterclass (Target 7.0+)',
      slug: 'ielts-masterclass-band-7',
      description: 'Chương trình đào tạo toàn diện 4 kỹ năng Nghe - Nói - Đọc - Viết với giáo trình chuẩn Cambridge và lớp học trực tuyến.',
      category: CourseCategory.IELTS,
      isPublished: true,
      thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop',
    },
  });

  // 4. Create Module 1
  const module1 = await prisma.courseModule.create({
    data: {
      courseId: course.id,
      title: 'Module 1: IELTS Speaking & Listening Foundations',
      description: 'Luyện phát âm chuẩn IPA, chiến thuật trả lời Speaking Part 1 & phương pháp Take Notes Listening',
      orderIndex: 1,
    },
  });

  // 5. Create Lesson 1
  const lesson1 = await prisma.lesson.create({
    data: {
      moduleId: module1.id,
      title: 'Lesson 1: Introduction to IELTS Speaking Part 1 & Fluency',
      description: 'Khái quát tiêu chí chấm điểm IELTS Speaking (FC, LR, GRA, PR) và các dạng câu hỏi thường gặp.',
      orderIndex: 1,
      durationMinutes: 60,
      isFreePreview: true,
    },
  });

  // 6. Create Quiz for Lesson 1
  const quiz1 = await prisma.quiz.create({
    data: {
      lessonId: lesson1.id,
      title: 'Quick Assessment: IELTS Speaking Part 1 Rules',
      description: 'Kiểm tra độ hiểu về thời gian và tiêu chí đánh giá band điểm.',
      timeLimitMinutes: 10,
      passScore: 70,
    },
  });

  const q1 = await prisma.question.create({
    data: {
      quizId: quiz1.id,
      content: 'How long should a standard answer for IELTS Speaking Part 1 ideally be?',
      type: QuestionType.SINGLE_CHOICE,
      points: 2.0,
      explanation: 'Answers should be 2 to 4 sentences (approx 15-25 seconds), directly addressing the question with expansion.',
      orderIndex: 1,
    },
  });

  await prisma.questionOption.createMany({
    data: [
      { questionId: q1.id, content: '1 word (Yes/No)', isCorrect: false },
      { questionId: q1.id, content: '2-4 sentences with explanation/example', isCorrect: true },
      { questionId: q1.id, content: 'At least 2 minutes uninterrupted speech', isCorrect: false },
      { questionId: q1.id, content: 'As long as possible until examiner stops you', isCorrect: false },
    ],
  });

  // 6b. Official IELTS Academic Reading Mock Test
  const readingMock = await prisma.quiz.create({
    data: {
      lessonId: lesson1.id,
      title: 'IELTS Academic Reading Mock Test: The Architecture of Sustainable Smart Cities',
      description: 'Mô phỏng đề thi Cambridge Reading chia đôi màn hình chuẩn thi thật kèm bài đọc dài.',
      skill: SkillType.READING,
      testType: 'FULL_MOCK_TEST',
      passage: `READING PASSAGE 1: THE ARCHITECTURE OF SUSTAINABLE SMART CITIES\n\nParagraph A: Over the past two decades, the conceptual paradigm of urban development has pivoted drastically towards environmental sustainability...\n\nParagraph B: One of the pioneering manifestations of this architectural evolution is the Bosco Verticale (Vertical Forest) in Milan, Italy...\n\nParagraph C: Despite these celebrated ecological dividends, structural engineers underscore substantial technical and logistical liabilities...`,
      timeLimitMinutes: 20,
      passScore: 80,
    },
  });

  const rq1 = await prisma.question.create({
    data: {
      quizId: readingMock.id,
      content: 'Which heading corresponds to the main idea of Paragraph A?',
      type: QuestionType.MATCHING_HEADINGS,
      skill: SkillType.READING,
      points: 2.0,
      explanation: 'Đoạn A khái quát các áp lực môi trường và giới thiệu triết lý biophilic architecture.',
      orderIndex: 1,
    },
  });
  await prisma.questionOption.createMany({
    data: [
      { questionId: rq1.id, content: 'i. Financial obstacles and equity challenges', isCorrect: false },
      { questionId: rq1.id, content: 'ii. Urgent environmental pressures driving biological city planning', isCorrect: true },
      { questionId: rq1.id, content: 'iii. Maintenance hurdles and water system mechanics', isCorrect: false },
    ],
  });

  const rq2 = await prisma.question.create({
    data: {
      quizId: readingMock.id,
      content: 'According to Paragraph B, the foliage on the Milan towers reduces incoming traffic noise by 25 decibels.',
      type: QuestionType.TRUE_FALSE_NOT_GIVEN,
      skill: SkillType.READING,
      points: 2.0,
      explanation: 'Đoạn B nêu rõ: "foliage dampens external traffic resonance by approximately 25 decibels" -> TRUE.',
      orderIndex: 2,
    },
  });
  await prisma.questionOption.createMany({
    data: [
      { questionId: rq2.id, content: 'TRUE', isCorrect: true },
      { questionId: rq2.id, content: 'FALSE', isCorrect: false },
      { questionId: rq2.id, content: 'NOT GIVEN', isCorrect: false },
    ],
  });

  // 6c. Official IELTS Listening Mock Test
  const listeningMock = await prisma.quiz.create({
    data: {
      lessonId: lesson1.id,
      title: 'IELTS Listening Mock Test: University Campus Accommodation & Facilities Registration',
      description: 'Mô phỏng đề thi Cambridge Listening kèm audio player trực quan và phân loại dạng câu hỏi.',
      skill: SkillType.LISTENING,
      testType: 'FULL_MOCK_TEST',
      audioUrl: 'https://actions.google.com/sounds/v1/ambiences/office_room_tone.ogg',
      timeLimitMinutes: 15,
      passScore: 80,
    },
  });

  const lq1 = await prisma.question.create({
    data: {
      quizId: listeningMock.id,
      content: 'Complete the student registration card with NO MORE THAN TWO WORDS: "Hall of Residence preference: _______ Hall"',
      type: QuestionType.NOTE_COMPLETION,
      skill: SkillType.LISTENING,
      points: 2.0,
      explanation: 'Sinh viên đăng ký tại khu ký túc xá Westlake Hall.',
      orderIndex: 1,
    },
  });
  await prisma.questionOption.create({
    data: { questionId: lq1.id, content: 'Westlake', isCorrect: true },
  });

  // 7. Create Speaking Prompt for Lesson 1
  await prisma.speakingPrompt.create({
    data: {
      lessonId: lesson1.id,
      title: 'Speaking Part 1: Talk about your Hometown',
      topic: 'Describe the town or city where you grew up. Mention what you like most about it and whether you would like to live there in the future.',
      minSeconds: 30,
      maxSeconds: 90,
    },
  });

  // 8. Enroll student
  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: student.id,
        courseId: course.id,
      },
    },
    update: {},
    create: {
      userId: student.id,
      courseId: course.id,
      progressPercent: 25.0,
    },
  });

  // 9. Seed Initial Notifications
  await prisma.notification.deleteMany({
    where: { userId: { in: [admin.id, student.id] } },
  });

  await prisma.notification.createMany({
    data: [
      // Admin Notifications
      {
        userId: admin.id,
        title: 'Bài viết Writing mới chờ duyệt',
        content: 'Học viên Nguyen Thi Mai vừa nộp bài Task 1, AI đã chấm gợi ý Band 6.5 cần bạn phê duyệt.',
        type: NotificationType.WRITING,
        link: '/admin/writing-review',
        isRead: false,
      },
      {
        userId: admin.id,
        title: 'Bài nói Speaking mới cần chấm',
        content: 'Học viên Tran Van Bao đã gửi bản ghi âm Speaking Part 1 chờ bạn nghe và cho điểm.',
        type: NotificationType.SPEAKING,
        link: '/admin/speaking-grading',
        isRead: false,
      },
      {
        userId: admin.id,
        title: 'Báo cáo điểm danh sẵn sàng',
        content: 'Dữ liệu chuyên cần buổi học LiveKit gần nhất đã tự động đồng bộ và sẵn sàng xuất Excel.',
        type: NotificationType.LIVE,
        link: '/admin/attendance',
        isRead: false,
      },
      {
        userId: admin.id,
        title: 'Học viên hoàn thành chẩn đoán 4 kỹ năng',
        content: 'Học viên Le Hoang Nam đã hoàn thành bài thi thử, xem biểu đồ phân tích kỹ năng yếu.',
        type: NotificationType.QUIZ,
        link: '/admin/quizzes',
        isRead: true,
      },
      // Student Notifications
      {
        userId: student.id,
        title: 'Bài viết IELTS Writing đã duyệt',
        content: 'Giáo viên đã phê duyệt bài Task 2 "Technology in Education" của bạn đạt Band 7.0!',
        type: NotificationType.WRITING,
        link: '/student/writing',
        isRead: false,
      },
      {
        userId: student.id,
        title: 'Lớp học trực tuyến sắp bắt đầu',
        content: 'Buổi học LiveKit IELTS Speaking của Thầy Đông sẽ diễn ra lúc 19:30 tối nay.',
        type: NotificationType.LIVE,
        link: '/student/classroom',
        isRead: false,
      },
    ],
  });
  // 6. Seed Blog Posts
  const blogPostsData = [
    {
      title: 'Bí Quyết Nâng Band IELTS Writing Task 2 Từ 6.0 Lên 7.5+ Với Collocation Học Thuật & Lập Luận 4 Đoạn',
      slug: 'nang-band-ielts-writing-task-2-collocation',
      summary: 'Phân tích cách biến đổi câu đơn thành câu phức với cấu trúc nhượng bộ, tận dụng Academic Collocations và phương pháp lập luận 4 đoạn chặt chẽ chuẩn Cambridge.',
      content: `## 1. Nút thắt tại sao nhiều bạn kẹt lại ở Band 6.0 - 6.5?
Rất nhiều học viên ôn thi IELTS chia sẻ rằng dù đã nạp hàng trăm từ vựng "khủng", bài viết Task 2 vẫn chỉ dừng lại ở band 6.0 đến 6.5. Nguyên nhân chủ yếu nằm ở:
1. **Lạm dụng từ hiếm nhưng sai ngữ cảnh (Inappropriate Word Choice)**: Đưa từ đao to búa lớn vào nhưng không ăn nhập với văn phong học thuật.
2. **Luận điểm rời rạc (Lack of Cohesion)**: Liệt kê quá nhiều ý tưởng nhưng không triển khai sâu vào dẫn chứng và hệ quả.
3. **Thiếu Collocations tự nhiên**: Tiếng Anh của người bản xứ dựa vào các cụm từ đi liền nhau một cách tự nhiên.

## 2. Chiến lược bài viết 4 đoạn chặt chẽ chuẩn Cambridge
Cấu trúc 4 đoạn là công thức tối ưu giúp bạn hoàn thành bài viết 260-280 từ trong vòng 40 phút mà không bị cháy giờ:

- **Introduction (Khoảng 40 từ)**:
  - Câu 1: Paraphrase lại đề bài bằng cấu trúc bị động hoặc mệnh đề quan hệ.
  - Câu 2 (Thesis Statement): Khẳng định dứt khoát lập trường của bạn.
- **Body Paragraph 1 (Khoảng 90 từ)**:
  - Topic Sentence: Nêu luận điểm cốt lõi thứ nhất.
  - Explanation: Giải thích tại sao hiện tượng/nguyên nhân này lại diễn ra.
  - Concrete Example: Đưa dẫn chứng thực tế hoặc nghiên cứu xã hội.
  - Consequence: Chốt lại tác động.
- **Body Paragraph 2 (Khoảng 90 từ)**:
  - Mở rộng khía cạnh phản biện hoặc giải pháp đối ứng.
  - Áp dụng cấu trúc câu điều kiện loại 2/3 hoặc mệnh đề nhượng bộ (*While/Although/Despite*).
- **Conclusion (Khoảng 35 từ)**:
  - Tóm lược lại các luận điểm đã nêu bằng từ vựng khác biệt và đưa ra dự báo tương lai.

## 3. Nâng cấp bộ Academic Collocations thường gặp
- Thay vì dùng: *a big problem* -> Sử dụng: *a pressing issue* hoặc *an acute dilemma*
- Thay vì dùng: *solve the problem* -> Sử dụng: *mitigate the negative ramifications* hoặc *address the root cause*
- Thay vì dùng: *people think that* -> Sử dụng: *it is widely contended that* hoặc *advocates argue that*

## 4. Tận dụng AI Writing Evaluation tại Teacher Dong Academy
Tại hệ thống của Teacher Dong Academy, mọi bài làm Writing của bạn đều được AI chấm gợi ý 4 tiêu chí IELTS trong vài giây, sau đó được Thầy Đông trực tiếp duyệt, nhận xét chi tiết từng câu và chỉnh sửa cách dùng từ để đảm bảo bạn tiến bộ vững chắc!`,
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
      content: `## Thách thức lớn nhất trong Speaking Part 2
Trong phòng thi IELTS Speaking, bạn chỉ có vỏn vẹn **60 giây** với một tờ giấy nháp nhỏ và một cây bút chì để chuẩn bị cho bài nói kéo dài 2 phút. Rất nhiều thí sinh gặp phải tình trạng:
- Viết thành cả câu hoàn chỉnh dẫn tới hết giờ mà mới nháp được 1-2 ý.
- Nói được 1 phút là hết ý, nhìn giám khảo trong im lặng ngượng ngùng.
- Lúng túng ngữ pháp do không định hình trước thì của động từ.

## Quy tắc 3 Trục Thời Gian: Quá Khứ - Hiện Tại - Cảm Xúc (Past - Present - Emotion)
Để không bao giờ cạn ý tưởng, hãy chia mẩu giấy nháp làm 3 phần:
1. **Background & Past (30 giây đầu của bài nói)**: Sự việc bắt đầu như thế nào? Bối cảnh, thời gian, địa điểm, ai tham gia cùng bạn?
2. **Current Action & Turning Point (60 giây tiếp theo)**: Điều gì thú vị nhất đã xảy ra? Tình huống cao trào hoặc kỷ niệm đáng nhớ nhất?
3. **Personal Reflection & Emotion (30 giây cuối)**: Bạn rút ra bài học gì? Tại sao trải nghiệm này lại thay đổi suy nghĩ của bạn?

## Luyện tập thực tế cùng Speaking Studio
Với công cụ thu âm hiển thị dạng sóng âm thời gian thực trên nền tảng Teacher Dong Academy, bạn có thể tự đo lường độ dài bài nói, kiểm tra sự trôi chảy và nhận phản hồi chấm điểm 4 tiêu chí kèm timestamp cụ thể từ Thầy Đông!`,
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
      content: `## Tại sao Listening Part 3 lại là "nỗi ám ảnh" của thí sinh?
IELTS Listening Part 3 thường là một cuộc thảo luận học thuật giữa 2-3 sinh viên hoặc sinh viên với giáo sư. Đặc điểm của phần này:
- **Tốc độ nói nhanh và tự nhiên**: Nhiều trường đoạn nói chêm xen kẽ, ngắt lời.
- **Rất nhiều bẫy Distractor**: Người nói thường đưa ra một lựa chọn, rồi ngay sau đó phủ định (*"Actually, I changed my mind..."* hoặc *"Wait, that was true last year, but now..."*).

## Các bước xử lý Part 3 như cao thủ
1. **Gạch chân Change-of-mind Signals**: Luôn tập trung cao độ khi nghe thấy các từ nối đảo ý như *However, On second thoughts, But, In reality*.
2. **Paraphrase trước các phương án A, B, C**: Khi có 30 giây chuẩn bị, hãy tìm ngay từ đồng nghĩa của các danh từ và tính từ chính trong đề.
3. **Không bao giờ chọn phương án lặp nguyên từ nghe được**: Trong 90% trường hợp, từ ngữ vang lên y hệt trong băng chính là mồi câu bẫy!`,
      category: 'IELTS Reading & Listening',
      tags: 'IELTS, Listening, Cambridge, Distractor',
      coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      status: BlogStatus.PUBLISHED,
      isFeatured: false,
      viewCount: 1890,
    },
    {
      title: 'Hành Trình Giao Thoa Văn Hóa & Nuôi Dưỡng Tư Duy Công Dân Toàn Cầu',
      slug: 'hanh-trinh-giao-thoa-van-hoa-tu-duy-toan-cau',
      summary: 'Những bài học thực tế về giao tiếp đa văn hóa, vượt qua rào cản sốc văn hóa và cách xây dựng sự tự tin khi sinh sống, học tập tại môi trường quốc tế.',
      content: `## Tiếng Anh không chỉ là bài thi – Tiếng Anh là cánh cửa thế giới
Sau nhiều năm giảng dạy và đồng hành cùng hàng ngàn học viên du học khắp Anh, Úc, Mỹ, Canada, Thầy Đông nhận ra rằng: **Điểm số IELTS chỉ là chiếc vé thông hành, nhưng năng lực giao tiếp và tư duy liên văn hóa mới là chìa khóa quyết định sự thành công.**

## 3 Kỹ năng mềm giúp bạn hòa nhập tức thì
1. **Active Listening & Empathy (Lắng nghe thấu cảm)**: Trong môi trường đa quốc gia, ngữ điệu và văn hóa diễn đạt khác nhau rất nhiều. Đừng vội phán xét, hãy lắng nghe với sự tôn trọng.
2. **Body Language & Eye Contact**: Giao tiếp bằng mắt thể hiện sự tự tin và chân thành trong văn hóa phương Tây.
3. **Embracing Diversity (Mở lòng đón nhận sự khác biệt)**: Đừng ngại thử những món ăn mới, tham gia các lễ hội truyền thống bản xứ và kết bạn với những người đến từ các nền văn hóa khác nhau.`,
      category: 'Văn hóa & Đời sống',
      tags: 'Culture, Du học, Tư duy toàn cầu, Tiếng Anh đời sống',
      coverImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
      status: BlogStatus.PUBLISHED,
      isFeatured: false,
      viewCount: 960,
    },
    {
      title: 'Phương Pháp Spaced Repetition Kết Hợp Active Recall Giúp Ghi Nhớ 1000 Từ Vựng IELTS Sau 30 Ngày',
      slug: 'spaced-repetition-active-recall-ghi-nho-tu-vung-ielts',
      summary: 'Ứng dụng nguyên lý đường cong lãng quên Ebbinghaus vào việc học từ vựng IELTS, chuyển hóa thụ động sang chủ động qua chu kỳ lặp lại ngắt quãng.',
      content: `## Tại sao chúng ta hay học trước quên sau?
Nhà tâm lý học người Đức Hermann Ebbinghaus đã chứng minh rằng: **Chỉ sau 24 giờ, não bộ con người có xu hướng quên tới 70% lượng thông tin mới nạp** nếu không có sự gợi nhắc đúng lúc.

## Bộ đôi phương pháp học tập khoa học đỉnh cao
1. **Active Recall (Chủ động truy hồi)**: Thay vì đọc đi đọc lại thụ động một danh sách từ vựng, hãy đặt câu hỏi và tự buộc não bộ phải tìm kiếm câu trả lời trước khi lật đáp án.
2. **Spaced Repetition (Lặp lại ngắt quãng)**: Ôn tập lại từ vựng theo các khoảng thời gian tăng dần: Ngày 1, Ngày 3, Ngày 7, Ngày 14 và Ngày 30.

Bằng cách áp dụng phương pháp này vào hệ thống học tập tại Teacher Dong Academy, học viên có thể nâng cao tốc độ ghi nhớ từ vựng lên gấp 3 lần và duy trì khả năng sử dụng từ trong bài thi thực tế!`,
      category: 'Phương pháp học',
      tags: 'Spaced Repetition, Active Recall, Từ vựng IELTS, Học thông minh',
      coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
      status: BlogStatus.PUBLISHED,
      isFeatured: true,
      viewCount: 3120,
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
  console.log(`✅ Seeded ${blogPostsData.length} High-Quality Blog Posts for Teacher Dong Academy`);

  console.log('🚀 Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
