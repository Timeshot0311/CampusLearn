// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Firebase services
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  updateDoc: jest.fn(),
}));

jest.mock('@/lib/firebase', () => ({
  db: jest.fn(),
}));
