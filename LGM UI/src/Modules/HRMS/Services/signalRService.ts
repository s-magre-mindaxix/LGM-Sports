import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import { fetchNotifications } from "../../../features/Notifications/notificationSlice";
import type { AppDispatch } from "../../../store";
import { API_ENDPOINTS } from "../../../API/apiConfig";
import { toast } from "sonner";

let connection: HubConnection | null = null;

export const startSignalRConnection = async (dispatch: AppDispatch) => {
  if (connection && connection.state === "Connected") {
    console.log("SignalR connection already established.");
    return;
  }

  const token = sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found, cannot start SignalR connection.");
    return;
  }

  const hubUrl = `${API_ENDPOINTS.BaseUrl.replace("/api", "")}/notificationHub`;

  connection = new HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => token,
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Information)
    .build();

  connection.on("ReceiveNotification", (message: string) => {
    console.log("Notification received:", message);
    toast.info(message);
    dispatch(fetchNotifications());
  });

  try {
    await connection.start();
    console.log("SignalR Connected.");
    dispatch(fetchNotifications());
  } catch (err) {
    console.error("SignalR Connection Error: ", err);
  }
};

export const stopSignalRConnection = () => {
  if (connection) {
    connection.stop();
    connection = null;
    console.log("SignalR Disconnected.");
  }
};
