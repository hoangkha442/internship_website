import type {
  TopicRegistration,
  TopicRegistrationListMeta,
  TopicRegistrationListResponse,
} from "../modules/shared/types/topicRegistration";

import { api } from "./config";

export const getPendingRegistrations = async (
  topicId: number,
  page = 1,
  limit = 10
): Promise<TopicRegistrationListResponse> => {
  const res = await api.get(`/internships/lecturer/topic-registrations`, {
    params: { topic_id: topicId, page, limit },
  });

  const body = res.data as any;

  const rawItems: any[] = body.data ?? body.items ?? body ?? [];

  const items: TopicRegistration[] = rawItems;

  const meta: TopicRegistrationListMeta = {
    total: body.meta?.total ?? rawItems.length,
    page: body.meta?.page ?? page,
    limit: body.meta?.limit ?? limit,
  };

  return { items, meta };
};

export const approveRegistration = async (
  id: number,
  note?: string
) => {
  const res = await api.patch(
    `/internships/lecturer/topic-registrations/approve/${id}`,
    { note }
  );
  return res.data;
};

export const rejectRegistration = async (
  id: number,
  reason: string
) => {
  const res = await api.patch(
    `/internships/lecturer/topic-registrations/reject/${id}`,
    { reason }
  );
  return res.data;
};
