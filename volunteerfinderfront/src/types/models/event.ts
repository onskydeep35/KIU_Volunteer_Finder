export interface Event {
  event_id: string;
  creator_user_id: string;
  image_url: string;
  start_date: string; 
  end_date: string;
  description: string;
  volunteer_form: string[];
  applications: string[];
  hits: number;
  category: string;
  org_title: string;
  country: string;
  region: string;
  city: string;
}
