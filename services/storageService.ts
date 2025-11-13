import { Lead } from '../types';
import { db } from '../firebase/config';
// FIX: Changed firebase/firestore to @firebase/firestore for consistency.
import { collection, query, where, getDocs, updateDoc, addDoc, doc } from '@firebase/firestore';


export async function saveLead(tenantDocId: string, data: Record<string, any>, sessionId: string | null): Promise<void> {
  try {
    const leadsCollectionRef = collection(db, 'tenants', tenantDocId, 'leads');
    
    let existingLeadDocId: string | null = null;

    if (sessionId) {
      const q = query(leadsCollectionRef, where("sessionId", "==", sessionId));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        existingLeadDocId = querySnapshot.docs[0].id;
      }
    }

    if (existingLeadDocId) {
      // Update the existing lead
      const leadDocRef = doc(leadsCollectionRef, existingLeadDocId);
      await updateDoc(leadDocRef, {
        ...data,
        timestamp: new Date().toISOString(), // Update timestamp
      });
    } else {
      // Create a new lead
      const newLeadData = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        sessionId: sessionId || null,
        ...data,
      };
      await addDoc(leadsCollectionRef, newLeadData);
    }
  } catch (error) {
    console.error("Failed to save lead to Firestore:", error);
  }
}

export async function getLeads(tenantDocId: string): Promise<Lead[]> {
  try {
    const leadsCollectionRef = collection(db, 'tenants', tenantDocId, 'leads');
    const snapshot = await getDocs(leadsCollectionRef);
    // FIX: Correctly type the mapped document data as Lead.
    const leads = snapshot.docs.map((doc) => ({
      ...(doc.data()),
      docId: doc.id
    } as Lead));
    return leads;
  } catch (error) {
    console.error("Failed to retrieve leads from Firestore:", error);
    return [];
  }
}