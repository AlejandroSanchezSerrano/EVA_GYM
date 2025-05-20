export interface UserAdmin {
  id: number;
  name: string;
  age: number;
  weight: number;
  height: number;
  gender: string;
  activity_level: string;
  goal: string;
  daily_calories: number;
  passwd?: string; 
}
