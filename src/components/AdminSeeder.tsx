import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { seedSchoolData } from '../lib/seed';

export default function AdminSeeder() {
  const { user } = useAuth();
  const adminEmail = 'patriadrea@gmail.com';

  useEffect(() => {
    // Only run if the user is signed in and is the designated admin
    if (user && user.email === adminEmail) {
      const isSeeded = localStorage.getItem('seeded') === 'true';
      if (!isSeeded) {
        console.log('Admin detected. Attempting to seed demo data...');
        seedSchoolData()
          .then(() => {
            localStorage.setItem('seeded', 'true');
            console.log('Seeding completed successfully.');
          })
          .catch(err => {
            console.error('Seeding failed even for admin:', err);
          });
      }
    }
  }, [user]);

  return null;
}
