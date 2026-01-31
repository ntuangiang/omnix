
import { Injectable, signal } from '@angular/core';
import { PageInfo, Website } from '../domain/website.models';

@Injectable({ providedIn: 'root' })
export class WebsitesStore {
  readonly websites = signal<Website[]>([
      {
          id: 'site_1',
          title: 'Don Mosley Portfolio',
          url: 'sunflower-guava-4z3y.squarespace.com',
          thumbnail: 'https://picsum.photos/400/300?random=10',
          status: 'trial',
          trialDaysLeft: 14,
          tags: ['WEBSITE'],
          permissions: 'Owner'
      },
      {
          id: 'site_2',
          title: 'Nexus Commerce (Copy)',
          url: 'lavender-breeze-9x9x.squarespace.com',
          thumbnail: 'https://picsum.photos/400/300?random=11',
          status: 'expired',
          tags: ['WEBSITE', 'SELLING'],
          permissions: 'Owner'
      }
  ]);

  readonly pages = signal<{category: string, expanded: boolean, items: PageInfo[]}[]>([
      {
          category: 'Main Navigation',
          expanded: true,
          items: [
              { id: 'store', title: 'Store', slug: '/store', status: 'published', icon: 'shopping-bag' },
              { id: 'bio', title: 'BIO', slug: '/bio', status: 'published', icon: 'user' },
              { id: 'portfolio', title: 'Portfolio', slug: '/portfolio', status: 'draft', icon: 'grid' },
              { id: 'awards', title: 'Awards', slug: '/awards', status: 'published', icon: 'star' }
          ]
      },
      {
          category: 'Not Linked',
          expanded: true,
          items: [
              { id: 'home', title: 'Home', slug: '/', status: 'published', icon: 'home' },
              { id: 'book', title: 'Book Now', slug: '/book', status: 'draft', icon: 'calendar' },
              { id: 'error', title: '404 Error', slug: '/404', status: 'published', icon: 'alert-circle' }
          ]
      }
  ]);

  toggleGroup(category: string) {
    this.pages.update(groups => 
      groups.map(g => g.category === category ? { ...g, expanded: !g.expanded } : g)
    );
  }
}
