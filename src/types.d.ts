import { ARCSavedRequest, ARCHistoryRequest } from '@advanced-rest-client/arc-types/src/request/ArcRequest';

export declare interface HistorySearchItem {
  kind: 'ARC#HistorySearchItem';
  /**
   * The history item
   */
  item: ARCHistoryRequest;
  /**
   * History's ISO time value.
   */
  isoTime: string;
}

export declare interface SavedProjectSearchItem {
  id: string;
  label: string;
}

export declare interface SavedSearchItem {
  kind: 'ARC#SavedSearchItem';
  /**
   * The saved item
   */
  item: ARCSavedRequest;
  /**
   * List of projects this request belongs to.
   */
  projects: SavedProjectSearchItem[];
}
