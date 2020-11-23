import express from "express";
import BillRouter from "./routes/bill";
import defaultRouter from "./routes/default";
import GamesRouter from "./routes/games";
import MonitorRouter from "./routes/monitor";
import notificationRoute from "./routes/notification";
import PlayerRouter from "./routes/player";
import RecordRouter from "./routes/records";
import RoomRoute from "./routes/rooms";
import userRoute from "./routes/users";
import VideoRoute from "./routes/video";
import WalletRouter from "./routes/wallet";

const customRoute = express();

customRoute.use("/account", userRoute);
customRoute.use("/player", PlayerRouter);
customRoute.use("/games", GamesRouter);
customRoute.use("/monitor", MonitorRouter);
customRoute.use("/records", RecordRouter);
customRoute.use("/default", defaultRouter);
customRoute.use("/rooms", RoomRoute);
customRoute.use("/video", VideoRoute);
customRoute.use("/wallet", WalletRouter);
customRoute.use("/notifications", notificationRoute);
customRoute.use("/bill", BillRouter);

export default customRoute;
