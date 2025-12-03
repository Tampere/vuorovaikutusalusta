import { LocalizedText } from './survey';

export interface GeneralNotification {
  id: string;
  title: LocalizedText;
  message: LocalizedText;
  createdAt: string;
  publisher: string;
  startDate: Date | null;
  endDate: Date | null;
  publishedInternally: boolean;
  publishedExternally: boolean;
}

export interface NotificationFormData {
  title: LocalizedText;
  message: LocalizedText;
  startDate: Date | null;
  endDate: Date | null;
  publishedInternally: boolean;
  publishedExternally: boolean;
}
