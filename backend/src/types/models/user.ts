export interface User {
  user_id: string;          
  first_name: string;
  last_name: string;
  age: number;
  sex: 'Male' | 'Female';
  email: string;
  username: string;
  password: string;
  applications: string[];
  events: string[];
}