import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  schoolCode?: string;
  studentId?: string;
  enrolledClasses: string[];
}

export interface School {
  id: string;
  name: string;
  code: string;
  location: string;
  helpDesk: string;
  advisorInfo: string;
}

export interface Class {
  id: string;
  name: string;
  code: string;
  schoolCode?: string;
  instructor: string;
  schedule: string;
  location: string;
  description: string;
}

export interface Assignment {
  id: string;
  classId: string;
  className?: string; // Derived
  title: string;
  description: string;
  dueDate: Timestamp;
  type: 'individual' | 'group';
  reminder?: Timestamp;
}

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  date: Timestamp;
  location: string;
  category: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: Timestamp;
  author: string;
}

export interface ClassAlarm {
  id: string;
  classId: string;
  className: string;
  alarmTime: Timestamp;
  leadTimeMinutes?: number;
}

export interface StudyPost {
  id: string;
  userId: string;
  userName: string;
  title: string;
  content: string;
  type: 'help' | 'resource';
  category: string;
  link?: string;
  createdAt: Timestamp;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title?: string;
  content: string;
  mood?: string;
  createdAt: Timestamp;
}

export interface ForumMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Timestamp;
}
