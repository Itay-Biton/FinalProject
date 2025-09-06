// viewModels/RegisterPetViewModel.ts
import { useState } from 'react';
import PetApiService from '../api/services/PetApiService';
import UploadApiService from '../api/services/UploadApiService';
import { apiClient } from '../api';
import { CreatePetRequest, Pet, UpdatePetRequest } from '../types/pet';
import { UploadImageRequest } from '../types/upload';
import RNFS from 'react-native-fs'; // <-- NEW

/**
 * Hook to orchestrate:
 *  1) creating a pet,
 *  2) uploading its images,
 *  3) updating its description,
 *  4) updating found details (optional),
 *  5) updating contact info (phoneNumbers/email).
 */
export function useRegisterPetViewModel() {
  const petService = new PetApiService(apiClient);
  const uploadService = new UploadApiService(apiClient);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------------- helpers ----------------
  const emptyToUndef = (v?: string | null) => {
    if (typeof v !== 'string') return v ?? undefined;
    const s = v.trim();
    return s ? s : undefined;
  };

  const toISODateFlexible = (v?: string | null): string | undefined => {
    const s = emptyToUndef(v);
    if (!s) return undefined;
    // Accept DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
      const [dd, mm, yyyy] = s.split('/');
      const d = new Date(`${yyyy}-${mm}-${dd}T00:00:00Z`);
      return isNaN(d.getTime()) ? undefined : d.toISOString();
    }
    const d = new Date(s);
    return isNaN(d.getTime()) ? undefined : d.toISOString();
  };

  const makeGeoPoint = (lng?: number | null, lat?: number | null) => {
    if (
      typeof lng === 'number' &&
      typeof lat === 'number' &&
      Number.isFinite(lng) &&
      Number.isFinite(lat)
    ) {
      return { type: 'Point', coordinates: [lng, lat] as [number, number] };
    }
    return undefined;
  };

  // Small sleep helper
  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

  /**
   * Wait until a file is present and its size stops changing.
   * This guards against uploading a path before the OS has fully flushed it to disk.
   *
   * It polls RNFS.stat(uri) (which exposes size/mtime) until two consecutive
   * reads are stable (or a timeout occurs). On Android, RNFS.stat also supports
   * content:// URIs and exposes originalFilepath if applicable.
   */
  async function waitForFileReady(
    uri: string,
    opts?: { maxTries?: number; intervalMs?: number; minBytes?: number },
  ): Promise<void> {
    const maxTries = opts?.maxTries ?? 25; // ~3–4s default
    const intervalMs = opts?.intervalMs ?? 150;
    const minBytes = opts?.minBytes ?? 1;

    let lastSize = -1;
    for (let attempt = 0; attempt < maxTries; attempt++) {
      try {
        const stat = await RNFS.stat(uri); // size, mtime, path/originalFilepath
        const sizeNow =
          typeof stat.size === 'number' ? stat.size : Number(stat.size || 0);

        if (sizeNow >= minBytes) {
          // second check to ensure it's not still growing
          if (sizeNow === lastSize) {
            return; // stable across consecutive polls ⇒ file ready
          }
          lastSize = sizeNow;
        }
      } catch {
        // ignore; probably not written yet
      }
      await sleep(intervalMs);
    }
    throw new Error('File is not ready yet. Please retry.');
  }

  /**
   * Creates a new pet record.
   */
  async function registerPet(
    data: Omit<CreatePetRequest, 'images'> & {
      images: string[];
      type?: 'pet' | 'business' | 'profile';
    },
  ): Promise<Pet> {
    setLoading(true);
    setError(null);

    try {
      if (data.isFound && !('foundDetails' in data)) {
        (data as any).foundDetails = {
          notes: 'Found pet reported during registration',
          location: {
            address: '',
            coordinates: {
              type: 'Point',
              coordinates: [0, 0],
            },
          },
        };
      }
      const createRes = await petService.createPet(data as CreatePetRequest);

      if (!createRes.success || !createRes.data) {
        throw new Error(createRes.error || 'Failed to create pet');
      }

      return createRes.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Uploads an array of image URIs for an existing pet.
   * Filters out null/undefined values and uploads only valid image URIs.
   * NEW: For each image, waits until the file is fully registered and stable on disk.
   */
  async function uploadPetImages(
    petId: string,
    imageUris: (string | null)[],
    type: 'pet' | 'business' | 'profile' = 'pet',
  ): Promise<void> {
    setLoading(true);
    setError(null);

    try {
      const validImageUris = imageUris.filter(
        (uri): uri is string =>
          uri !== null && uri !== undefined && uri.trim() !== '',
      );

      if (validImageUris.length === 0) {
        console.log('No valid images to upload');
        return;
      }

      console.log(`Uploading ${validImageUris.length} images for pet ${petId}`);

      for (let i = 0; i < validImageUris.length; i++) {
        const uri = validImageUris[i];

        // 1) Ensure file exists & is stable before upload
        console.log(`Waiting for file to be ready: [${i + 1}] ${uri}`);
        await waitForFileReady(uri);

        // 2) Build filename/mime
        const fileName = uri.split('/').pop() || `pet_image_${i + 1}.jpg`;

        let mimeType = 'image/jpeg';
        if (fileName.toLowerCase().endsWith('.png')) {
          mimeType = 'image/png';
        } else if (fileName.toLowerCase().endsWith('.webp')) {
          mimeType = 'image/webp';
        }

        const uploadRequest: UploadImageRequest = {
          file: {
            uri,
            name: fileName,
            type: mimeType,
          },
          type,
          petId,
        };

        console.log(
          `Uploading image ${i + 1}/${validImageUris.length}:`,
          fileName,
        );

        const uploadRes = await uploadService.uploadImage(uploadRequest);

        if (!uploadRes.success) {
          throw new Error(
            uploadRes.error || `Failed to upload image ${fileName}`,
          );
        }

        console.log(
          `Successfully uploaded image ${i + 1}:`,
          uploadRes.data?.imageUrl,
        );
      }

      console.log(`Successfully uploaded all ${validImageUris.length} images`);
    } catch (err: any) {
      console.error('Error uploading pet images:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Updates only the description of an existing pet.
   */
  async function updatePetDescription(
    petId: string,
    description: string,
  ): Promise<Pet> {
    setLoading(true);
    setError(null);

    try {
      const updateRes = await petService.updatePet(petId, { description });
      if (!updateRes.success || !updateRes.data) {
        throw new Error(updateRes.error || 'Failed to update pet');
      }
      return updateRes.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Updates found details (used in Step 3 if "Found" was ticked on Step 1).
   * NOTE: We send GeoJSON for coordinates to match server schema.
   */
  async function updateFoundDetails(
    petId: string,
    details: {
      dateFound?: string;
      address?: string;
      lat?: number;
      lng?: number;
      notes?: string;
      isFound?: boolean;
    },
  ): Promise<Pet> {
    setLoading(true);
    setError(null);

    try {
      const isoDate = toISODateFlexible(details.dateFound);
      const point = makeGeoPoint(
        details.lng ?? undefined,
        details.lat ?? undefined,
      );

      // Build a shape that the server will accept even if frontend DTO says array
      // (cast as any to avoid TS complaining about coordinates object)
      const body: UpdatePetRequest = {
        isFound: details.isFound,
        foundDetails: {
          dateFound: isoDate,
          notes: emptyToUndef(details.notes),
          location:
            point || emptyToUndef(details.address)
              ? ({
                  address: emptyToUndef(details.address),
                  coordinates: point, // { type:'Point', coordinates:[lng,lat] }
                } as any)
              : undefined,
        } as any,
      };

      // Remove foundDetails entirely if all fields are empty
      if (
        !body.foundDetails?.dateFound &&
        !body.foundDetails?.notes &&
        !body.foundDetails?.location
      ) {
        delete (body as any).foundDetails;
      }

      const res = await petService.updatePet(petId, body);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to update found details');
      }
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Update contact info (phoneNumbers/email) for the pet.
   * Filters blanks/dupes client-side.
   */
  async function updateContactInfo(
    petId: string,
    contact: { phoneNumbers?: string[]; email?: string },
  ): Promise<Pet> {
    setLoading(true);
    setError(null);

    try {
      const phones =
        contact.phoneNumbers
          ?.map(p => (p ?? '').trim())
          .filter(Boolean)
          .filter((v, i, self) => self.indexOf(v) === i) || undefined;

      const body: UpdatePetRequest = {
        phoneNumbers: phones,
        email: emptyToUndef(contact.email),
      };

      const res = await petService.updatePet(petId, body);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to update contact info');
      }
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Load a pet (to know if isFound is true on Step 3).
   */
  async function getPet(petId: string): Promise<Pet> {
    setLoading(true);
    setError(null);
    try {
      const res = await petService.getPetById(petId);
      if (!res.success || !res.data)
        throw new Error(res.error || 'Failed to load pet');
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    registerPet,
    uploadPetImages,
    updatePetDescription,
    updateFoundDetails,
    getPet,
    updateContactInfo,
  };
}
