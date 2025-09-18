import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  increment,
  orderBy, 
  query,
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../config/firebase';

class FirebaseService {
  constructor() {
    this.wishesCollection = collection(db, 'wishes');
    this.reportsCollection = collection(db, 'reports');
  }

  // Get all wishes with real-time updates
  onWishesUpdate(callback) {
    const q = query(this.wishesCollection, orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const wishes = [];
      snapshot.forEach((doc) => {
        wishes.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate()
        });
      });
      callback(wishes);
    });
  }

  // Get all wishes (one-time fetch)
  async getWishes() {
    try {
      const q = query(this.wishesCollection, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const wishes = [];
      
      querySnapshot.forEach((doc) => {
        wishes.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate()
        });
      });
      
      return wishes;
    } catch (error) {
      console.error('Error fetching wishes:', error);
      throw error;
    }
  }

  // Add a new wish
  async addWish(wishData) {
    try {
      const docRef = await addDoc(this.wishesCollection, {
        ...wishData,
        timestamp: new Date(),
        hearts: 0,
        isWishOfTheDay: false
      });
      
      return {
        id: docRef.id,
        ...wishData,
        timestamp: new Date(),
        hearts: 0,
        isWishOfTheDay: false
      };
    } catch (error) {
      console.error('Error adding wish:', error);
      throw error;
    }
  }

  // Update heart count for a wish
  async updateWishHearts(wishId) {
    try {
      const wishRef = doc(db, 'wishes', wishId);
      await updateDoc(wishRef, {
        hearts: increment(1)
      });
    } catch (error) {
      console.error('Error updating hearts:', error);
      throw error;
    }
  }

  // Report inappropriate content
  async reportWish(wishId, reason, details) {
    try {
      await addDoc(this.reportsCollection, {
        wishId,
        reason,
        details,
        timestamp: new Date(),
        status: 'pending'
      });
      return true;
    } catch (error) {
      console.error('Error reporting wish:', error);
      throw error;
    }
  }

  // Set wish of the day (admin function)
  async setWishOfTheDay(wishId) {
    try {
      // First, remove wish of the day from all wishes
      const allWishes = await this.getWishes();
      const updatePromises = allWishes
        .filter(wish => wish.isWishOfTheDay)
        .map(wish => updateDoc(doc(db, 'wishes', wish.id), { isWishOfTheDay: false }));
      
      await Promise.all(updatePromises);

      // Set the new wish of the day
      const wishRef = doc(db, 'wishes', wishId);
      await updateDoc(wishRef, {
        isWishOfTheDay: true
      });
    } catch (error) {
      console.error('Error setting wish of the day:', error);
      throw error;
    }
  }
}

export default FirebaseService;