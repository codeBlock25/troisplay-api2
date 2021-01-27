import { Router, Response, Request } from "express";
import { verify } from "jsonwebtoken";
import users from "../model/users";
import { config as envConfig } from "dotenv";
import CashWalletModel from "../model/cash_wallet";
import { compareSync } from "bcryptjs";
import Flutterwave from "flutterwave-node-v3";
import { PRODUCTION_FLAG, PUBLIC_KEY, SECRET_KEY } from "./wallet";
import PlayerModel from "../model/player";
import { NotificationAction } from "../function";
import { notificationHintType } from "../types/enum";
import { find } from "lodash";

envConfig();
const secret = process.env.SECRET ?? "";
export const payload: {
  country: string;
  customer: string;
  amount: number;
  recurrence: string;
  type: string;
  reference: number;
} = {
  country: "NG",
  customer: "",
  amount: 0,
  recurrence: "ONCE",
  type: "AIRTIME",
  reference: Math.ceil(Math.random() * 19920392039),
};

const BillRouter = Router();
const flw = new Flutterwave(PUBLIC_KEY, SECRET_KEY, PRODUCTION_FLAG);

BillRouter.post("/airtime", async (req: Request, res: Response) => {
  try {
    let auth = req.headers.authorization;
    if (!auth) {
      res.status(406).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token: string = auth.replace("Bearer ", "");
    if (!token || token === "") {
      res.status(406).json({ message: "error found", error: "empty token" });
      return;
    }
    let decoded = (verify(token, secret) as unknown) as { id: string };
    let found = await users.findById(decoded.id);
    if (!found) {
      res.status(406).json({ message: "error found", error: "invalid user" });
      return;
    }
    let { currentCash } = (await CashWalletModel.findOne({
      userID: decoded.id,
    })) ?? { currentCash: 0 };
    let {
      phone_number,
      amount,
      key,
    }: { phone_number: string; amount: number; key: string } = req.body;
    if (currentCash < amount) {
      res.status(401).json({ message: "insufficient fund" });
      return;
    }

    let isUser = compareSync(key, found.key);

    if (!isUser) {
      res.status(400).json({
        error: "incorrect key",
        messagee: "error found",
        k: {
          phone_number: phone_number.includes("+")
            ? phone_number
            : `+${phone_number}`,
          amount,
          key,
          found,
        },
      });
      return;
    }
    const response = await flw.Bills.create_bill({
      ...payload,
      amount,
      customer: phone_number.includes("+") ? phone_number : `+${phone_number}`,
      reference: Math.ceil(Math.random() * 19920392039),
    });
    res.json({ message: "awaiting" });

    if (response.data) {
      await CashWalletModel.updateOne(
        { userID: decoded.id },
        { $inc: { currentCash: -1 * amount } }
      )
        .then(async () => {
          await NotificationAction.add({
            message: `Your airtime purchase of ${amount}  was successful.`,
            userID: decoded.id,
            type: notificationHintType.win,
          });
        })
        .catch(() => {
          setTimeout(async () => {
            await CashWalletModel.updateOne(
              { userID: decoded.id },
              { $inc: { currentCash: -1 * amount } }
            ).then(async () => {
              await NotificationAction.add({
                message: `Your airtime purchase of ${amount}  was successful.`,
                userID: decoded.id,
                type: notificationHintType.win,
              });
            });
          }, 3000);
        });
      return;
    } else {
      await NotificationAction.add({
        message:
          "Sorry your transaction could not be processed at this time try again later",
        userID: decoded.id,
        type: notificationHintType.lost,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "error found", error });
  }
});

BillRouter.post("/data", async (req: Request, res: Response) => {
  try {
    let auth = req.headers.authorization;
    if (!auth) {
      res.status(406).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token: string = auth.replace("Bearer ", "");
    if (!token || token === "") {
      res.status(406).json({ message: "error found", error: "empty token" });
      return;
    }
    let decoded = (verify(token, secret) as unknown) as { id: string };
    let found = await users.findById(decoded.id);
    if (!found) {
      res.status(406).json({ message: "error found", error: "invalid user" });
      return;
    }
    let { currentCash } = (await CashWalletModel.findOne({
      userID: decoded.id,
    })) ?? { currentCash: 0 };
    let {
      phone_number,
      amount,
      key,
    }: {
      phone_number: string;
      amount:
        | "MTN 50 MB"
        | "MTN 150 MB"
        | "MTN 750 MB"
        | "MTN 1.5 GB"
        | "MTN 3.5 GB"
        | "MTN 5 GB data bundle"
        | "GLO 35 MB data bundle"
        | "GLO 100 MB data bundle"
        | "GLO 800 MB data bundle"
        | "GLO 1.6GB data bundle"
        | "GLO 3.75GB data bundle"
        | "GLO 5GB data bundle"
        | "9MOBILE 150 MB data bundle"
        | "9MOBILE 1GB data bundle"
        | "9MOBILE 1.5GB data bundle"
        | "9MOBILE 2.5GB data bundle"
        | "9MOBILE 4GB data bundle"
        | "9MOBILE 11.5GB data bundle"
        | "AIRTEL 10 MB data bundle"
        | "AIRTEL 50 MB data bundle"
        | "AIRTEL 200 MB data bundle"
        | "AIRTEL 350 MB data bundle"
        | "AIRTEL 750 MB data bundle"
        | "AIRTEL 1.3GB data bundle"
        | "AIRTEL 3.5GB data bundle"
        | "AIRTEL 5GB data bundle"
        | "AIRTEL 7GB data bundle"
        | "AIRTEL 9GB data bundle"
        | "AIRTEL 10GB data bundle";
      key: string;
    } = req.body;
    const data1 = find(mtnData, { biller_name: amount });
    const data2 = find(gloData, { biller_name: amount });
    const data3 = find(airtelData, { biller_name: amount });
    const data4 = find(nineMobileData, { biller_name: amount });
    let data = data1 ?? data2 ?? data3 ?? data4;

    if (!data) {
      res.status(404).json({ message: "not found" });
      return;
    }
    if (currentCash < data.amount) {
      res.status(401).json({ message: "insufficient fund" });
      return;
    }

    let isUser = compareSync(key, found.key);

    if (!isUser) {
      res.status(400).json({
        error: "incorrect key",
        message: "error found",
        k: {
          phone_number: phone_number.includes("+")
            ? phone_number
            : `+${phone_number}`,
          amount,
          key,
          found,
        },
      });
      return;
    }

    const response = await flw.Bills.create_bill({
      ...payload,
      amount: data?.amount,
      type: amount,
      customer: phone_number.includes("+") ? phone_number : `+${phone_number}`,
      reference: Math.ceil(Math.random() * 19920392039),
    });
    res.json({ message: "awaiting" });

    if (response.data) {
      await CashWalletModel.updateOne(
        { userID: decoded.id },
        { $inc: { currentCash: -1 * (data?.amount ?? 0) } }
      )
        .then(async () => {
          await NotificationAction.add({
            message: `Your airtime purchase of ${amount}  was successful.`,
            userID: decoded.id,
            type: notificationHintType.win,
          });
        })
        .catch(() => {
          setTimeout(async () => {
            await CashWalletModel.updateOne(
              { userID: decoded.id },
              { $inc: { currentCash: -1 * (data?.amount ?? 0) } }
            ).then(async () => {
              await NotificationAction.add({
                message: `Your Data purchase of ${data?.biller_name} at ₦${
                  data?.amount ?? 0
                }  was successful.`,
                userID: decoded.id,
                type: notificationHintType.win,
              });
            });
          }, 3000);
        });
      return;
    } else {
      await NotificationAction.add({
        message:
          "Sorry your transaction could not be processed at this time try again later",
        userID: decoded.id,
        type: notificationHintType.lost,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "error found", error });
  }
});

BillRouter.post("/tv", async (req: Request, res: Response) => {
  try {
    let auth = req.headers.authorization;
    if (!auth) {
      res.status(406).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token: string = auth.replace("Bearer ", "");
    if (!token || token === "") {
      res.status(406).json({ message: "error found", error: "empty token" });
      return;
    }
    let decoded = (verify(token, secret) as unknown) as { id: string };
    let found = await users.findById(decoded.id);
    if (!found) {
      res.status(406).json({ message: "error found", error: "invalid user" });
      return;
    }
    let { currentCash } = (await CashWalletModel.findOne({
      userID: decoded.id,
    })) ?? { currentCash: 0 };
    let {
      phone_number,
      amount,
      key,
    }: {
      phone_number: string;
      amount:
        | "DSTV Payment"
        | "DSTV Access"
        | "GOTV Light Quarterly"
        | "GOTV Value"
        | "GOTV Plus";
      key: string;
    } = req.body;
    const data = find(billCategory, { biller_name: amount });

    if (!data) {
      res.status(404).json({ message: "not found" });
      return;
    }
    if (currentCash < data.amount) {
      res.status(401).json({ message: "insufficient fund" });
      return;
    }

    let isUser = compareSync(key, found.key);

    if (!isUser) {
      res.status(400).json({
        error: "incorrect key",
        message: "error found",
        k: {
          phone_number: phone_number.includes("+")
            ? phone_number
            : `+${phone_number}`,
          amount,
          key,
          found,
        },
      });
      return;
    }

    const response = await flw.Bills.create_bill({
      ...payload,
      amount: data.amount,
      type: amount,
      customer: phone_number.includes("+") ? phone_number : `+${phone_number}`,
      reference: Math.ceil(Math.random() * 19920392039),
    });
    res.json({ message: "awaiting" });

    if (response.data) {
      await CashWalletModel.updateOne(
        { userID: decoded.id },
        { $inc: { currentCash: -1 * (data?.amount ?? 0) } }
      )
        .then(async () => {
          await NotificationAction.add({
            message: `Your TV subscription purchase of ${data?.biller_name} at ₦${data.amount}  was successful.`,
            userID: decoded.id,
            type: notificationHintType.win,
          });
        })
        .catch(() => {
          setTimeout(async () => {
            await CashWalletModel.updateOne(
              { userID: decoded.id },
              { $inc: { currentCash: -1 * (data?.amount ?? 0) } }
            ).then(async () => {
              await NotificationAction.add({
                message: `Your TV subscription purchase of ${data.biller_name} at ₦${data.amount}  was successful.`,
                userID: decoded.id,
                type: notificationHintType.win,
              });
            });
          }, 3000);
        });
      return;
    } else {
      await NotificationAction.add({
        message:
          "Sorry your transaction could not be processed at this time try again later",
        userID: decoded.id,
        type: notificationHintType.lost,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "error found", error });
  }
});

BillRouter.post("/transfer", async (req: Request, res: Response) => {
  try {
    let auth = req.headers.authorization;
    if (!auth) {
      res.status(406).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token: string = auth.replace("Bearer ", "");
    if (!token || token === "") {
      res.status(406).json({ message: "error found", error: "empty token" });
      return;
    }
    let decoded = (verify(token, secret) as unknown) as { id: string };
    let found = await users.findById(decoded.id);
    if (!found) {
      res.status(406).json({ message: "error found", error: "invalid user" });
      return;
    }
    let { currentCash } = (await CashWalletModel.findOne({
      userID: decoded.id,
    })) ?? { currentCash: 0 };
    let {
      username,
      amount,
      key,
    }: { username: string; amount: number; key: string } = req.body;
    if (currentCash < amount) {
      res
        .status(401)
        .json({ message: "error found", error: "insuficient fund" });
      return;
    }
    let playerDetails = await PlayerModel.findOne({ playername: username });
    if (!playerDetails) {
      res.status(404).json({ message: "error found", error: "user not found" });
      return;
    }
    let isUser = compareSync(key, found.key);
    if (!isUser) {
      res.status(403).json({ message: "error found", error: "incorrect key" });
      return;
    }
    let { currentCash: currentCashP2 } = (await CashWalletModel.findOne({
      userID: playerDetails.userID,
    })) ?? { currentCash: 0 };
    await CashWalletModel.updateOne(
      { userID: decoded.id },
      { currentCash: currentCash - amount }
    );
    await CashWalletModel.updateOne(
      { userID: playerDetails.userID },
      { currentCash: currentCashP2 + amount }
    );
    res.json({ message: "succesful" });
  } catch (error) {
    res.status(500).json({ message: "error found", error });
  }
});

BillRouter.post("/transfer/direct", async (req: Request, res: Response) => {
  try {
    let auth = req.headers.authorization;
    if (!auth) {
      res.status(406).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token: string = auth.replace("Bearer ", "");
    if (!token || token === "") {
      res.status(406).json({ message: "error found", error: "empty token" });
      return;
    }
    let decoded = (verify(token, secret) as unknown) as { id: string };
    let found = await users.findById(decoded.id);
    if (!found) {
      res.status(406).json({ message: "error found", error: "invalid user" });
      return;
    }
    let { currentCash } = (await CashWalletModel.findOne({
      userID: decoded.id,
    })) ?? { currentCash: 0 };
    let {
      username,
      amount,
      key,
    }: { username: string; amount: number; key: string } = req.body;
    if (currentCash < amount) {
      res
        .status(401)
        .json({ message: "error found", error: "insuficient fund" });
      return;
    }
    let playerDetails = await PlayerModel.findOne({ playername: username });
    if (!playerDetails) {
      res.status(404).json({ message: "error found", error: "user not found" });
      return;
    }
    let isUser = compareSync(key, found.key);
    if (!isUser) {
      res.status(403).json({ message: "error found", error: "incorrect key" });
      return;
    }
    const flw = new Flutterwave(PUBLIC_KEY, SECRET_KEY);

    const { bank_name } = (await PlayerModel.findOne({
      userID: decoded.id,
    })) ?? {
      bank_name: "",
    };
    const initTrans = async () => {
      try {
        const payload: {
          account_bank: string; //This is the recipient bank code. Get list here :https://developer.flutterwave.com/v3.0/reference#get-all-banks
          account_number: string;
          amount: number;
          narration: string;
          currency: string;
          reference: string; //This is a merchant's unique reference for the transfer, it can be used to query for the status of the transfer
          callback_url: string;
          debit_currency: string;
        } = {
          account_bank: "044", //This is the recipient bank code. Get list here :https://developer.flutterwave.com/v3.0/reference#get-all-banks
          account_number: "0690000040",
          amount: 200,
          narration: "ionnodo",
          currency: "NGN",
          reference: "transfer-" + Date.now(), //This is a merchant's unique reference for the transfer, it can be used to query for the status of the transfer
          callback_url:
            "https://webhook.site/b3e505b0-fe02-430e-a538-22bbbce8ce0d",
          debit_currency: "NGN",
        };

        const response = await flw.Transfer.initiate({
          ...payload,
          amount: amount,
          account_number: username,
          account_bank: bank_name,
        });
        res.json({ message: "play" });
        console.log(response);
      } catch (error) {
        console.log(error);
      }
    };

    initTrans();
    return;
    await CashWalletModel.updateOne(
      { userID: decoded.id },
      { currentCash: currentCash - amount }
    );

    res.json({ message: "succesful" });
  } catch (error) {
    res.status(500).json({ message: "error found", error });
  }
});

export default BillRouter;

const mtnData = [
  {
    id: 5,
    biller_code: "BIL104",
    name: "MTN DATA BUNDLE",
    default_commission: 0.1,
    date_added: "2020-09-17T15:56:44.653Z",
    country: "NG",
    is_airtime: false,
    biller_name: "MTN 50 MB",
    item_code: "MD104",
    short_name: "MTN DATA BUNDLE",
    fee: 0,
    commission_on_fee: false,
    label_name: "Mobile Number",
    amount: 100,
  },
  {
    id: 6,
    biller_code: "BIL104",
    name: "MTN DATA BUNDLE",
    default_commission: 0.1,
    date_added: "2020-09-17T15:56:44.653Z",
    country: "NG",
    is_airtime: false,
    biller_name: "MTN 150 MB",
    item_code: "MD105",
    short_name: "MTN DATA BUNDLE",
    fee: 0,
    commission_on_fee: false,
    label_name: "Mobile Number",
    amount: 200,
  },
  {
    id: 7,
    biller_code: "BIL104",
    name: "MTN DATA BUNDLE",
    default_commission: 0.1,
    date_added: "2020-09-17T15:56:44.653Z",
    country: "NG",
    is_airtime: false,
    biller_name: "MTN 750 MB",
    item_code: "MD106",
    short_name: "MTN DATA BUNDLE",
    fee: 0,
    commission_on_fee: false,
    label_name: "Mobile Number",
    amount: 500,
  },
  {
    id: 8,
    biller_code: "BIL104",
    name: "MTN DATA BUNDLE",
    default_commission: 0.1,
    date_added: "2020-09-17T15:56:44.653Z",
    country: "NG",
    is_airtime: false,
    biller_name: "MTN 1.5 GB",
    item_code: "MD107",
    short_name: "MTN DATA BUNDLE",
    fee: 0,
    commission_on_fee: false,
    label_name: "Mobile Number",
    amount: 1000,
  },
  {
    id: 9,
    biller_code: "BIL104",
    name: "MTN DATA BUNDLE",
    default_commission: 0.1,
    date_added: "2020-09-17T15:56:44.653Z",
    country: "NG",
    is_airtime: false,
    biller_name: "MTN 3.5 GB",
    item_code: "MD108",
    short_name: "MTN DATA BUNDLE",
    fee: 0,
    commission_on_fee: false,
    label_name: "Mobile Number",
    amount: 2000,
  },
  {
    id: 10,
    biller_code: "BIL104",
    name: "MTN DATA BUNDLE",
    default_commission: 0.1,
    date_added: "2020-09-17T15:56:44.653Z",
    country: "NG",
    is_airtime: false,
    biller_name: "MTN 5 GB data bundle",
    item_code: "MD109",
    short_name: "MTN DATA BUNDLE",
    fee: 0,
    commission_on_fee: false,
    label_name: "Mobile Number",
    amount: 3500,
  },
];

const gloData = [
  {
    id: 11,
    biller_code: "BIL105",
    name: "GLO DATA BUNDLE",
    default_commission: 0.1,
    date_added: "2020-09-17T15:56:47.247Z",
    country: "NG",
    is_airtime: false,
    biller_name: "GLO 35 MB data bundle",
    item_code: "MD110",
    short_name: "GLO DATA BUNDLE",
    fee: 0,
    commission_on_fee: false,
    label_name: "Mobile Number",
    amount: 100,
  },
  {
    id: 12,
    biller_code: "BIL105",
    name: "GLO DATA BUNDLE",
    default_commission: 0.1,
    date_added: "2020-09-17T15:56:47.247Z",
    country: "NG",
    is_airtime: false,
    biller_name: "GLO 100 MB data bundle",
    item_code: "MD111",
    short_name: "GLO DATA BUNDLE",
    fee: 0,
    commission_on_fee: false,
    label_name: "Mobile Number",
    amount: 200,
  },
  {
    id: 13,
    biller_code: "BIL105",
    name: "GLO DATA BUNDLE",
    default_commission: 0.1,
    date_added: "2020-09-17T15:56:47.247Z",
    country: "NG",
    is_airtime: false,
    biller_name: "GLO 800 MB data bundle",
    item_code: "MD112",
    short_name: "GLO DATA BUNDLE",
    fee: 0,
    commission_on_fee: false,
    label_name: "Mobile Number",
    amount: 500,
  },
  {
    id: 14,
    biller_code: "BIL105",
    name: "GLO DATA BUNDLE",
    default_commission: 0.1,
    date_added: "2020-09-17T15:56:47.247Z",
    country: "NG",
    is_airtime: false,
    biller_name: "GLO 1.6GB data bundle",
    item_code: "MD113",
    short_name: "GLO DATA BUNDLE",
    fee: 0,
    commission_on_fee: false,
    label_name: "Mobile Number",
    amount: 1000,
  },
  {
    id: 15,
    biller_code: "BIL105",
    name: "GLO DATA BUNDLE",
    default_commission: 0.1,
    date_added: "2020-09-17T15:56:47.247Z",
    country: "NG",
    is_airtime: false,
    biller_name: "GLO 3.75GB data bundle",
    item_code: "MD114",
    short_name: "GLO DATA BUNDLE",
    fee: 0,
    commission_on_fee: false,
    label_name: "Mobile Number",
    amount: 2000,
  },
  {
    id: 16,
    biller_code: "BIL105",
    name: "GLO DATA BUNDLE",
    default_commission: 0.1,
    date_added: "2020-09-17T15:56:47.247Z",
    country: "NG",
    is_airtime: false,
    biller_name: "GLO 5GB data bundle",
    item_code: "MD115",
    short_name: "GLO DATA BUNDLE",
    fee: 0,
    commission_on_fee: false,
    label_name: "Mobile Number",
    amount: 2500,
  },
];

const nineMobileData = [
  {
    id: 28,
    biller_code: "BIL107",
    name: "9MOBILE DATA BUNDLE",
    default_commission: 0.1,
    date_added: "2020-09-17T15:56:54.737Z",
    country: "NG",
    is_airtime: false,
    biller_name: "9MOBILE 150 MB data bundle",
    item_code: "MD127",
    short_name: "9MOBILE DATA BUNDLE",
    fee: 0,
    commission_on_fee: false,
    label_name: "Mobile Number",
    amount: 200,
  },
  {
    id: 29,
    biller_code: "BIL107",
    name: "9MOBILE DATA BUNDLE",
    default_commission: 0.1,
    date_added: "2020-09-17T15:56:54.737Z",
    country: "NG",
    is_airtime: false,
    biller_name: "9MOBILE 1GB data bundle",
    item_code: "MD128",
    short_name: "9MOBILE DATA BUNDLE",
    fee: 0,
    commission_on_fee: false,
    label_name: "Mobile Number",
    amount: 1000,
  },
  {
    id: 30,
    biller_code: "BIL107",
    name: "9MOBILE DATA BUNDLE",
    default_commission: 0.1,
    date_added: "2020-09-17T15:56:54.737Z",
    country: "NG",
    is_airtime: false,
    biller_name: "9MOBILE 1.5GB data bundle",
    item_code: "MD129",
    short_name: "9MOBILE DATA BUNDLE",
    fee: 0,
    commission_on_fee: false,
    label_name: "Mobile Number",
    amount: 1200,
  },
  {
    id: 31,
    biller_code: "BIL107",
    name: "9MOBILE DATA BUNDLE",
    default_commission: 0.1,
    date_added: "2020-09-17T15:56:54.737Z",
    country: "NG",
    is_airtime: false,
    biller_name: "9MOBILE 2.5GB data bundle",
    item_code: "MD130",
    short_name: "9MOBILE DATA BUNDLE",
    fee: 0,
    commission_on_fee: false,
    label_name: "Mobile Number",
    amount: 2000,
  },
  {
    id: 32,
    biller_code: "BIL107",
    name: "9MOBILE DATA BUNDLE",
    default_commission: 0.1,
    date_added: "2020-09-17T15:56:54.737Z",
    country: "NG",
    is_airtime: false,
    biller_name: "9MOBILE 4GB data bundle",
    item_code: "MD131",
    short_name: "9MOBILE DATA BUNDLE",
    fee: 0,
    commission_on_fee: false,
    label_name: "Mobile Number",
    amount: 3000,
  },
  {
    id: 33,
    biller_code: "BIL107",
    name: "9MOBILE DATA BUNDLE",
    default_commission: 0.1,
    date_added: "2020-09-17T15:56:54.737Z",
    country: "NG",
    is_airtime: false,
    biller_name: "9MOBILE 11.5GB data bundle",
    item_code: "MD132",
    short_name: "9MOBILE DATA BUNDLE",
    fee: 0,
    commission_on_fee: false,
    label_name: "Mobile Number",
    amount: 8000,
  },
];

const airtelData = [
  {
    id: 17,
    biller_code: "BIL106",
    name: "AIRTEL DATA BUNDLE",
    default_commission: 0.1,
    date_added: "2020-09-17T15:56:49.86Z",
    country: "NG",
    is_airtime: false,
    biller_name: "AIRTEL 10 MB data bundle",
    item_code: "MD116",
    short_name: "AIRTEL DATA BUNDLE",
    fee: 0,
    commission_on_fee: false,
    label_name: "Mobile Number",
    amount: 50,
  },
  {
    id: 18,
    biller_code: "BIL106",
    name: "AIRTEL DATA BUNDLE",
    default_commission: 0.1,
    date_added: "2020-09-17T15:56:49.86Z",
    country: "NG",
    is_airtime: false,
    biller_name: "AIRTEL 50 MB data bundle",
    item_code: "MD117",
    short_name: "AIRTEL DATA BUNDLE",
    fee: 0,
    commission_on_fee: false,
    label_name: "Mobile Number",
    amount: 100,
  },
  {
    id: 19,
    biller_code: "BIL106",
    name: "AIRTEL DATA BUNDLE",
    default_commission: 0.1,
    date_added: "2020-09-17T15:56:49.86Z",
    country: "NG",
    is_airtime: false,
    biller_name: "AIRTEL 200 MB data bundle",
    item_code: "MD118",
    short_name: "AIRTEL DATA BUNDLE",
    fee: 0,
    commission_on_fee: false,
    label_name: "Mobile Number",
    amount: 200,
  },
  {
    id: 20,
    biller_code: "BIL106",
    name: "AIRTEL DATA BUNDLE",
    default_commission: 0.1,
    date_added: "2020-09-17T15:56:49.86Z",
    country: "NG",
    is_airtime: false,
    biller_name: "AIRTEL 350 MB data bundle",
    item_code: "MD119",
    short_name: "AIRTEL DATA BUNDLE",
    fee: 0,
    commission_on_fee: false,
    label_name: "Mobile Number",
    amount: 300,
  },
  {
    id: 21,
    biller_code: "BIL106",
    name: "AIRTEL DATA BUNDLE",
    default_commission: 0.1,
    date_added: "2020-09-17T15:56:49.86Z",
    country: "NG",
    is_airtime: false,
    biller_name: "AIRTEL 750 MB data bundle",
    item_code: "MD120",
    short_name: "AIRTEL DATA BUNDLE",
    fee: 0,
    commission_on_fee: false,
    label_name: "Mobile Number",
    amount: 500,
  },
  {
    id: 22,
    biller_code: "BIL106",
    name: "AIRTEL DATA BUNDLE",
    default_commission: 0.1,
    date_added: "2020-09-17T15:56:49.86Z",
    country: "NG",
    is_airtime: false,
    biller_name: "AIRTEL 1.3GB data bundle",
    item_code: "MD121",
    short_name: "AIRTEL DATA BUNDLE",
    fee: 0,
    commission_on_fee: false,
    label_name: "Mobile Number",
    amount: 1000,
  },
  {
    id: 23,
    biller_code: "BIL106",
    name: "AIRTEL DATA BUNDLE",
    default_commission: 0.1,
    date_added: "2020-09-17T15:56:49.86Z",
    country: "NG",
    is_airtime: false,
    biller_name: "AIRTEL 3.5GB data bundle",
    item_code: "MD122",
    short_name: "AIRTEL DATA BUNDLE",
    fee: 0,
    commission_on_fee: false,
    label_name: "Mobile Number",
    amount: 2000,
  },
  {
    id: 24,
    biller_code: "BIL106",
    name: "AIRTEL DATA BUNDLE",
    default_commission: 0.1,
    date_added: "2020-09-17T15:56:49.86Z",
    country: "NG",
    is_airtime: false,
    biller_name: "AIRTEL 5GB data bundle",
    item_code: "MD123",
    short_name: "AIRTEL DATA BUNDLE",
    fee: 0,
    commission_on_fee: false,
    label_name: "Mobile Number",
    amount: 2500,
  },
  {
    id: 25,
    biller_code: "BIL106",
    name: "AIRTEL DATA BUNDLE",
    default_commission: 0.1,
    date_added: "2020-09-17T15:56:49.86Z",
    country: "NG",
    is_airtime: false,
    biller_name: "AIRTEL 7GB data bundle",
    item_code: "MD124",
    short_name: "AIRTEL DATA BUNDLE",
    fee: 0,
    commission_on_fee: false,
    label_name: "Mobile Number",
    amount: 3500,
  },
  {
    id: 26,
    biller_code: "BIL106",
    name: "AIRTEL DATA BUNDLE",
    default_commission: 0.1,
    date_added: "2020-09-17T15:56:49.86Z",
    country: "NG",
    is_airtime: false,
    biller_name: "AIRTEL 9GB data bundle",
    item_code: "MD125",
    short_name: "AIRTEL DATA BUNDLE",
    fee: 0,
    commission_on_fee: false,
    label_name: "Mobile Number",
    amount: 4000,
  },
  {
    id: 27,
    biller_code: "BIL106",
    name: "AIRTEL DATA BUNDLE",
    default_commission: 0.1,
    date_added: "2020-09-17T15:56:49.86Z",
    country: "NG",
    is_airtime: false,
    biller_name: "AIRTEL 10GB data bundle",
    item_code: "MD126",
    short_name: "AIRTEL DATA BUNDLE",
    fee: 0,
    commission_on_fee: false,
    label_name: "Mobile Number",
    amount: 5000,
  },
];

const billCategory = [
  {
    id: 1,
    biller_code: "BIL099",
    name: "AIRTIME",
    default_commission: 0.03,
    date_added: "2020-09-17T15:56:40.22Z",
    country: "NG",
    is_airtime: true,
    biller_name: "AIRTIME",
    item_code: "AT099",
    short_name: "MTN NIGERIA",
    fee: 0,
    commission_on_fee: false,
    label_name: "Mobile Number",
    amount: 0,
  },
  {
    id: 2,
    biller_code: "BIL100",
    name: "AIRTEL NIGERIA",
    default_commission: 0.03,
    date_added: "2020-09-17T15:56:41.257Z",
    country: "NG",
    is_airtime: true,
    biller_name: "AIRTEL VTU",
    item_code: "AT100",
    short_name: "AIRTEL NIGERIA",
    fee: 0,
    commission_on_fee: false,
    label_name: "Mobile Number",
    amount: 0,
  },
  {
    id: 3,
    biller_code: "BIL102",
    name: "GLO NIGERIA",
    default_commission: 0.03,
    date_added: "2020-09-17T15:56:42.173Z",
    country: "NG",
    is_airtime: true,
    biller_name: "GLO VTU",
    item_code: "AT102",
    short_name: "GLO NIGERIA",
    fee: 0,
    commission_on_fee: false,
    label_name: "Mobile Number",
    amount: 0,
  },
  {
    id: 4,
    biller_code: "BIL103",
    name: "9MOBILE NIGERIA",
    default_commission: 0.03,
    date_added: "2020-09-17T15:56:43.093Z",
    country: "NG",
    is_airtime: true,
    biller_name: "9MOBILE VTU",
    item_code: "AT103",
    short_name: "9MOBILE NIGERIA",
    fee: 0,
    commission_on_fee: false,
    label_name: "Mobile Number",
    amount: 0,
  },
  {
    id: 49,
    biller_code: "BIL108",
    name: "TIGO",
    default_commission: 0.1,
    date_added: "2020-09-17T15:57:23.813Z",
    country: "GH",
    is_airtime: true,
    biller_name: "TIGO VTU",
    item_code: "AT133",
    short_name: "TIGO",
    fee: 20,
    commission_on_fee: false,
    label_name: "Mobile Number",
    amount: 0,
  },
  {
    id: 50,
    biller_code: "BIL138",
    name: "AIRTEL",
    default_commission: 0.1,
    date_added: "2020-09-17T15:57:27.177Z",
    country: "KE",
    is_airtime: true,
    biller_name: "AIRTEL",
    item_code: "AT152",
    short_name: "AIRTEL",
    fee: 20,
    commission_on_fee: false,
    label_name: "Mobile Number",
    amount: 0,
  },
  //
  {
    id: 34,
    biller_code: "BIL119",
    name: "DSTV Payment",
    default_commission: 0.1,
    date_added: "2020-09-17T15:56:58.057Z",
    country: "NG",
    is_airtime: false,
    biller_name: "DSTV Payment",
    item_code: "CB140",
    short_name: "DSTV",
    fee: 100,
    commission_on_fee: true,
    label_name: "SmartCard Number",
    amount: 1900,
  },
  {
    id: 35,
    biller_code: "BIL119",
    name: "DSTV",
    default_commission: 0.1,
    date_added: "2020-09-17T15:56:58.057Z",
    country: "NG",
    is_airtime: false,
    biller_name: "DSTV Access",
    item_code: "CB141",
    short_name: "DSTV",
    fee: 100,
    commission_on_fee: true,
    label_name: "SmartCard Number",
    amount: 1800,
  },
  {
    id: 36,
    biller_code: "BIL120",
    name: "GOTV",
    default_commission: 0.1,
    date_added: "2020-09-17T15:56:59.28Z",
    country: "NG",
    is_airtime: false,
    biller_name: "GOTV Light Quarterly",
    item_code: "CB137",
    short_name: "GOTV",
    fee: 100,
    commission_on_fee: true,
    label_name: "SmartCard Number",
    amount: 1050,
  },
  {
    id: 37,
    biller_code: "BIL120",
    name: "GOTV",
    default_commission: 0.1,
    date_added: "2020-09-17T15:56:59.28Z",
    country: "NG",
    is_airtime: false,
    biller_name: "GOTV Value",
    item_code: "CB138",
    short_name: "GOTV",
    fee: 100,
    commission_on_fee: true,
    label_name: "SmartCard Number",
    amount: 1200,
  },
  {
    id: 38,
    biller_code: "BIL120",
    name: "GOTV",
    default_commission: 0.1,
    date_added: "2020-09-17T15:56:59.28Z",
    country: "NG",
    is_airtime: false,
    biller_name: "GOTV Plus",
    item_code: "CB139",
    short_name: "GOTV",
    fee: 100,
    commission_on_fee: true,
    label_name: "SmartCard Number",
    amount: 1800,
  },
  //
  {
    id: 39,
    biller_code: "BIL101",
    name: "SMILE",
    default_commission: 0.1,
    date_added: "2020-09-17T15:57:04.277Z",
    country: "NG",
    is_airtime: false,
    biller_name: "Smile 1GB Data Bundle",
    item_code: "IS101",
    short_name: "SMILE",
    fee: 100,
    commission_on_fee: true,
    label_name: "Account Number",
    amount: 100,
  },
  {
    id: 40,
    biller_code: "BIL121",
    name: "SWIFT",
    default_commission: 0.1,
    date_added: "2020-09-17T15:57:05.237Z",
    country: "NG",
    is_airtime: false,
    biller_name: "Swift Subscription",
    item_code: "IS142",
    short_name: "SWIFT",
    fee: 100,
    commission_on_fee: true,
    label_name: "Account Number",
    amount: 0,
  },
  {
    id: 41,
    biller_code: "BIL127",
    name: "IPNX Subscription",
    default_commission: 0.1,
    date_added: "2020-09-17T15:57:06.83Z",
    country: "NG",
    is_airtime: false,
    biller_name: "IPNX Payment",
    item_code: "IS145",
    short_name: "IPNX Subscription",
    fee: 100,
    commission_on_fee: true,
    label_name: "Account Number",
    amount: 0,
  },
];
