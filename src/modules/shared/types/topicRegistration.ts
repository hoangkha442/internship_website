export interface TopicRegistration {
  id: number;
  topic_id: number;
  student_id: number;
  status: "pending" | "approved" | "rejected";
  registered_at: string;

  students?: {
    id: number;
    student_code: string;
    users: {
      full_name: string;
      email: string;
    };
    classes: {
      class_name: string;
      class_code: string;
    } | null;
  };
}

export interface TopicRegistrationListMeta {
  total: number;
  page: number;
  limit: number;
}

export interface TopicRegistrationListResponse {
  items: TopicRegistration[];
  meta: TopicRegistrationListMeta;
}
