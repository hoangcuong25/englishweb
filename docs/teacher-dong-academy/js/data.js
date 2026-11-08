/* ==========================================================
   Teacher Dong Academy — data.js
   5 Trụ Cột Đào Tạo Trọng Tâm (Chuẩn theo hồ sơ thiết kế)
   1. English Proficiency Course
   2. Professional Development
   3. Life Skills and Personal Growth
   4. Life Experiences and Inspiration
   5. Travel and Culture Blog
   ========================================================== */

const SITE = {
  contactEmail: "contact@teacherdong.academy",
  hotline: "0987 654 321"
};

const CATEGORIES = [
  { id: "english_proficiency", icon: "chat",      tone: "blue" },
  { id: "professional_dev",    icon: "briefcase", tone: "sky" },
  { id: "life_skills",         icon: "sprout",    tone: "amber" },
  { id: "life_experiences",    icon: "star",      tone: "amber" },
  { id: "travel_culture",      icon: "globe",     tone: "blue" }
];

const COURSES = [
  // 1. English Proficiency Course
  { id: "c_business",     cat: "english_proficiency", level: "work" },
  { id: "c_ielts",        cat: "english_proficiency", level: "goal" },
  { id: "c_conversation", cat: "english_proficiency", level: "all" },
  { id: "c_kids",         cat: "english_proficiency", level: "kids" },

  // 2. Professional Development
  { id: "c_ai_edu",       cat: "professional_dev",    level: "work" },
  { id: "c_career",       cat: "professional_dev",    level: "student" },
  { id: "c_classroom",    cat: "professional_dev",    level: "work" },
  { id: "c_leadership",   cat: "professional_dev",    level: "work" },
  { id: "c_research",     cat: "professional_dev",    level: "student" },
  { id: "c_teaching",     cat: "professional_dev",    level: "work" },

  // 3. Life Skills and Personal Growth
  { id: "c_critical",     cat: "life_skills",         level: "everyone" },
  { id: "c_public_speaking", cat: "life_skills",      level: "everyone" },
  { id: "c_time_management", cat: "life_skills",      level: "everyone" },

  // 4. Life Experiences and Inspiration
  { id: "c_talks",           cat: "life_experiences", level: "everyone" },
  { id: "c_teaching_abroad", cat: "life_experiences", level: "everyone" },
  { id: "c_living_overseas", cat: "life_experiences", level: "everyone" },
  { id: "c_reflections",     cat: "life_experiences", level: "everyone" },

  // 5. Travel and Culture Blog
  { id: "c_culture_aware",   cat: "travel_culture",   level: "everyone" },
  { id: "c_asia",            cat: "travel_culture",   level: "everyone" },
  { id: "c_language_people", cat: "travel_culture",   level: "everyone" }
];

const RESOURCES = [
  { id: "r1", icon: "book" },
  { id: "r2", icon: "headphones" },
  { id: "r3", icon: "clipboard" },
  { id: "r4", icon: "letters" }
];

const POSTS = [
  { id: "b1", icon: "star",    tone: "amber" },
  { id: "b2", icon: "globe",   tone: "blue" },
  { id: "b3", icon: "bulb",    tone: "sky" }
];
