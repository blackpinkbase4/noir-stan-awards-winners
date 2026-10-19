export interface NomineeResult {
  nominee_id: string;
  x_username: string;
  display_name: string;
  avatar_url?: string | null;
  votes: number;
  percentage: number;
  is_winner: boolean;
  is_tied?: boolean;
}

export interface CategoryWinnerResult {
  category_id: string;
  category_title: string;
  category_description?: string;
  icon?: string;
  total_votes: number;
  manual_winner_id?: string | null;
  nominees: NomineeResult[];
  winners: NomineeResult[];
  is_tied?: boolean;
}

export interface WinnerEventStats {
  event_name: string;
  total_votes: number;
  total_voters: number;
  total_categories: number;
}
