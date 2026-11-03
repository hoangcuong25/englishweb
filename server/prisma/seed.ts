import { PrismaClient, Role, CourseCategory, QuestionType } from '@prisma/client';
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
