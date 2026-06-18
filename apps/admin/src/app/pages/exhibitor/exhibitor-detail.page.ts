import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Exhibitor } from './exhibitor.page';
import { Exhibition } from '../exhibition/exhibition.page';
import { ToastService } from '../../shared/toast/toast.service';

@Component ({    
    selector: 'app-exhibitor-detail',
    imports: [FormsModule],
    templateUrl: './exhibitor-detail.page.html'
}) 

export class ExhibitorDetailPage {
    private http = inject(HttpClient);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private toast = inject(ToastService);

     exhibitorId = Number(this.route.snapshot.paramMap.get('id'));  // ← exhibitorid 추출


    exhibitor = signal<Exhibitor | null>(null);
    exhibitions = signal<Exhibition[]>([]);
    exhibitorForm = signal<Exhibitor>({
        id: 0,
        companyName: '',
        companyNameEn: '',
        description: '',
        boothNumber: '',
        contactEmail: '',
        contactPhone: '',
        website: '',
        published: false,
        sortOrder: 0,
        exhibitionId: 0,
    });

constructor() {
    this.loadExhibitor();
    this.loadExhibitions();
}

//전시 업체 로드

loadExhibitor() {
     this.http.get<Exhibitor>(`/api/exhibitor/${this.exhibitorId}`)
     .subscribe({
        next: (res) => {
            this.exhibitor.set(res);
            this.exhibitorForm.set(res);
        },
        error: (err) => console.error('부스 업체 조회 실패:', err),
    });
}

//전시회 로드

 loadExhibitions() {
    this.http.get<Exhibition[]>('/api/exhibition').subscribe({
      next: (res) => this.exhibitions.set(res),
    });
  }

//전시 업체 수정

updateExhibitor() {
    const data = this.exhibitorForm();
    if (!data.companyName || !data.exhibitionId) {
      alert('업체명과 전시회 선택은 필수입니다.');
      return;
    }  

    const payload = {
      companyName: data.companyName,
      companyNameEn: data.companyNameEn,
      description: data.description,
      boothNumber: data.boothNumber,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      website: data.website,
      exhibitionId: data.exhibitionId,
    };

    this.http.patch(`/api/exhibitor/${this.exhibitorId}`, payload).subscribe({
      next: () => { this.toast.success('참가업체가 수정되었습니다.'); this.router.navigate(['/exhibitor']); },
      error: (err) => { console.error('참가업체 수정 실패:', err); this.toast.error('참가업체 수정에 실패했습니다.'); },
    });
  }


  //참가업체 삭제

deleteExhibitor() {
    if (confirm('정말 삭제하시겠습니까?')) {
      this.http.delete(`/api/exhibitor/${this.exhibitorId}`).subscribe({
        next: () => { this.toast.warning('삭제되었습니다.'); this.router.navigate(['/exhibitor']); },
        error: (err) => { console.error('참가업체 삭제 실패:', err); this.toast.error('참가업체 삭제에 실패했습니다.'); },
      });
    }
  }
 goBack() { this.router.navigate(['/exhibitor']); }
}