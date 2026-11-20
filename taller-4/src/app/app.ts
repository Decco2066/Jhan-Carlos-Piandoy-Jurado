import { Component, signal } from '@angular/core';

import { Header } from './componentes/header/header';
import { SideBar } from './componentes/side-bar/side-bar';
import { Content } from './componentes/content/content';
import { Footer } from './componentes/footer/footer';

@Component({
  imports: [ Header, SideBar, Content, Footer],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('taller-4');
}
