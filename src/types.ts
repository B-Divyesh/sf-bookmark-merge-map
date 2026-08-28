export type SourceId = 'a' | 'b';
export type RowStatus = 'shared' | 'a-only' | 'b-only' | 'conflict';

export interface Bookmark {
  id: string;
  source: SourceId;
  title: string;
  url: string;
  canonical: string;
  folder: string[];
  addDate?: string;
}

export interface ImportedMap {
  name: string;
  importedAt: number;
  html: string;
  bookmarks: Bookmark[];
}

export interface MergeRow {
  id: string;
  status: RowStatus;
  canonical: string;
  items: Bookmark[];
  title: string;
  folder: string[];
  included: boolean;
  notes: string[];
}

export interface SavedProject {
  mapA?: Pick<ImportedMap, 'name' | 'importedAt' | 'html'>;
  mapB?: Pick<ImportedMap, 'name' | 'importedAt' | 'html'>;
  stripTracking: boolean;
  savedAt: number;
  decisions?: Record<string, { included: boolean; title: string; folder: string[] }>;
}
