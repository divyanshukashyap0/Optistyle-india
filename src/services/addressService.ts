
import { db } from '../firebase'; 
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, writeBatch } from 'firebase/firestore';
import { Address } from '../types';

const getAddressCollection = (userId: string) => {
    // If DB isn't initialized (missing keys), this will throw.
    // Ideally we'd mock or check db here, but UI usually guards against this.
    if (!db) throw new Error("Database not initialized");
    return collection(db, 'users', userId, 'addresses');
};

export const getUserAddresses = async (userId: string): Promise<Address[]> => {
    if (!db) return []; // Graceful fail
    try {
        const q = query(getAddressCollection(userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Address));
    } catch (error) {
        console.error("Error fetching addresses", error);
        return [];
    }
};

export const saveUserAddress = async (userId: string, address: Omit<Address, 'id'>) => {
    if (!db) return null;
    try {
        const colRef = getAddressCollection(userId);
        
        // If this is default, remove default from others
        if (address.isDefault) {
            const batch = writeBatch(db);
            const snapshot = await getDocs(colRef);
            snapshot.forEach(doc => {
                batch.update(doc.ref, { isDefault: false });
            });
            await batch.commit();
        }

        const docRef = await addDoc(colRef, address);
        return { id: docRef.id, ...address };
    } catch (error) {
        console.error("Error saving address", error);
        throw error;
    }
};

export const deleteUserAddress = async (userId: string, addressId: string) => {
    if (!db) return;
    await deleteDoc(doc(db, 'users', userId, 'addresses', addressId));
};
