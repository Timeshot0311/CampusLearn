import { getTutorSubmissions } from '../assignment-service';
import { getDocs, query, where, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from '../user-service';

jest.mock('firebase/firestore');

describe('Assignment Service', () => {

  beforeEach(() => {
    (getDocs as jest.Mock).mockClear();
    (query as jest.Mock).mockClear();
    (where as jest.Mock).mockClear();
    (collection as jest.Mock).mockClear();
  });

  describe('getTutorSubmissions', () => {
    
    it('should return an empty array if tutor has no assigned courses', async () => {
      // Arrange
      const tutor: User = { id: 'tutor1', name: 'Test Tutor', email: 'tutor@test.com', role: 'tutor', status: 'Active', avatar: '', assignedCourses: [] };
      const allCourses: any[] = [];

      // Act
      const submissions = await getTutorSubmissions(tutor, allCourses);

      // Assert
      expect(submissions).toEqual([]);
      expect(query).not.toHaveBeenCalled(); // No query should be made
    });

    it('should construct a query with the correct course IDs and status', async () => {
      // Arrange
      const tutor: User = { 
        id: 'tutor1', 
        name: 'Test Tutor', 
        email: 'tutor@test.com', 
        role: 'tutor', 
        status: 'Active', 
        avatar: '', 
        assignedCourses: ['CS101', 'PHY202'] 
      };
      const allCourses: any[] = [];
      const mockSubmissions = [
        { id: 'sub1', data: () => ({ studentName: 'Alice', courseId: 'CS101' }) },
        { id: 'sub2', data: () => ({ studentName: 'Bob', courseId: 'PHY202' }) },
      ];
      
      // Mock Firestore responses
      (getDocs as jest.Mock).mockResolvedValue({ docs: mockSubmissions });

      // Act
      await getTutorSubmissions(tutor, allCourses);

      // Assert
      // 1. Verify that the query was called
      expect(query).toHaveBeenCalled();
      
      // 2. Verify the `where` clauses used to build the query
      expect(where).toHaveBeenCalledWith("courseId", "in", ['CS101', 'PHY202']);
      expect(where).toHaveBeenCalledWith("status", "==", "Submitted");
    });

    it('should return a correctly mapped list of submissions', async () => {
        // Arrange
        const tutor: User = { id: 'tutor1', name: 'Test Tutor', email: 'tutor@test.com', role: 'tutor', status: 'Active', avatar: '', assignedCourses: ['CS101'] };
        const allCourses: any[] = [];
        const mockSubmissionData = { studentName: 'Alice', courseId: 'CS101' };
        
        (getDocs as jest.Mock).mockResolvedValue({
            docs: [{ id: 'sub1', data: () => mockSubmissionData }]
        });
  
        // Act
        const submissions = await getTutorSubmissions(tutor, allCourses);
  
        // Assert
        expect(submissions).toHaveLength(1);
        expect(submissions[0]).toEqual({
            id: 'sub1',
            ...mockSubmissionData
        });
      });

  });

});
