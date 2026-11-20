import { Component } from '@angular/core';

import { FooterItem } from '../footer-item/footer-item';

@Component({
  imports: [FooterItem],
  selector: 'app-footer',
  styleUrl: './footer.css',
  templateUrl: './footer.html',
})
export class Footer {}
