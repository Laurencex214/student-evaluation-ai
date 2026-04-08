/**
 * subjectCatalog.js — CNHS Subject Catalog
 * Central subject list for Junior High (Grade 7–10) and
 * Senior High (ABM, STEM, GAS, TVL, HUMSS) by grade & semester.
 *
 * Semester 1 = Q1 + Q2 | Semester 2 = Q3 + Q4
 * Use getSubjectsForReport(level, strand, grade, semester) to retrieve the list.
 */

const SUBJECT_CATALOG = {

    // ─── JUNIOR HIGH (Grade 7–10) ─────────────────────────────
    JH: {
        subjects: [
            'Science',
            'Mathematics',
            'English',
            'Filipino',
            'Araling Panlipunan',
            'Edukasyon sa Pagpapakatao',
            'MAPEH',
            'Technology and Livelihood Education',
        ],
        7: { subjects: ['Science', 'Mathematics', 'English', 'Filipino', 'Araling Panlipunan', 'Edukasyon sa Pagpapakatao', 'MAPEH', 'Technology and Livelihood Education'] },
        8: { subjects: ['Science', 'Mathematics', 'English', 'Filipino', 'Araling Panlipunan', 'Edukasyon sa Pagpapakatao', 'MAPEH', 'Technology and Livelihood Education'] },
        9: { subjects: ['Science', 'Mathematics', 'English', 'Filipino', 'Araling Panlipunan', 'Edukasyon sa Pagpapakatao', 'MAPEH', 'Technology and Livelihood Education'] },
        10: { subjects: ['Science', 'Mathematics', 'English', 'Filipino', 'Araling Panlipunan', 'Edukasyon sa Pagpapakatao', 'MAPEH', 'Technology and Livelihood Education'] },
        // JH has no strand distinction; sem1/sem2 same subjects
    },

    // ─── SENIOR HIGH ─────────────────────────────────────────────────────────
    SH: {

        ABM: {
            11: {
                sem1: [ // Q1 & Q2
                    'Oral Communication',
                    'Komunikasyon at Pananaliksik sa Wika at Kulturang Pilipino',
                    'General Mathematics',
                    'Earth and Life Sciences',
                    '21st Century Literature from the Philippines and the World',
                    'Physical Education and Health',
                    'Empowerment Technologies',
                    'Filipino sa Piling Larang',
                    'Organization and Management',
                    'Business Math',
                ],
                sem2: [ // Q3 & Q4
                    'Reading and Writing Skills',
                    "Pagbasa at Pagsusuri ng Iba't Ibang Teksto Tungo sa Pananaliksik",
                    'Statistics and Probability',
                    'Physical Science',
                    'Personal Development',
                    'Physical Education and Health',
                    'Entrepreneurship',
                    'Practical Research 1',
                    'Fundamentals of Accountancy, Business and Management 1',
                    'Principles of Marketing',
                ],
            },
            12: {
                sem1: [ // Q1 & Q2
                    'Introduction to the Philosophy of the Human Person',
                    'Contemporary Philippine Arts from the Regions',
                    'Understanding Culture, Society and Politics',
                    'Physical Education and Health',
                    'English for Academic and Professional Purposes',
                    'Practical Research 2',
                    'Fundamentals of Accountancy, Business and Management 2',
                    'Applied Economics',
                ],
                sem2: [ // Q3 & Q4
                    'Media and Information Literacy',
                    'Physical Education and Health',
                    'Inquiries, Investigations and Immersion',
                    'Business Finance',
                    'Business Ethics and Social Responsibility',
                    'Business Enterprise Simulation / Work Immersion',
                ],
            },
        },

        STEM: {
            11: {
                sem1: [
                    'Oral Communication',
                    'Komunikasyon at Pananaliksik sa Wika at Kulturang Pilipino',
                    'General Mathematics',
                    'Earth Science',
                    '21st Century Literature from the Philippines and the World',
                    'Physical Education and Health',
                    'Empowerment Technologies',
                    'Filipino sa Piling Larang',
                    'Pre-Calculus',
                    'General Biology 1',
                    'Human Biology 1',
                    'Complex Numbers',
                ],
                sem2: [
                    'Reading and Writing Skills',
                    "Pagbasa at Pagsusuri ng Iba't Ibang Teksto Tungo sa Pananaliksik",
                    'Statistics and Probability',
                    'Disaster Readiness and Risk Reduction',
                    'Personal Development',
                    'Physical Education and Health',
                    'Practical Research 1',
                    'Entrepreneurship',
                    'Basic Calculus',
                    'General Biology 2',
                    'Human Biology 2',
                    'Vectors and the Geometry of Space',
                ],
            },
            12: {
                sem1: [
                    'Introduction to the Philosophy of the Human Person',
                    'Contemporary Philippine Arts from the Regions',
                    'Understanding Culture, Society and Politics',
                    'Physical Education and Health',
                    'Practical Research 2',
                    'English for Academic and Special Purposes',
                    'General Physics 1',
                    'General Chemistry 1',
                    'Human Biology 3',
                    'Differential Equations',
                ],
                sem2: [
                    'Media and Information Literacy',
                    'Physical Education and Health',
                    'Inquiries, Investigations and Immersion',
                    'General Physics 2',
                    'General Chemistry 2',
                    'Work Immersion / Research / Career Advocacy / Culminating Activity',
                    'Biochemistry',
                ],
            },
        },

        GAS: {
            11: {
                sem1: [
                    'Oral Communication',
                    'Komunikasyon at Pananaliksik sa Wika at Kulturang Pilipino',
                    'General Mathematics',
                    'Earth and Life Science',
                    'Understanding Culture, Society and Politics',
                    'Personal Development',
                    'Physical Education and Health',
                    'Entrepreneurship',
                    'Organization and Management',
                ],
                sem2: [
                    'Reading and Writing Skills',
                    "Pagbasa at Pagsusuri ng Iba't Ibang Teksto Tungo sa Pananaliksik",
                    'Statistics and Probability',
                    'Physical Science',
                    'Physical Education and Health',
                    'Media and Information Literacy',
                    'Practical Research 1',
                    'Fundamentals of Accountancy, Business and Management 1',
                ],
            },
            12: {
                sem1: [
                    'Introduction to the Philosophy of the Human Person',
                    'Contemporary Philippine Arts from the Regions',
                    'Physical Education and Health',
                    'English for Academic and Professional Purposes',
                    'Practical Research 2',
                    'Empowerment Technologies',
                    'Applied Economics',
                    'Fundamentals of Accountancy, Business and Management 2',
                    'Principles of Marketing',
                ],
                sem2: [
                    '21st Century Literature from the Philippines and the World',
                    'Physical Education and Health',
                    'Inquiries, Investigations and Immersion',
                    'Pagsulat sa Filipino sa Piling Larangan Akademik',
                    'Business Ethics and Social Responsibility',
                    'Business Finance',
                    'Business Enterprise Simulation / Work Immersion',
                ],
            },
        },

        TVL: {
            11: {
                sem1: [], // To be added
                sem2: [], // To be added
            },
            12: {
                sem1: [], // To be added
                sem2: [], // To be added
            },
        },

        HUMSS: {
            11: {
                sem1: [], // To be added
                sem2: [], // To be added
            },
            12: {
                sem1: [], // To be added
                sem2: [], // To be added
            },
        },
    },
};

/**
 * Get subjects for the academic report based on selection.
 * @param {string} level     - 'JH' or 'SH'
 * @param {string} strand    - 'ABM', 'STEM', 'GAS', 'TVL', 'HUMSS' (only for SH)
 * @param {number} grade     - 7-12
 * @param {number} semester  - 1 or 2
 * @returns {string[]}  Array of subject names
 */
function getSubjectsForReport(level, strand, grade, semester) {
    // Load any custom overrides from localStorage
    let custom = {};
    try {
        const saved = localStorage.getItem('cnhs_subject_catalog_custom');
        if (saved) custom = JSON.parse(saved);
    } catch { /* ignore */ }

    const semKey = semester === 1 ? 'sem1' : 'sem2';

    if (level === 'JH') {
        const gradeData = SUBJECT_CATALOG.JH[grade];
        const base = gradeData ? gradeData.subjects.slice() : SUBJECT_CATALOG.JH.subjects.slice();
        const customKey = `JH_${grade}`;
        if (custom[customKey]) return custom[customKey];
        return base;
    }

    if (level === 'SH' && strand && SUBJECT_CATALOG.SH[strand]) {
        const gradeData = SUBJECT_CATALOG.SH[strand][grade];
        if (!gradeData) return [];
        const base = (gradeData[semKey] || []).slice();
        const customKey = `SH_${strand}_${grade}_${semKey}`;
        if (custom[customKey]) return custom[customKey];
        return base;
    }

    return [];
}

/**
 * Save a custom subject list to localStorage for a given key.
 * @param {string} key   - e.g. 'JH_7', 'SH_ABM_11_sem1'
 * @param {string[]} list
 */
function saveCustomSubjectList(key, list) {
    let custom = {};
    try {
        const saved = localStorage.getItem('cnhs_subject_catalog_custom');
        if (saved) custom = JSON.parse(saved);
    } catch { /* ignore */ }
    custom[key] = list;
    localStorage.setItem('cnhs_subject_catalog_custom', JSON.stringify(custom));
}

/**
 * Returns all unique strands in SH.
 */
const SH_STRANDS = ['ABM', 'STEM', 'GAS', 'TVL', 'HUMSS'];
const JH_GRADES = [7, 8, 9, 10];
const SH_GRADES = [11, 12];
