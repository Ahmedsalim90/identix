// ─── Users (Auth) ───────────────────────────────────────────────────────────
export const USERS = [
  { id: 'U001', name: 'Dr. Emmanuel Fosso', email: 'admin@attendtrack.cm', password: 'admin123', role: 'admin', avatar: 'EF', department: 'Administration' },
  { id: 'U002', name: 'Mr. Jean-Paul Mbida', email: 'mbida@attendtrack.cm', password: 'teacher123', role: 'teacher', avatar: 'JM', classes: ['Grade 7A', 'Grade 8B'], subjects: ['Mathematics', 'ICT'] },
  { id: 'U003', name: 'Mrs. Grace Tchamba', email: 'tchamba@attendtrack.cm', password: 'teacher123', role: 'teacher', avatar: 'GT', classes: ['Grade 7B', 'Grade 9A'], subjects: ['English', 'French'] },
  { id: 'U004', name: 'Mr. Alain Nkuissi', email: 'nkuissi@attendtrack.cm', password: 'teacher123', role: 'teacher', avatar: 'AN', classes: ['Grade 8A', 'Grade 9B'], subjects: ['Science', 'History'] },
  { id: 'S001', name: 'Amara Nkosi', email: 'amara@student.cm', password: 'student123', role: 'student', avatar: 'AN', class: 'Grade 7A', studentId: 'STU001' },
  { id: 'S002', name: 'Bright Mensah', email: 'bright@student.cm', password: 'student123', role: 'student', avatar: 'BM', class: 'Grade 7A', studentId: 'STU002' },
  { id: 'S003', name: 'Chisom Okafor', email: 'chisom@student.cm', password: 'student123', role: 'student', avatar: 'CO', class: 'Grade 8B', studentId: 'STU003' },
];

// ─── Classes & Subjects ──────────────────────────────────────────────────────
export const CLASSES = ['Grade 7A', 'Grade 7B', 'Grade 8A', 'Grade 8B', 'Grade 9A', 'Grade 9B', 'Grade 8D', 'Grade 8H'];
export const SUBJECTS = ['Mathematics', 'English', 'Science', 'History', 'ICT', 'French'];

// ─── Students ────────────────────────────────────────────────────────────────
export const STUDENTS = [
  { id: 'STU001', name: 'Amara Nkosi',      gender: 'F', class: 'Grade 7A', dob: '2011-03-14', parent: 'Mrs. Nkosi +237 670 001 001' },
  { id: 'STU002', name: 'Bright Mensah',    gender: 'M', class: 'Grade 7A', dob: '2011-07-22', parent: 'Mr. Mensah +237 670 002 002' },
  { id: 'STU003', name: 'Chisom Okafor',    gender: 'F', class: 'Grade 7B', dob: '2011-01-05', parent: 'Mrs. Okafor +237 670 003 003' },
  { id: 'STU004', name: 'David Tabi',       gender: 'M', class: 'Grade 7B', dob: '2010-11-18', parent: 'Mr. Tabi +237 670 004 004' },
  { id: 'STU005', name: 'Esther Bello',     gender: 'F', class: 'Grade 8A', dob: '2010-05-30', parent: 'Mrs. Bello +237 670 005 005' },
  { id: 'STU006', name: 'Frank Adu',        gender: 'M', class: 'Grade 8A', dob: '2010-09-12', parent: 'Mr. Adu +237 670 006 006' },
  { id: 'STU007', name: 'Grace Diallo',     gender: 'F', class: 'Grade 8B', dob: '2010-02-28', parent: 'Mrs. Diallo +237 670 007 007' },
  { id: 'STU008', name: 'Henri Kone',       gender: 'M', class: 'Grade 8B', dob: '2010-08-15', parent: 'Mr. Kone +237 670 008 008' },
  { id: 'STU009', name: 'Irene Asante',     gender: 'F', class: 'Grade 9A', dob: '2009-04-03', parent: 'Mrs. Asante +237 670 009 009' },
  { id: 'STU010', name: 'Joel Kamau',       gender: 'M', class: 'Grade 9A', dob: '2009-12-20', parent: 'Mr. Kamau +237 670 010 010' },
  { id: 'STU011', name: 'Kemi Eze',         gender: 'F', class: 'Grade 9A', dob: '2009-06-11', parent: 'Mrs. Eze +237 670 011 011' },
  { id: 'STU012', name: 'Luc Bebey',        gender: 'M', class: 'Grade 9B', dob: '2009-10-07', parent: 'Mr. Bebey +237 670 012 012' },
  { id: 'STU013', name: 'Mary Owusu',       gender: 'F', class: 'Grade 9B', dob: '2009-03-25', parent: 'Mrs. Owusu +237 670 013 013' },
  { id: 'STU014', name: 'Nana Boateng',     gender: 'M', class: 'Grade 7A', dob: '2011-08-19', parent: 'Mr. Boateng +237 670 014 014' },
  { id: 'STU015', name: 'Olivia Fofana',    gender: 'F', class: 'Grade 7B', dob: '2011-05-02', parent: 'Mrs. Fofana +237 670 015 015' },
  { id: 'STU016', name: 'Paul Ndoye',       gender: 'M', class: 'Grade 8A', dob: '2010-01-16', parent: 'Mr. Ndoye +237 670 016 016' },
  { id: 'STU017', name: 'Queen Aidoo',      gender: 'F', class: 'Grade 8B', dob: '2010-07-09', parent: 'Mrs. Aidoo +237 670 017 017' },
  { id: 'STU018', name: 'Roland Tchoua',    gender: 'M', class: 'Grade 9A', dob: '2009-11-30', parent: 'Mr. Tchoua +237 670 018 018' },
  { id: 'STU019', name: 'Sandra Wambua',    gender: 'F', class: 'Grade 9B', dob: '2009-02-14', parent: 'Mrs. Wambua +237 670 019 019' },
  { id: 'STU020', name: 'Thierry Kouakou',  gender: 'M', class: 'Grade 7A', dob: '2011-09-08', parent: 'Mr. Kouakou +237 670 020 020' },
];

// ─── Generate Attendance History ─────────────────────────────────────────────
function generateHistory() {
  const hist = {};
  const now = new Date();
  for (let d = 0; d < 30; d++) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    const key = date.toISOString().slice(0, 10);
    hist[key] = {};
    SUBJECTS.forEach(sub => {
      hist[key][sub] = {};
      STUDENTS.forEach(s => {
        const r = Math.random();
        hist[key][sub][s.id] = r < 0.80 ? 'present' : r < 0.89 ? 'late' : r < 0.95 ? 'excused' : 'absent';
      });
    });
  }
  return hist;
}

export const ATTENDANCE_HISTORY = generateHistory();

// ─── Helpers ─────────────────────────────────────────────────────────────────
export const AVATAR_COLORS = [
  { bg: '#dbeafe', color: '#1d4ed8' },
  { bg: '#dcfce7', color: '#15803d' },
  { bg: '#fce7f3', color: '#be185d' },
  { bg: '#fef3c7', color: '#b45309' },
  { bg: '#ede9fe', color: '#7c3aed' },
  { bg: '#fee2e2', color: '#b91c1c' },
  { bg: '#e0f2fe', color: '#0369a1' },
  { bg: '#ecfdf5', color: '#047857' },
];

export function getAvatarColor(idx) {
  return AVATAR_COLORS[idx % AVATAR_COLORS.length];
}

export function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export function computeStats(records = {}) {
  let present = 0, absent = 0, late = 0, excused = 0;
  Object.values(records).forEach(st => {
    if (st === 'present') present++;
    else if (st === 'absent') absent++;
    else if (st === 'late') late++;
    else if (st === 'excused') excused++;
  });
  const total = present + absent + late + excused;
  return { present, absent, late, excused, total, rate: total ? Math.round((present + late) / total * 100) : 0 };
}

export function getStudentStats(studentId) {
  let present = 0, absent = 0, late = 0, excused = 0;
  Object.values(ATTENDANCE_HISTORY).forEach(dayData => {
    Object.values(dayData).forEach(subjectData => {
      const status = subjectData[studentId];
      if (status === 'present') present++;
      else if (status === 'absent') absent++;
      else if (status === 'late') late++;
      else if (status === 'excused') excused++;
    });
  });
  const total = present + absent + late + excused;
  return { present, absent, late, excused, total, rate: total ? Math.round((present + late) / total * 100) : 0 };
}
