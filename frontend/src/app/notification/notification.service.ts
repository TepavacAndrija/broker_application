import { Injectable } from '@angular/core';
import { IndividualConfig, ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private toastr: ToastrService) {}

  showSuccess(message: string, title: string = 'Success'): void {
    this.toastr.success(message, title);
  }

  showError(message: string, title: string = 'Error'): void {
    this.toastr.error(message, title);
  }

  showInfo(message: string, title: string = 'Info'): void {
    this.toastr.info(message, title);
  }

  showWarning(message: string, title: string = 'Warning'): void {
    this.toastr.warning(message, title);
  }

  showEdit(message: string, title: string = 'Success'): void {
    this.toastr.success(message, title, {
      toastClass: 'ngx-toastr toast-match',
    });
  }

  showExercise(message: string, title: string = 'Success'): void {
    this.toastr.success(message, title, {
      toastClass: 'ngx-toastr toast-exercise',
    });
  }
}
