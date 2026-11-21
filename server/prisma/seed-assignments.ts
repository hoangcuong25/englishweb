import {
  PrismaClient,
  AssignmentDomain,
  EnglishSkill,
  AssignmentType,
  DifficultyLevel,
  AssignmentTargetType,
  AssigneeStatus,
  SubmissionStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

async function seedAdvancedAssignments() {
  console.log('🚀 Seeding comprehensive Assignment Bank & Homework data...');

  // 1. Fetch Admin & Students
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!admin) {
    throw new Error('Admin user not found. Please run main seed first.');
  }

  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    take: 6,
  });

  if (students.length === 0) {
    throw new Error('Students not found. Please run main seed first.');
  }

  const [mai, bao, nam] = students;

  // ==============================================================
  // 2. ASSIGNMENT BANK (NGÂN HÀNG ĐỀ ĐA DẠNG 4 KỸ NĂNG + KỸ NĂNG SỐNG)
  // ==============================================================
  console.log('📚 Seeding Assignment Bank items across all 4 English skills & Personal Dev...');

  // --- 2.1 LISTENING: SECTION 1 FORM COMPLETION ---
  const bankListening1 = await prisma.assignmentBank.upsert({
    where: { id: 'bank-lis-001' },
    update: {},
    create: {
      id: 'bank-lis-001',
      title: 'IELTS Listening Section 1: Homestay Accommodation Booking Form',
      description: 'Luyện kỹ năng nghe bắt thông tin chi tiết (Form Completion): số điện thoại, ngày tháng, địa chỉ và sở thích ăn uống.',
      domain: AssignmentDomain.ENGLISH,
      skill: EnglishSkill.LISTENING,
      type: AssignmentType.LISTENING,
      subType: 'FORM_COMPLETION',
      difficulty: DifficultyLevel.BEGINNER,
      tags: ['IELTS', 'Listening', 'Section 1', 'Form Completion', 'Accommodation'],
      defaultMaxScore: 10,
      estimatedMinutes: 15,
      createdById: admin.id,
      contentPayload: {
        audioUrl: 'https://cdn.englishweb.com/audio/listening/section1_homestay.mp3',
        audioTranscript: 'CLERK: Good morning, Homestay Agency. How can I help you? STUDENT: Hello, I would like to book a homestay for next semester...',
        instructions: 'Write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.',
        formTitle: 'HOMESTAY APPLICATION FORM',
        sections: [
          {
            sectionTitle: 'Personal Details',
            fields: [
              { id: 'q1', label: 'First Name', answer: 'Keiko', explanation: 'Keiko spells her name K-E-I-K-O.' },
              { id: 'q2', label: 'Passport Number', answer: 'J884920', explanation: 'Spoken clearly in conversation.' },
              { id: 'q3', label: 'Contact Phone', answer: '0412899321', explanation: 'Australian mobile number.' },
              { id: 'q4', label: 'Arrival Date', answer: '15th September', explanation: 'Arriving mid September on the 15th.' }
            ]
          },
          {
            sectionTitle: 'Accommodation Preferences',
            fields: [
              { id: 'q5', label: 'Dietary Requirement', answer: 'Vegetarian', explanation: 'Student mentions she does not eat meat.' },
              { id: 'q6', label: 'Preferred Location Near', answer: 'Metro Station', explanation: 'Needs quick transport to university.' }
            ]
          }
        ]
      },
      rubric: {
        scoringType: 'OBJECTIVE_KEY',
        pointsPerItem: 1.66,
        maxScore: 10
      }
    }
  });

  // --- 2.2 LISTENING: SECTION 3 MULTIPLE CHOICE & MATCHING ---
  const bankListening2 = await prisma.assignmentBank.upsert({
    where: { id: 'bank-lis-002' },
    update: {},
    create: {
      id: 'bank-lis-002',
      title: 'IELTS Listening Section 3: Academic Research Methodology Debate',
      description: 'Nghe đối thoại học thuật giữa giảng viên và sinh viên về phương pháp nghiên cứu định tính và định lượng.',
      domain: AssignmentDomain.ENGLISH,
      skill: EnglishSkill.LISTENING,
      type: AssignmentType.LISTENING,
      subType: 'MULTIPLE_CHOICE',
      difficulty: DifficultyLevel.ADVANCED,
      tags: ['IELTS', 'Listening', 'Section 3', 'Multiple Choice', 'Academic'],
      defaultMaxScore: 10,
      estimatedMinutes: 20,
      createdById: admin.id,
      contentPayload: {
        audioUrl: 'https://cdn.englishweb.com/audio/listening/section3_research.mp3',
        instructions: 'Choose the correct letter, A, B, or C.',
        questions: [
          {
            id: 'lis_q1',
            prompt: 'Why did Jack choose to investigate renewable energy consumption?',
            options: [
              { key: 'A', text: 'It was recommended by his supervisor.' },
              { key: 'B', text: 'Recent government policy sparked his curiosity.' },
              { key: 'C', text: 'He had previously worked in the energy industry.' }
            ],
            correctAnswer: 'B',
            explanation: 'Jack states: "When the new green policy was announced last month, I knew I had to dig deeper."'
          },
          {
            id: 'lis_q2',
            prompt: 'What concern does Dr. Miller have regarding the sample size?',
            options: [
              { key: 'A', text: 'The participants are not representative of all age groups.' },
              { key: 'B', text: 'The sample is too large to complete within the timeframe.' },
              { key: 'C', text: 'Access to university databases may be restricted.' }
            ],
            correctAnswer: 'A',
            explanation: 'Dr. Miller warns: "Focusing solely on college undergraduates will heavily skew your conclusions."'
          }
        ]
      }
    }
  });

  // --- 2.3 READING: TRUE / FALSE / NOT GIVEN ---
  const bankReading1 = await prisma.assignmentBank.upsert({
    where: { id: 'bank-read-001' },
    update: {},
    create: {
      id: 'bank-read-001',
      title: 'IELTS Reading Passage 1: The Transformative Era of AI in Education',
      description: 'Luyện kỹ năng Đọc hiểu IELTS: Dạng True / False / Not Given kết hợp kiểm tra từ vựng học thuật.',
      domain: AssignmentDomain.ENGLISH,
      skill: EnglishSkill.READING,
      type: AssignmentType.READING,
      subType: 'TRUE_FALSE_NOT_GIVEN',
      difficulty: DifficultyLevel.INTERMEDIATE,
      tags: ['IELTS', 'Reading', 'AI', 'Education', 'TFNG'],
      defaultMaxScore: 10,
      estimatedMinutes: 20,
      createdById: admin.id,
      contentPayload: {
        passageTitle: 'The Transformative Era of AI in Education',
        passageText: `Over the past decade, artificial intelligence has steadily permeated classroom environments across the globe. From automated grading tools that alleviate educator workloads to sophisticated adaptive learning algorithms that tailor curricula to individual learning paces, machine learning has transitioned from theoretical research to daily pedagogical practice.\n\nEarly sceptics posited that computational systems would diminish the human element in mentorship, rendering pedagogical careers obsolete. However, empirical findings from recent UNESCO studies indicate the converse: AI tools predominantly handle repetitive logistical duties, such as attendance tracking and basic multiple-choice evaluations, thereby liberating teachers to invest more face-to-face hours fostering critical analysis and empathy in their students.\n\nNevertheless, equity challenges persist. Disparities in access to high-speed broadband and state-of-the-art computational hardware threaten to widen the academic chasm between socioeconomic demographics. Until educational institutions democratize technological infrastructure, the full democratizing promise of digital intelligence will remain unfulfilled.`,
        questions: [
          {
            id: 'read_q1',
            prompt: 'AI is currently used only for theoretical research rather than real-world classroom application.',
            questionType: 'TRUE_FALSE_NOT_GIVEN',
            correctAnswer: 'FALSE',
            explanation: 'The passage mentions AI has "transitioned from theoretical research to daily pedagogical practice".'
          },
          {
            id: 'read_q2',
            prompt: 'UNESCO studies revealed that teachers now have more time to cultivate critical thinking skills.',
            questionType: 'TRUE_FALSE_NOT_GIVEN',
            correctAnswer: 'TRUE',
            explanation: 'Text confirms AI liberates teachers "to invest more face-to-face hours fostering critical analysis".'
          },
          {
            id: 'read_q3',
            prompt: 'Governments worldwide have already allocated funding to resolve hardware disparities in rural schools.',
            questionType: 'TRUE_FALSE_NOT_GIVEN',
            correctAnswer: 'NOT GIVEN',
            explanation: 'The passage highlights equity challenges but does not specify whether governments have allocated funding.'
          }
        ]
      }
    }
  });

  // --- 2.4 READING: MATCHING HEADINGS & SUMMARY COMPLETION ---
  const bankReading2 = await prisma.assignmentBank.upsert({
    where: { id: 'bank-read-002' },
    update: {},
    create: {
      id: 'bank-read-002',
      title: 'IELTS Reading Passage 2: Sustainable Urban Architecture & Microclimates',
      description: 'Luyện kỹ năng Nối tiêu đề đoạn văn (Matching Headings) và Điền từ vào đoạn tóm tắt (Summary Completion).',
      domain: AssignmentDomain.ENGLISH,
      skill: EnglishSkill.READING,
      type: AssignmentType.READING,
      subType: 'MATCHING_HEADINGS',
      difficulty: DifficultyLevel.ADVANCED,
      tags: ['IELTS', 'Reading', 'Architecture', 'Sustainability', 'Matching Headings'],
      defaultMaxScore: 10,
      estimatedMinutes: 25,
      createdById: admin.id,
      contentPayload: {
        passageTitle: 'Sustainable Urban Architecture & Microclimates',
        headingsList: [
          { id: 'i', text: 'The thermal insulating role of vertical flora' },
          { id: 'ii', text: 'Ancient civil engineering vs contemporary facades' },
          { id: 'iii', text: 'The phenomenon of urban heat islands explained' },
          { id: 'iv', text: 'Regulatory hurdles in green skyscraper construction' }
        ],
        paragraphs: [
          { id: 'para_A', label: 'Paragraph A', text: 'As metropolitan populations surge, concrete and asphalt surfaces replace permeable earth, trapping solar radiation and creating severe urban heat islands...' },
          { id: 'para_B', label: 'Paragraph B', text: 'To counter escalating temperatures, avant-garde architects are integrating living green walls into high-rise facades, providing natural microclimate cooling...' }
        ],
        questions: [
          { id: 'h_q1', prompt: 'Paragraph A matches heading:', correctAnswer: 'iii' },
          { id: 'h_q2', prompt: 'Paragraph B matches heading:', correctAnswer: 'i' }
        ]
      }
    }
  });

  // --- 2.5 WRITING: IELTS TASK 1 ACADEMIC ---
  const bankWriting1 = await prisma.assignmentBank.upsert({
    where: { id: 'bank-wri-001' },
    update: {},
    create: {
      id: 'bank-wri-001',
      title: 'IELTS Writing Task 1: Renewable Energy Production in 4 European Countries (2010 - 2024)',
      description: 'Phân tích và mô tả biểu đồ cột (Bar Chart) so sánh tỷ lệ sản xuất năng lượng tái tạo qua 14 năm.',
      domain: AssignmentDomain.ENGLISH,
      skill: EnglishSkill.WRITING,
      type: AssignmentType.WRITING,
      subType: 'TASK_1_ACADEMIC',
      difficulty: DifficultyLevel.INTERMEDIATE,
      tags: ['IELTS', 'Writing', 'Task 1', 'Bar Chart', 'Academic'],
      defaultMaxScore: 100,
      estimatedMinutes: 20,
      createdById: admin.id,
      contentPayload: {
        taskType: 'TASK_1',
        minWords: 150,
        maxWords: 220,
        chartImageUrl: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=800&q=80',
        promptText: 'The bar chart illustrates the percentage of electricity generated from renewable sources in Germany, France, Spain, and Sweden between 2010 and 2024.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.',
        suggestedStructure: [
          'Introduction: Paraphrase the prompt statement.',
          'Overview: Highlight Sweden leading throughout the timeframe and Germany showing the most rapid growth.',
          'Body 1: Detailed figures for Germany and Spain.',
          'Body 2: Detailed figures for Sweden and France.'
        ]
      },
      rubric: {
        taskAchievement: 25,
        coherenceAndCohesion: 25,
        lexicalResource: 25,
        grammaticalRangeAndAccuracy: 25
      }
    }
  });

  // --- 2.6 WRITING: IELTS TASK 2 ESSAY ---
  const bankWriting2 = await prisma.assignmentBank.upsert({
    where: { id: 'bank-wri-002' },
    update: {},
    create: {
      id: 'bank-wri-002',
      title: 'IELTS Writing Task 2: Higher Education Purpose — Job Training vs Personal Growth',
      description: 'Bài luận thảo luận 2 mặt (Discussion & Opinion Essay) về mục tiêu của giáo dục đại học.',
      domain: AssignmentDomain.ENGLISH,
      skill: EnglishSkill.WRITING,
      type: AssignmentType.WRITING,
      subType: 'TASK_2_ESSAY',
      difficulty: DifficultyLevel.ADVANCED,
      tags: ['IELTS', 'Writing', 'Task 2', 'Education', 'Opinion'],
      defaultMaxScore: 100,
      estimatedMinutes: 40,
      createdById: admin.id,
      contentPayload: {
        taskType: 'TASK_2',
        minWords: 250,
        maxWords: 350,
        promptText: 'Some people believe that universities should focus purely on providing specialised skills and qualifications for students’ future employment. Others argue that higher education should offer wider intellectual and personal development regardless of career prospects.\n\nDiscuss both views and give your own opinion.',
        enableAIAssessment: true
      },
      rubric: {
        taskResponse: 25,
        coherenceAndCohesion: 25,
        lexicalResource: 25,
        grammaticalRangeAndAccuracy: 25
      }
    }
  });

  // --- 2.7 SPEAKING: PART 2 CUE CARD & PART 3 DISCUSSION ---
  const bankSpeaking1 = await prisma.assignmentBank.upsert({
    where: { id: 'bank-spk-001' },
    update: {},
    create: {
      id: 'bank-spk-001',
      title: 'IELTS Speaking Part 2 & 3: An Influential Mentor or Teacher',
      description: 'Ghi âm bài nói Part 2 (Describe a teacher who inspired you) và trả lời 3 câu hỏi đào sâu ở Part 3.',
      domain: AssignmentDomain.ENGLISH,
      skill: EnglishSkill.SPEAKING,
      type: AssignmentType.SPEAKING,
      subType: 'PART_2_CUE_CARD',
      difficulty: DifficultyLevel.INTERMEDIATE,
      tags: ['IELTS', 'Speaking', 'Part 2', 'Part 3', 'Education', 'Mentorship'],
      defaultMaxScore: 100,
      estimatedMinutes: 15,
      createdById: admin.id,
      contentPayload: {
        part2: {
          cueCardTitle: 'Describe a teacher or mentor who has had a profound impact on your personal or academic development.',
          bulletPoints: [
            'Who this individual was and when you met them',
            'What subject or discipline they taught you',
            'What pedagogical methods made their guidance stand out',
            'Explain how their influence continues to guide your present decisions'
          ],
          prepTimeSeconds: 60,
          recordingTimeSeconds: 120,
          sampleTeacherAudioUrl: 'https://cdn.englishweb.com/audio/speaking/sample_teacher_part2.mp3'
        },
        part3: {
          questions: [
            'How have teaching qualities shifted from traditional chalkboards to online digital instruction?',
            'Do you believe artificial intelligence can ever fully replace human mentors?',
            'Should emotional intelligence be formally evaluated in teacher training certifications?'
          ]
        }
      },
      rubric: {
        fluencyAndCoherence: 25,
        lexicalResource: 25,
        grammaticalRangeAndAccuracy: 25,
        pronunciation: 25
      }
    }
  });

  // --- 2.8 PERSONAL DEVELOPMENT: ACTION PLAN ESSAY & SLIDE ---
  const bankPersonalDev1 = await prisma.assignmentBank.upsert({
    where: { id: 'bank-pdev-001' },
    update: {},
    create: {
      id: 'bank-pdev-001',
      title: 'Kế Hoạch Hành Động (Action Plan): Nâng Cao Năng Lực Giảng Dạy & Quản Trị Lớp Học Hiện Đại',
      description: 'Bài tập thực hành phát triển cá nhân: Xây dựng kế hoạch 90 ngày tối ưu hóa phương pháp sư phạm tương tác.',
      domain: AssignmentDomain.PERSONAL_DEVELOPMENT,
      skill: EnglishSkill.COMPREHENSIVE,
      type: AssignmentType.ESSAY_FILE,
      subType: 'ACTION_PLAN_SLIDE',
      difficulty: DifficultyLevel.ADVANCED,
      tags: ['Kỹ năng sống', 'Phương pháp giảng dạy', 'Phát triển cá nhân', 'Slide thuyết trình'],
      defaultMaxScore: 100,
      estimatedMinutes: 60,
      createdById: admin.id,
      contentPayload: {
        guidelines: 'Học viên trình bày kế hoạch 90 ngày phát triển kỹ năng đứng lớp và ứng dụng công nghệ giáo dục. Nộp bài luận chi tiết kèm slide PowerPoint/PDF.',
        allowedExtensions: ['pdf', 'docx', 'pptx', 'zip'],
        maxFileSizeMb: 25,
        milestones: [
          'Tháng 1: Tối ưu phong thái, giọng nói và ngôn ngữ cơ thể trên lớp học trực tuyến.',
          'Tháng 2: Ứng dụng Gamification và Interactive Whiteboard để kích thích học viên.',
          'Tháng 3: Đo lường tiến độ học viên và xây dựng hệ thống phản hồi hai chiều.'
        ]
      },
      rubric: {
        tinhKhaThiVaChiTiet: 30,
        tinhSangTaoVaUngDung: 30,
        kyNangTrinhBayVaSlide: 40
      }
    }
  });

  console.log('✅ Created 8 rich Assignment Bank records covering 4 English skills & Personal Development!');

  // ==============================================================
  // 3. HOMEWORK ASSIGNMENTS (GIAO BÀI ĐỘC LẬP THEO LIST HỌC SINH)
  // ==============================================================
  console.log('📝 Seeding assigned Homeworks (Decoupled from Courses, assigned to target students)...');

  // Homework 1: Giao bài Writing Task 2 cho Mai & Bảo (Độc lập, không cần courseId)
  const hwWriting = await prisma.homework.upsert({
    where: { id: 'hw-assigned-001' },
    update: {},
    create: {
      id: 'hw-assigned-001',
      title: 'Bài tập tuần: IELTS Writing Task 2 — Mục tiêu giáo dục đại học',
      description: 'Yêu cầu viết tối thiểu 250 từ. Viết trực tiếp trên hệ thống để hệ thống đếm từ và nhận gợi ý chấm điểm từ AI.',
      domain: AssignmentDomain.ENGLISH,
      skill: EnglishSkill.WRITING,
      type: AssignmentType.WRITING,
      subType: 'TASK_2_ESSAY',
      targetType: AssignmentTargetType.SPECIFIC_STUDENTS,
      assignmentBankId: bankWriting2.id,
      configPayload: bankWriting2.contentPayload,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 ngày tới
      maxScore: 100,
      createdById: admin.id,
      assignees: {
        create: [
          { studentId: mai.id, status: AssigneeStatus.GRADED },
          { studentId: bao.id, status: AssigneeStatus.SUBMITTED }
        ]
      }
    }
  });

  // Homework 2: Giao bài Speaking Part 2 cho Mai, Bảo, Nam (Độc lập, có ghi âm)
  const hwSpeaking = await prisma.homework.upsert({
    where: { id: 'hw-assigned-002' },
    update: {},
    create: {
      id: 'hw-assigned-002',
      title: 'Bài tập tuần: IELTS Speaking Part 2 — Describe an influential teacher',
      description: 'Bật micro trực tiếp trên trang bài tập để ghi âm tối đa 2 phút. Lắng nghe lại trước khi bấm nộp bài.',
      domain: AssignmentDomain.ENGLISH,
      skill: EnglishSkill.SPEAKING,
      type: AssignmentType.SPEAKING,
      subType: 'PART_2_CUE_CARD',
      targetType: AssignmentTargetType.SPECIFIC_STUDENTS,
      assignmentBankId: bankSpeaking1.id,
      configPayload: bankSpeaking1.contentPayload,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      maxScore: 100,
      createdById: admin.id,
      assignees: {
        create: [
          { studentId: mai.id, status: AssigneeStatus.SUBMITTED },
          { studentId: bao.id, status: AssigneeStatus.PENDING },
          { studentId: nam.id, status: AssigneeStatus.PENDING }
        ]
      }
    }
  });

  // Homework 3: Giao bài Listening Form Completion cho toàn bộ học sinh (Auto-grading)
  const hwListening = await prisma.homework.upsert({
    where: { id: 'hw-assigned-003' },
    update: {},
    create: {
      id: 'hw-assigned-003',
      title: 'Luyện nghe phản xạ: IELTS Listening Section 1 Booking Form',
      description: 'Nghe file audio và điền vào các ô trống. Hệ thống sẽ tự động chấm điểm và công bố đáp án ngay sau khi nộp.',
      domain: AssignmentDomain.ENGLISH,
      skill: EnglishSkill.LISTENING,
      type: AssignmentType.LISTENING,
      subType: 'FORM_COMPLETION',
      targetType: AssignmentTargetType.SPECIFIC_STUDENTS,
      assignmentBankId: bankListening1.id,
      configPayload: bankListening1.contentPayload,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      maxScore: 10,
      createdById: admin.id,
      assignees: {
        create: [
          { studentId: mai.id, status: AssigneeStatus.PENDING },
          { studentId: nam.id, status: AssigneeStatus.PENDING }
        ]
      }
    }
  });

  // Homework 4: Giao bài Kế hoạch hành động Phát triển cá nhân
  const hwPersonalDev = await prisma.homework.upsert({
    where: { id: 'hw-assigned-004' },
    update: {},
    create: {
      id: 'hw-assigned-004',
      title: 'Đồ án cá nhân: Kế hoạch 90 ngày nâng cao năng lực sư phạm & giảng dạy',
      description: 'Học sinh viết bản báo cáo và tải file slide (PDF/PPTX) trình bày mục tiêu cá nhân.',
      domain: AssignmentDomain.PERSONAL_DEVELOPMENT,
      skill: EnglishSkill.COMPREHENSIVE,
      type: AssignmentType.ESSAY_FILE,
      subType: 'ACTION_PLAN_SLIDE',
      targetType: AssignmentTargetType.SPECIFIC_STUDENTS,
      assignmentBankId: bankPersonalDev1.id,
      configPayload: bankPersonalDev1.contentPayload,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      maxScore: 100,
      createdById: admin.id,
      assignees: {
        create: [
          { studentId: mai.id, status: AssigneeStatus.PENDING },
          { studentId: bao.id, status: AssigneeStatus.PENDING }
        ]
      }
    }
  });

  // ==============================================================
  // 4. SUBMISSIONS & GRADING (BÀI NỘP VÀ CHẤM ĐIỂM THỰC TẾ)
  // ==============================================================
  console.log('✍️ Seeding realistic Submissions with detailed Teacher feedback & Criteria scores...');

  // 4.1 Mai đã nộp và được chấm bài Writing Task 2 (Band 7.5)
  await prisma.homeworkSubmission.upsert({
    where: {
      homeworkId_studentId: {
        homeworkId: hwWriting.id,
        studentId: mai.id
      }
    },
    update: {},
    create: {
      homeworkId: hwWriting.id,
      studentId: mai.id,
      content: `In modern society, there is an ongoing debate regarding the principal mandate of tertiary institutions. While a substantial demographic contends that universities should focus purely on career readiness and employability qualifications, another faction posits that higher learning should transcend occupational utility to nurture intellectual curiosity and holistic personal character. In this essay, I will explore both perspectives before elucidating my belief that higher education must harmonize both dimensions.\n\nOn the one hand, proponents of professional specialization argue that escalating tuition fees mandate tangible economic returns. Graduates burdened with academic debt require vocational competencies that align immediately with industry demands, particularly in STEM fields such as computer engineering and clinical medicine. When curricula mirror market requirements, national productivity thrives and structural unemployment diminishes.\n\nOn the other hand, defenders of broader intellectual cultivation emphasize that higher education has historically shaped enlightened citizens capable of ethical discernment. Universities that cultivate philosophical inquiry and critical discourse foster leaders who can navigate unprecedented dilemmas, such as the ethical deployment of artificial intelligence. Confining education exclusively to corporate skills risks breeding technocrats destitute of moral vision.\n\nIn conclusion, while vocational pragmatism is undeniably vital for societal stability, intellectual growth represents the bedrock of civilization. Therefore, modern academic curricula ought to synergistically synthesize rigorous specialized training with extensive humanities programs.`,
      score: 85,
      feedback: 'Bài viết rất xuất sắc! Lập luận chặt chẽ, cấu trúc câu đa dạng và từ vựng học thuật phong phú (elucidating, tangible economic returns, moral vision, bedrock of civilization). Khả năng cân bằng giữa hai luận điểm rất thuyết phục.',
      criteriaScores: {
        taskResponse: 8.0,
        coherenceAndCohesion: 8.5,
        lexicalResource: 8.5,
        grammaticalRangeAndAccuracy: 8.0,
        overallBand: 8.0
      },
      status: SubmissionStatus.GRADED,
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      gradedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  });

  // 4.2 Bảo đã nộp bài Writing Task 2 (Đang chờ chấm)
  await prisma.homeworkSubmission.upsert({
    where: {
      homeworkId_studentId: {
        homeworkId: hwWriting.id,
        studentId: bao.id
      }
    },
    update: {},
    create: {
      homeworkId: hwWriting.id,
      studentId: bao.id,
      content: `Many people think university should only teach students skills to get a good job in the future. However, other people think that university is a place to develop character, discover passions, and build social relationships.\n\nFirstly, getting a stable job is very important for every student after graduation because they need money to live and help their families. If university does not teach practical knowledge, it is hard to find employment.\n\nSecondly, developing soft skills such as teamwork, leadership and communication is also necessary. A good student should not only know technical skills but also how to behave with colleagues.\n\nIn my opinion, universities should balance between career training and personal growth to help students succeed in life.`,
      status: SubmissionStatus.PENDING,
      submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
    }
  });

  // 4.3 Mai đã nộp bài Speaking Part 2 kèm audio URL
  await prisma.homeworkSubmission.upsert({
    where: {
      homeworkId_studentId: {
        homeworkId: hwSpeaking.id,
        studentId: mai.id
      }
    },
    update: {},
    create: {
      homeworkId: hwSpeaking.id,
      studentId: mai.id,
      audioUrl: 'https://cdn.englishweb.com/audio/submissions/student_mai_part2_mentor.mp3',
      content: 'Bản ghi âm 2 phút của em về cô giáo dạy Văn cấp 3 đã truyền cảm hứng đọc sách và tư duy phản biện cho em.',
      status: SubmissionStatus.PENDING,
      submittedAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
    }
  });

  console.log('🎉 Seed completed successfully! All 4 skills, Bank items, Homeworks, and Submissions are active in MySQL.');
}

seedAdvancedAssignments()
  .catch((e) => {
    console.error('❌ Error seeding advanced assignments:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
