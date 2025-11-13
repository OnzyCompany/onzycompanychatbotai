import { Tenant } from '../types';
import { db } from '../firebase/config';
// FIX: Changed firebase/firestore to @firebase/firestore for consistency.
import { collection, getDocs, doc, setDoc, addDoc, deleteDoc, writeBatch } from '@firebase/firestore';

// Function to get all tenants from Firestore
export async function getTenants(): Promise<Tenant[]> {
    try {
        const tenantsCollectionRef = collection(db, 'tenants');
        const snapshot = await getDocs(tenantsCollectionRef);
        const tenants = snapshot.docs.map(doc => ({
            ...(doc.data() as Omit<Tenant, 'docId'>),
            docId: doc.id,
        }));
        return tenants;
    } catch (error) {
        console.error("Failed to retrieve tenants from Firestore:", error);
        return [];
    }
}

// Function to save a single tenant (create or update)
export async function saveTenant(tenantData: Partial<Tenant>): Promise<void> {
    try {
        if (!tenantData.id || !tenantData.nome) {
            throw new Error("Tenant must have at least an id and a nome.");
        }

        const { docId, ...dataToSave } = tenantData;

        if (docId) {
            // Update existing document
            const tenantDocRef = doc(db, 'tenants', docId);
            await setDoc(tenantDocRef, dataToSave, { merge: true });
        } else {
            // Create new document
            await addDoc(collection(db, 'tenants'), dataToSave);
        }
    } catch (error) {
        console.error("Failed to save tenant to Firestore:", error);
    }
}

// Function to delete a tenant by its Firestore document ID
export async function deleteTenant(tenantDocId: string): Promise<void> {
    try {
        const tenantDocRef = doc(db, 'tenants', tenantDocId);
        
        // Before deleting the tenant, delete all its leads in the subcollection
        const leadsCollectionRef = collection(tenantDocRef, 'leads');
        const leadsSnapshot = await getDocs(leadsCollectionRef);
        
        if (!leadsSnapshot.empty) {
            const batch = writeBatch(db);
            leadsSnapshot.docs.forEach(leadDoc => {
                batch.delete(leadDoc.ref);
            });
            await batch.commit();
        }

        // Now, delete the tenant document itself
        await deleteDoc(tenantDocRef);

    } catch (error) {
        console.error("Failed to delete tenant from Firestore:", error);
    }
}