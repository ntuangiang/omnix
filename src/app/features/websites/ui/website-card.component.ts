import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Website } from '../domain/website.models';

@Component({
  selector: 'app-website-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-64 bg-slate-100 relative overflow-hidden shrink-0">
        <img [src]="website().thumbnail" class="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500">
    </div>
    <div class="flex-1 p-8 flex flex-col justify-center relative">
        <div class="flex justify-between items-start">
            <div>
                <h3 class="font-serif text-xl font-bold text-slate-900 mb-2">{{ website().title }}</h3>
                <p class="text-sm text-slate-500 font-mono">{{ website().url }}</p>

                @if (showStatus()) {
                    <div class="flex items-center gap-3 mt-4">
                        @if (website().status === 'trial') {
                            <span class="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                Trial ends in {{ website().trialDaysLeft }} days
                            </span>
                        } @else if (website().status === 'expired') {
                            <span class="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
                                Website trial expired
                            </span>
                        } @else {
                            <span class="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                                Active
                            </span>
                        }
                    </div>
                }
            </div>
        </div>
    </div>
  `,
  host: {
    class: 'group bg-white border border-slate-200 rounded-lg overflow-hidden flex shadow-sm hover:shadow-md transition-shadow h-48'
  }
})
export class WebsiteCardComponent {
  website = input.required<Website>();
  showStatus = input<boolean>(false);
}
