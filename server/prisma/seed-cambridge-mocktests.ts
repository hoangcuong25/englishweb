import { PrismaClient, CourseCategory, SkillType, QuestionType } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCambridgeMockTests() {
  console.log('--- SEEDING AUTHENTIC CAMBRIDGE IELTS MOCK TESTS ---');

  // 1. CAMBRIDGE IELTS 20 - ACADEMIC READING TEST 1 (3 PASSAGES)
  const readingSections = [
    {
      part: 1,
      title: 'Passage 1: Urban Microclimates and Sustainable Architecture',
      questionRange: 'Questions 1 - 8',
      imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1000&q=80',
      instructions: 'You should spend about 20 minutes on Questions 1-8, which are based on Reading Passage 1.',
      passage: `READING PASSAGE 1: URBAN MICROCLIMATES AND SUSTAINABLE ARCHITECTURE

Paragraph A: Over the past two decades, metropolitan hubs worldwide have experienced intensified microclimatic anomalies known as Urban Heat Islands (UHI). Dense concrete infrastructure, asphalt surfaces, and anthropogenic heat emissions cause metropolitan temperatures to exceed surrounding rural baselines by up to 5 to 8 degrees Celsius during peak summer seasons.

Paragraph B: To mitigate these climatic challenges, contemporary civil engineers and architects are pioneering "biophilic building engineering." A notable prototype is the vertical botanical facade, incorporating indigenous foliage directly onto cantilevered building balconies. Plants act as organic thermal insulators and evaporative cooling units, reducing ambient surface temperatures by absorbing solar radiation.

Paragraph C: Automated IoT sensor arrays placed across structural elevations continuously evaluate micro-environmental parameters, including relative humidity, particulate concentration, and ambient airflow. These sensors relay real-time telemetry to central municipal management platforms, dynamically controlling misting nozzles and solar louvers to stabilize local microclimates.

Paragraph D: Despite these demonstrated technological advantages, the broad-scale implementation of biophilic facades faces several hurdles. Chief among these is the ongoing maintenance cost associated with automated drip-irrigation networks, as well as structural considerations regarding the dynamic weight of hydrated soil and mature root networks.`,
    },
    {
      part: 2,
      title: 'Passage 2: The Acoustic Communication of Cetaceans',
      questionRange: 'Questions 9 - 14',
      imageUrl: 'https://images.unsplash.com/photo-1568430462989-44163eb1752f?auto=format&fit=crop&w=1000&q=80',
      instructions: 'You should spend about 20 minutes on Questions 9-14, which are based on Reading Passage 2.',
      passage: `READING PASSAGE 2: THE ACOUSTIC COMMUNICATION OF CETACEANS

Paragraph A: Marine biologists have long been fascinated by the complex vocalizations emitted by cetaceans—whales, dolphins, and porpoises. In aquatic environments where sunlight penetrates only a few hundred meters, acoustic transmission serves as the primary sensory modality for navigation, foraging, and social cohesion across vast ocean basins.

Paragraph B: Baleen whales produce low-frequency infrasonic pulses capable of traveling thousands of kilometers across deep ocean channels known as SOFAR (Sound Fixing and Ranging) layers. These acoustic highways allow individuals to communicate across entire ocean basins, coordinating migratory trajectories and mating rituals without visual contact.

Paragraph C: Conversely, toothed odontocetes rely heavily on high-frequency biosonar clicks for echolocation. By projecting ultrasonic beam patterns through their lipid-rich melon organs, dolphins can construct three-dimensional auditory maps of their immediate surroundings, resolving prey items as small as a copper coin buried beneath benthic sand.

Paragraph D: Over the past half-century, commercial container shipping, naval sonar exercises, and offshore seismic exploration have introduced unprecedented acoustic pollution into the marine environment. Elevated ambient noise levels compress the effective communication range of cetaceans, inducing chronic stress and contributing to mass stranding phenomena.`,
    },
    {
      part: 3,
      title: 'Passage 3: Neuroplasticity in Adult Language Acquisition',
      questionRange: 'Questions 15 - 20',
      instructions: 'You should spend about 20 minutes on Questions 15-20, which are based on Reading Passage 3.',
      passage: `READING PASSAGE 3: NEUROPLASTICITY IN ADULT LANGUAGE ACQUISITION

Paragraph A: Classical neurological paradigms posited that human cognitive architecture underwent structural calcification following puberty, effectively terminating the critical window for second-language mastery. However, contemporary neuroimaging technologies, specifically functional magnetic resonance imaging (fMRI) and diffusion tensor tractography, have dismantled this dogma by revealing remarkable degrees of structural and functional plasticity in the adult brain.

Paragraph B: When adult learners engage in intensive target-language immersion, quantitative increases in grey-matter volume are observable within the left inferior frontal gyrus—a cortical region encompassing Broca's area. Simultaneously, myelination along the arcuate fasciculus, the white-matter tract connecting receptive and expressive language centers, exhibits measurable enhancement within twelve weeks of deliberate practice.

Paragraph C: Crucially, researchers underscore that adult neuroplasticity operates via distinct compensatory mechanisms compared to infant acquisition. Whereas infants acquire phonemic inventories passively via statistical distribution learning, adults must recruit conscious executive control networks mediated by the dorsolateral prefrontal cortex. This meta-linguistic scaffolding allows adult learners to synthesize syntactical abstractions systematically.

Paragraph D: Future pedagogical frontiers envision combining personalized spaced-repetition software with non-invasive transcranial electrical stimulation (tES) to transiently enhance cortical excitability during vocabulary encoding. Early clinical trials indicate a 35 percent acceleration in long-term retention compared to traditional rote memorization frameworks.`,
    },
  ];

  // Upsert Reading Quiz
  const readingQuiz = await prisma.quiz.upsert({
    where: { id: 'cambridge-reading-mock-test-1' },
    update: {
      title: 'Cambridge IELTS 20 - Academic Reading Test 1: Urban Microclimates',
      description: 'Đề thi thử IELTS Academic Reading hoàn chỉnh chuẩn Cambridge với 3 Passage thực chiến (Passage 1: Microclimates, Passage 2: Cetaceans, Passage 3: Neuroplasticity).',
      category: CourseCategory.IELTS,
      skill: SkillType.READING,
      quizType: 'FULL_MOCK_TEST',
      testType: 'FULL_MOCK_TEST',
      timeLimitMinutes: 60,
      passScore: 80,
      passage: readingSections[0].passage,
      sectionsPayload: readingSections,
    },
    create: {
      id: 'cambridge-reading-mock-test-1',
      title: 'Cambridge IELTS 20 - Academic Reading Test 1: Urban Microclimates',
      description: 'Đề thi thử IELTS Academic Reading hoàn chỉnh chuẩn Cambridge với 3 Passage thực chiến (Passage 1: Microclimates, Passage 2: Cetaceans, Passage 3: Neuroplasticity).',
      category: CourseCategory.IELTS,
      skill: SkillType.READING,
      quizType: 'FULL_MOCK_TEST',
      testType: 'FULL_MOCK_TEST',
      timeLimitMinutes: 60,
      passScore: 80,
      passage: readingSections[0].passage,
      sectionsPayload: readingSections,
    },
  });

  // Questions for Reading Passage 1
  const readingQuestions = [
    {
      part: 1,
      groupPrompt: 'Questions 1-5: Do the following statements agree with the information given in Reading Passage 1? Write TRUE, FALSE or NOT GIVEN.',
      content: '1. Urban Heat Islands cause metropolitan centers to be warmer than surrounding rural areas.',
      type: QuestionType.TRUE_FALSE_NOT_GIVEN,
      orderIndex: 1,
      explanation: 'Đoạn A nêu: metropolitan temperatures exceed surrounding rural baselines by up to 5 to 8 degrees Celsius -> TRUE.',
      options: [
        { content: 'TRUE', isCorrect: true },
        { content: 'FALSE', isCorrect: false },
        { content: 'NOT GIVEN', isCorrect: false },
      ],
    },
    {
      part: 1,
      groupPrompt: 'Questions 1-5: Do the following statements agree with the information given in Reading Passage 1? Write TRUE, FALSE or NOT GIVEN.',
      content: '2. Vertical botanical facades utilize synthetic artificial foliage to reflect solar radiation.',
      type: QuestionType.TRUE_FALSE_NOT_GIVEN,
      orderIndex: 2,
      explanation: 'Đoạn B nêu: "incorporating indigenous foliage" (cây cỏ tự nhiên bản địa), không phải lá nhân tạo -> FALSE.',
      options: [
        { content: 'TRUE', isCorrect: false },
        { content: 'FALSE', isCorrect: true },
        { content: 'NOT GIVEN', isCorrect: false },
      ],
    },
    {
      part: 1,
      groupPrompt: 'Questions 1-5: Do the following statements agree with the information given in Reading Passage 1? Write TRUE, FALSE or NOT GIVEN.',
      content: '3. Automated IoT sensors adjust misting nozzles and solar louvers based on real-time climate data.',
      type: QuestionType.TRUE_FALSE_NOT_GIVEN,
      orderIndex: 3,
      explanation: 'Đoạn C nêu: sensors relay real-time telemetry... dynamically controlling misting nozzles and solar louvers -> TRUE.',
      options: [
        { content: 'TRUE', isCorrect: true },
        { content: 'FALSE', isCorrect: false },
        { content: 'NOT GIVEN', isCorrect: false },
      ],
    },
    {
      part: 1,
      groupPrompt: 'Questions 1-5: Do the following statements agree with the information given in Reading Passage 1? Write TRUE, FALSE or NOT GIVEN.',
      content: '4. The municipal government of Milan financed the entire vertical forest construction project.',
      type: QuestionType.TRUE_FALSE_NOT_GIVEN,
      orderIndex: 4,
      explanation: 'Bài đọc không hề đề cập nguồn vốn từ chính quyền thành phố Milan -> NOT GIVEN.',
      options: [
        { content: 'TRUE', isCorrect: false },
        { content: 'FALSE', isCorrect: false },
        { content: 'NOT GIVEN', isCorrect: true },
      ],
    },
    {
      part: 1,
      groupPrompt: 'Questions 1-5: Do the following statements agree with the information given in Reading Passage 1? Write TRUE, FALSE or NOT GIVEN.',
      content: '5. High maintenance costs of drip-irrigation systems present a challenge to widespread adoption.',
      type: QuestionType.TRUE_FALSE_NOT_GIVEN,
      orderIndex: 5,
      explanation: 'Đoạn D nêu: "Chief among these is the ongoing maintenance cost associated with automated drip-irrigation networks" -> TRUE.',
      options: [
        { content: 'TRUE', isCorrect: true },
        { content: 'FALSE', isCorrect: false },
        { content: 'NOT GIVEN', isCorrect: false },
      ],
    },
    {
      part: 1,
      groupPrompt: 'Questions 6-8: Choose the correct letter, A, B, C or D.',
      content: '6. What is the primary cause of Urban Heat Islands mentioned in Paragraph A?',
      type: QuestionType.SINGLE_CHOICE,
      orderIndex: 6,
      explanation: 'Đoạn A nêu rõ: Dense concrete infrastructure, asphalt surfaces, and anthropogenic heat emissions -> B.',
      options: [
        { content: 'A. Excessive use of residential air conditioning units', isCorrect: false },
        { content: 'B. Dense concrete, asphalt surfaces and anthropogenic heat emissions', isCorrect: true },
        { content: 'C. Increased rainfall in rural territories', isCorrect: false },
        { content: 'D. Absence of underground public transit networks', isCorrect: false },
      ],
    },
    // Questions for Reading Passage 2
    {
      part: 2,
      groupPrompt: 'Questions 9-11: Choose the correct heading for each paragraph from the list of headings below.',
      content: '9. Which heading best summarizes the main idea of Paragraph B in Passage 2?',
      type: QuestionType.MATCHING_HEADINGS,
      orderIndex: 9,
      explanation: 'Đoạn B mô tả cách cá voi sừng tấm truyền sóng âm tần số thấp qua các tầng SOFAR sâu dưới đại dương -> ii.',
      options: [
        { content: 'i. High-frequency biosonar for echolocation navigation', isCorrect: false },
        { content: 'ii. Long-distance acoustic transmission in ocean channels', isCorrect: true },
        { content: 'iii. Detrimental impacts of industrial noise pollution', isCorrect: false },
        { content: 'iv. Anatomical evolution of the melon organ', isCorrect: false },
      ],
    },
    {
      part: 2,
      groupPrompt: 'Questions 12-14: Complete the sentences below. Write NO MORE THAN TWO WORDS.',
      content: '12. Dolphins resolve small benthic prey by projecting ultrasonic pulses through their ______ organ.',
      type: QuestionType.FILL_BLANK,
      orderIndex: 12,
      explanation: 'Đoạn C nêu: "by projecting ultrasonic beam patterns through their lipid-rich melon organs" -> melon / lipid-rich melon.',
      options: [
        { content: 'melon', isCorrect: true },
        { content: 'lipid-rich melon', isCorrect: true },
      ],
    },
    // Questions for Reading Passage 3
    {
      part: 3,
      groupPrompt: 'Questions 15-17: Do the following statements agree with the views of the writer in Reading Passage 3? Write YES, NO or NOT GIVEN.',
      content: '15. Modern fMRI studies confirm that language plasticity ceases permanently after puberty.',
      type: QuestionType.YES_NO_NOT_GIVEN,
      orderIndex: 15,
      explanation: 'Đoạn A nêu rằng các công nghệ mới đã dỡ bỏ quan niệm cũ và chỉ ra độ dẻo dai thần kinh đáng kể ở người trưởng thành -> NO.',
      options: [
        { content: 'YES', isCorrect: false },
        { content: 'NO', isCorrect: true },
        { content: 'NOT GIVEN', isCorrect: false },
      ],
    },
    {
      part: 3,
      groupPrompt: 'Questions 18-20: Complete the summary below. Write NO MORE THAN TWO WORDS.',
      content: '18. Adult second language learners rely on executive control mediated by the ______ cortex.',
      type: QuestionType.FILL_BLANK,
      orderIndex: 18,
      explanation: 'Đoạn C nêu: "mediated by the dorsolateral prefrontal cortex" -> dorsolateral prefrontal.',
      options: [
        { content: 'dorsolateral prefrontal', isCorrect: true },
        { content: 'dorsolateral prefrontal cortex', isCorrect: true },
      ],
    },
  ];

  // Delete existing questions for this quiz and recreate
  await prisma.question.deleteMany({ where: { quizId: readingQuiz.id } });
  for (const q of readingQuestions) {
    await prisma.question.create({
      data: {
        quizId: readingQuiz.id,
        content: q.content,
        skill: SkillType.READING,
        type: q.type,
        part: q.part,
        groupPrompt: q.groupPrompt,
        orderIndex: q.orderIndex,
        explanation: q.explanation,
        options: {
          create: q.options.map((opt) => ({
            content: opt.content,
            isCorrect: opt.isCorrect,
          })),
        },
      },
    });
  }
  console.log(`✓ Seeded Reading Quiz: ${readingQuiz.title} with 3 Passages and ${readingQuestions.length} Questions`);

  // 2. CAMBRIDGE IELTS 20 - LISTENING TEST 1 (4 SECTIONS WITH AUDIO & MAP IMAGE)
  const listeningSections = [
    {
      part: 1,
      title: 'Section 1: Homestay Booking Application',
      questionRange: 'Questions 1 - 5',
      audioUrl: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
      instructions: 'Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.',
    },
    {
      part: 2,
      title: 'Section 2: Brookside Farm & Visitor Map Guide (Map Labeling)',
      questionRange: 'Questions 6 - 10',
      audioUrl: 'https://actions.google.com/sounds/v1/ambiences/park_fountain.ogg',
      imageUrl: 'https://images.unsplash.com/photo-1524813686514-a57563d77d66?auto=format&fit=crop&w=1000&q=80',
      instructions: 'Label the map below. Choose the correct letter, A-H, next to Questions 6-10.',
    },
    {
      part: 3,
      title: 'Section 3: Academic Discussion on Marine Renewable Energy',
      questionRange: 'Questions 11 - 15',
      audioUrl: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg',
      instructions: 'Choose the correct letter, A, B or C for Questions 11-15.',
    },
    {
      part: 4,
      title: 'Section 4: University Lecture on Deep-Sea Hydrothermal Vents',
      questionRange: 'Questions 16 - 20',
      audioUrl: 'https://actions.google.com/sounds/v1/ambiences/water_stream.ogg',
      instructions: 'Complete the summary notes below. Write NO MORE THAN TWO WORDS for each answer.',
    },
  ];

  const listeningQuiz = await prisma.quiz.upsert({
    where: { id: 'cambridge-listening-mock-test-1' },
    update: {
      title: 'Cambridge IELTS 20 - Listening Test 1: Brookside Farm & Homestay',
      description: 'Đề thi thử IELTS Listening hoàn chỉnh chuẩn Cambridge 4 Section có âm thanh và sơ đồ bản đồ Map Labeling ở Section 2.',
      category: CourseCategory.IELTS,
      skill: SkillType.LISTENING,
      quizType: 'FULL_MOCK_TEST',
      testType: 'FULL_MOCK_TEST',
      timeLimitMinutes: 40,
      passScore: 80,
      audioUrl: listeningSections[0].audioUrl,
      sectionsPayload: listeningSections,
    },
    create: {
      id: 'cambridge-listening-mock-test-1',
      title: 'Cambridge IELTS 20 - Listening Test 1: Brookside Farm & Homestay',
      description: 'Đề thi thử IELTS Listening hoàn chỉnh chuẩn Cambridge 4 Section có âm thanh và sơ đồ bản đồ Map Labeling ở Section 2.',
      category: CourseCategory.IELTS,
      skill: SkillType.LISTENING,
      quizType: 'FULL_MOCK_TEST',
      testType: 'FULL_MOCK_TEST',
      timeLimitMinutes: 40,
      passScore: 80,
      audioUrl: listeningSections[0].audioUrl,
      sectionsPayload: listeningSections,
    },
  });

  const listeningQuestions = [
    // Section 1: Form Completion
    {
      part: 1,
      groupPrompt: 'Questions 1-3: Complete the homestay reservation form below. Write ONE WORD AND/OR A NUMBER.',
      content: '1. Applicant primary occupation: ______',
      type: QuestionType.FILL_BLANK,
      orderIndex: 1,
      explanation: 'Băng ghi âm nêu: "I am currently employed as an architect" -> architect.',
      options: [{ content: 'architect', isCorrect: true }],
    },
    {
      part: 1,
      groupPrompt: 'Questions 1-3: Complete the homestay reservation form below. Write ONE WORD AND/OR A NUMBER.',
      content: '2. Requested arrival date: 15th of ______',
      type: QuestionType.FILL_BLANK,
      orderIndex: 2,
      explanation: 'Băng ghi âm nêu: "I will be arriving on the 15th of October" -> October.',
      options: [{ content: 'October', isCorrect: true }],
    },
    // Section 2: MAP / DIAGRAM LABELING (Crucial!)
    {
      part: 2,
      groupPrompt: 'Questions 6-10: Label the map below. Choose the correct letter, A-H, for each location.',
      imageUrl: 'https://images.unsplash.com/photo-1524813686514-a57563d77d66?auto=format&fit=crop&w=1000&q=80',
      content: '6. Visitor Information & Ticket Booth',
      type: QuestionType.MAP_DIAGRAM_LABELING,
      orderIndex: 6,
      explanation: 'Hướng dẫn đường đi: "As you enter through the main gate, the ticket office is immediately on your right at point B" -> B.',
      options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((l) => ({ content: l, isCorrect: l === 'B' })),
    },
    {
      part: 2,
      groupPrompt: 'Questions 6-10: Label the map below. Choose the correct letter, A-H, for each location.',
      imageUrl: 'https://images.unsplash.com/photo-1524813686514-a57563d77d66?auto=format&fit=crop&w=1000&q=80',
      content: '7. Organic Farm Cafe & Refreshment Area',
      type: QuestionType.MAP_DIAGRAM_LABELING,
      orderIndex: 7,
      explanation: 'Hướng dẫn: "Follow the north path past the duck pond, and the cafe is situated at point E" -> E.',
      options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((l) => ({ content: l, isCorrect: l === 'E' })),
    },
    {
      part: 2,
      groupPrompt: 'Questions 6-10: Label the map below. Choose the correct letter, A-H, for each location.',
      imageUrl: 'https://images.unsplash.com/photo-1524813686514-a57563d77d66?auto=format&fit=crop&w=1000&q=80',
      content: '8. Children Adventure Playground',
      type: QuestionType.MAP_DIAGRAM_LABELING,
      orderIndex: 8,
      explanation: 'Hướng dẫn: "The playground is located in the southwestern corner at point D" -> D.',
      options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((l) => ({ content: l, isCorrect: l === 'D' })),
    },
    // Section 3: MCQ
    {
      part: 3,
      groupPrompt: 'Questions 11-13: Choose the correct letter, A, B or C.',
      content: '11. Why did the students decide to focus on tidal energy rather than offshore wind?',
      type: QuestionType.SINGLE_CHOICE,
      orderIndex: 11,
      explanation: 'Học viên nêu: "Tidal currents have higher predictability and energy density compared to wind" -> A.',
      options: [
        { content: 'A. Tidal energy exhibits superior predictability and energy density', isCorrect: true },
        { content: 'B. Offshore wind turbines are strictly prohibited by maritime law', isCorrect: false },
        { content: 'C. Government subsidies are only available for tidal projects', isCorrect: false },
      ],
    },
    // Section 4: Note Completion
    {
      part: 4,
      groupPrompt: 'Questions 16-18: Complete the lecture notes below. Write NO MORE THAN TWO WORDS.',
      content: '16. Hydrothermal vent ecosystems survive without sunlight using energy produced by ______ bacteria.',
      type: QuestionType.FILL_BLANK,
      orderIndex: 16,
      explanation: 'Giáo sư giảng: "Primary production is driven entirely by chemosynthetic bacteria" -> chemosynthetic.',
      options: [{ content: 'chemosynthetic', isCorrect: true }],
    },
  ];

  await prisma.question.deleteMany({ where: { quizId: listeningQuiz.id } });
  for (const q of listeningQuestions) {
    await prisma.question.create({
      data: {
        quizId: listeningQuiz.id,
        content: q.content,
        skill: SkillType.LISTENING,
        type: q.type,
        part: q.part,
        groupPrompt: q.groupPrompt,
        imageUrl: q.imageUrl || null,
        orderIndex: q.orderIndex,
        explanation: q.explanation,
        options: {
          create: q.options.map((opt) => ({
            content: opt.content,
            isCorrect: opt.isCorrect,
          })),
        },
      },
    });
  }
  console.log(`✓ Seeded Listening Quiz: ${listeningQuiz.title} with 4 Sections and ${listeningQuestions.length} Questions`);

  console.log('--- ALL CAMBRIDGE MOCK TESTS SEEDED SUCCESSFULLY ---');
}

seedCambridgeMockTests()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
