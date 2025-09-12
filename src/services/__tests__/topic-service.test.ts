import { addTopic, Topic } from '../topic-service';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Mock the entire module to control the functions
jest.mock('firebase/firestore');

describe('Topic Service', () => {

  // Clear mock history before each test
  beforeEach(() => {
    (addDoc as jest.Mock).mockClear();
    (collection as jest.Mock).mockClear();
  });

  it('should create a new topic with correct default values', async () => {
    // Arrange
    const newTopicData: Omit<Topic, 'id'> = {
      title: 'Test Topic',
      description: 'A test description.',
      course: 'CS101',
      author: 'Test User',
      authorId: 'test-user-id',
      authorAvatar: 'avatar-url',
      status: 'Open', // Explicitly set, but we confirm it's passed
      replies: [],
      materials: [],
    };

    const mockCollectionRef = { id: 'topics_collection' };
    (collection as jest.Mock).mockReturnValue(mockCollectionRef);
    
    // Mock the return value of addDoc to simulate a successful Firestore write
    (addDoc as jest.Mock).mockResolvedValue({ id: 'new-doc-id' });

    // Act
    const topicId = await addTopic(newTopicData);

    // Assert
    // 1. Check that a document ID was returned
    expect(topicId).toBe('new-doc-id');
    
    // 2. Check that the `collection` function was called with the correct path
    expect(collection).toHaveBeenCalledWith(db, 'topics');
    
    // 3. Check that `addDoc` was called with the correct data payload
    expect(addDoc).toHaveBeenCalledWith(mockCollectionRef, newTopicData);
  });

});
