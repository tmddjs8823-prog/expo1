import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToastComponent } from './shared/toast/toast.component';
import { ConfirmDialogComponent } from './shared/confirm-dialog/confirm-dialog.component';

@Component({
  imports: [RouterModule, ToastComponent, ConfirmDialogComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'admin';
}
