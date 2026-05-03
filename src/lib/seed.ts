import { doc, setDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from './firebase';

export async function seedSchoolData() {
  const schools = [
    {
      id: 'mit',
      name: 'Massachusetts Institute of Technology',
      code: 'mit',
      location: 'Cambridge, MA',
      helpDesk: '+1 (617) 253-1000',
      advisorInfo: 'Dr. Sarah Jenkins (Room 4-105)'
    },
    {
      id: 'stanford',
      name: 'Stanford University',
      code: 'stanford',
      location: 'Stanford, CA',
      helpDesk: '+1 (650) 723-2300',
      advisorInfo: 'Prof. Michael Chen (Building 10)'
    }
  ];

  console.log('Starting seed process...');

  for (const school of schools) {
    await setDoc(doc(db, 'schools', school.id), school);
  }

  // Seed some classes for these schools if they don't exist
  const mitClasses = [
    { name: 'Quantum Physics', code: 'PHY101', schoolCode: 'mit', instructor: 'Dr. Feynman', schedule: 'Mon, Wed 10:00 AM', location: 'Maxwell Hall' },
    { name: 'AI Ethics', code: 'CS302', schoolCode: 'mit', instructor: 'Dr. Turing', schedule: 'Tue, Thu 02:00 PM', location: 'Stata Center' }
  ];

  for (const cls of mitClasses) {
    const q = query(collection(db, 'classes'), where('code', '==', cls.code), where('schoolCode', '==', cls.schoolCode), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) {
      await setDoc(doc(collection(db, 'classes')), cls);
    }
  }

  console.log('Demo school data seeded successfully!');
}
