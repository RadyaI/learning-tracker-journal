export interface LogEntry {
  id: string;
  userId: string;
  createdAt: any; 
  dateString: string; 
  duration: number;
  content: string;
  mood: string;
  isEmergency: boolean;
  category?: string; 
}