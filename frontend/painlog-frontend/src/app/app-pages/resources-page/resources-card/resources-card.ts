import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-resources-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resources-card.html',
  styleUrl: './resources-card.css',
})
export class ResourcesCard {
  @Input() category = '';
  @Input() title = '';
  @Input() description = '';
  @Input() link = '';
  @Input() image = '';
  @Input() buttonText = 'Open';
}