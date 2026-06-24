import { signal } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';

// 이미지 업로드 유틸리티
export function useImageUpload(supabase: SupabaseService, bucket: string) {
    const selectedFile = signal<File | null>(null);
    const uploading = signal(false);
    const imageUrl = signal('');

    function onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            selectedFile.set(input.files[0]);
            imageUrl.set(URL.createObjectURL(input.files[0]));
        }
    }

    async function upload(): Promise<string | null> {
        const file = selectedFile();
        if (!file) return imageUrl() || null;
        uploading.set(true);
        try {
            const url = await supabase.uploadImage(bucket, file);
            imageUrl.set(url);
            return url;
        } catch (err) {
            console.error('이미지 업로드 실패:', err);
            return null;
        } finally {
            uploading.set(false);
        }
    }

    function reset() {
        selectedFile.set(null);
        imageUrl.set('');
    }

    return { selectedFile, uploading, imageUrl, onFileSelected, upload, reset };
}
