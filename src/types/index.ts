export interface LogEntry {
  id: string;
  userId: string;
  createdAt: any;
  duration: number;
  content: string;
  mood: string;
  isEmergency: boolean;
}