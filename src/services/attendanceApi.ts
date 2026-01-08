import { api } from "./config";

export type LocationPayload = {
  lat?: number;
  lng?: number;
  accuracy_m?: number;
};

export type AttendanceHistoryQuery = {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
};

export type RequestLeaveQuery = {
  date: string;
  status: "absent" | "excused";
  reason?: string;
};

export const attendanceApi = {
  today: async () => (await api.get("/attendance/student/today")).data,

  history: async (q: AttendanceHistoryQuery) =>
    (await api.get("/attendance/student/history", { params: q })).data,

  checkIn: async (payload: LocationPayload) =>
    (await api.post("/attendance/student/check-in", payload)).data,

  checkOut: async (payload: LocationPayload) =>
    (await api.post("/attendance/student/check-out", payload)).data,

  requestLeave: async (body: {
    date: string;
    status?: "excused";
    reason: string;
  }) =>
    (
      await api.post("/attendance/student/request-leave", {
        ...body,
        status: "excused",
      })
    ).data,
};

export const getLaptopLocation = () =>
  new Promise<{ lat: number; lng: number; accuracy_m: number }>(
    (resolve, reject) => {
      if (!navigator.geolocation)
        return reject(new Error("Trình duyệt không hỗ trợ GPS"));

      navigator.geolocation.getCurrentPosition(
        (p) =>
          resolve({
            lat: p.coords.latitude,
            lng: p.coords.longitude,
            accuracy_m: Math.round(p.coords.accuracy),
          }),
        (err) => {
          if (err?.code === 3) {
            navigator.geolocation.getCurrentPosition(
              (p2) =>
                resolve({
                  lat: p2.coords.latitude,
                  lng: p2.coords.longitude,
                  accuracy_m: Math.round(p2.coords.accuracy),
                }),
              (err2) => reject(err2),
              {
                enableHighAccuracy: false,
                timeout: 15000,
                maximumAge: 60_000,
              }
            );
            return;
          }

          reject(err);
        },
        {
          enableHighAccuracy: true,
          timeout: 20000, // tăng lên 20s
          maximumAge: 0,
        }
      );
    }
  );
