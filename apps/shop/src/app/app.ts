import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { BottomNavComponent } from './components/bottom-nav/bottom-nav.component';

@Component({
  imports: [RouterModule, HeaderComponent, FooterComponent, BottomNavComponent],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {}

