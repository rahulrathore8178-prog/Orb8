import axios from "axios";
import { requestNotificationToken } from "../firebase";
import { getAuthHeaders } from "../utilites/communityHelper";

export async function registerPushNotifications() {
  const token = await requestNotificationToken();

  await axios.post(
    `${import.meta.env.VITE_API_URL || ""}/api/firebase/user/device-token`,
    { token },
    {
      withCredentials: true,
      headers: getAuthHeaders(),
    }
  );

  return token;
}