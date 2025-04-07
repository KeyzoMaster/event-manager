export interface AppEvent {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    location: string;
    category: string;
    participants_number: number;
    max_participants: number | null;
    user_id: number;
    created_at: string;
    updated_at: string;
}