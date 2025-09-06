// viewModels/EditPetViewModel.ts
import { useCallback, useMemo, useState } from 'react';
import PetApiService from '../api/services/PetApiService';
import { apiClient } from '../api';
import { Pet, UpdatePetRequest } from '../types/pet';

export function useEditPetViewModel() {
  const petService = useMemo(() => new PetApiService(apiClient), []);

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPet = useCallback(
    async (petId: string) => {
      setError(null);
      setLoading(true);
      try {
        const res = await petService.getPetById(petId);
        if (!res.success || !res.data)
          throw new Error(res.error || 'Failed to load pet');
        setPet(res.data);
        return res.data;
      } catch (e: any) {
        setError(e.message || 'Failed to load pet');
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [petService],
  );

  const updatePet = useCallback(
    async (petId: string, data: UpdatePetRequest) => {
      setError(null);
      setSaving(true);
      try {
        const res = await petService.updatePet(petId, data);
        if (!res.success || !res.data)
          throw new Error(res.error || 'Failed to update pet');
        setPet(res.data);
        return res.data;
      } catch (e: any) {
        setError(e.message || 'Failed to update pet');
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [petService],
  );

  return { pet, loading, saving, error, loadPet, updatePet };
}
