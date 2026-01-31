
export interface PageInfo {
    id: string;
    title: string;
    slug: string;
    status: 'published' | 'draft';
    icon?: string;
    isFolder?: boolean;
    children?: PageInfo[];
}

export interface Website {
    id: string;
    title: string;
    url: string;
    thumbnail: string;
    status: 'active' | 'expired' | 'trial';
    trialDaysLeft?: number;
    tags: string[];
    permissions: 'Owner' | 'Editor' | 'Contributor';
}
