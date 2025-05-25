// Vote-related types
export interface VoteState {
  review_id: string;
  vote: 'up' | 'down';
  vote_id: string;
}
