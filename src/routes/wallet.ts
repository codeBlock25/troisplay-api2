import { Router, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import users from "../model/users";
import { config as envConfig } from "dotenv";
import { Document } from "mongoose";
import WalletModel, { walletType } from "../model/walltet";
import CashWalletModel from "../model/cash_wallet";
import Flutterwave from "flutterwave-node-v3"
import AdminCashModel from "../model/admin_model";

export const PUBLIC_KEY = "FLWPUBK-892063403640cc5691d22bdf9368d89e-X";
export const SECRET_KEY = "FLWSECK-62f4703237f4d34d5a7f1c03d3e4d72c-X";

export const banks =  [
 { id: 132, code: '560', name: 'Page MFBank' },
 { id: 133, code: '304', name: 'Stanbic Mobile Money' },
 { id: 134, code: '308', name: 'FortisMobile' },
 { id: 135, code: '328', name: 'TagPay' },
 { id: 136, code: '309', name: 'FBNMobile' },
 { id: 137, code: '011', name: 'First Bank of Nigeria' },
 { id: 138, code: '326', name: 'Sterling Mobile' },
 { id: 139, code: '990', name: 'Omoluabi Mortgage Bank' },
 { id: 140, code: '311', name: 'ReadyCash (Parkway)' },
 { id: 141, code: '057', name: 'Zenith Bank' },
 { id: 142, code: '068', name: 'Standard Chartered Bank' },
 { id: 143, code: '306', name: 'eTranzact' },
 { id: 144, code: '070', name: 'Fidelity Bank' },
 { id: 145, code: '023', name: 'CitiBank' },
 { id: 146, code: '215', name: 'Unity Bank' },
 { id: 147, code: '323', name: 'Access Money' },
 { id: 148, code: '302', name: 'Eartholeum' },
 { id: 149, code: '324', name: 'Hedonmark' },
 { id: 150, code: '325', name: 'MoneyBox' },
 { id: 151, code: '301', name: 'JAIZ Bank' },
 { id: 152, code: '050', name: 'Ecobank Plc' },
 { id: 153, code: '307', name: 'EcoMobile' },
 { id: 154, code: '318', name: 'Fidelity Mobile' },
 { id: 155, code: '319', name: 'TeasyMobile' },
 { id: 156, code: '999', name: 'NIP Virtual Bank' },
 { id: 157, code: '320', name: 'VTNetworks' },
 { id: 158, code: '221', name: 'Stanbic IBTC Bank' },
 { id: 159, code: '501', name: 'Fortis Microfinance Bank' },
 { id: 160, code: '329', name: 'PayAttitude Online' },
 { id: 161, code: '322', name: 'ZenithMobile' },
 { id: 162, code: '303', name: 'ChamsMobile' },
 { id: 163, code: '403', name: 'SafeTrust Mortgage Bank' },
 { id: 164, code: '551', name: 'Covenant Microfinance Bank' },
 { id: 165, code: '415', name: 'Imperial Homes Mortgage Bank' },
 { id: 166, code: '552', name: 'NPF MicroFinance Bank' },
 { id: 167, code: '526', name: 'Parralex' },
 { id: 168, code: '035', name: 'Wema Bank' },
 { id: 169, code: '084', name: 'Enterprise Bank' },
 { id: 170, code: '063', name: 'Diamond Bank' },
 { id: 171, code: '305', name: 'Paycom' },
 { id: 172, code: '100', name: 'SunTrust Bank' },
 { id: 173, code: '317', name: 'Cellulant' },
 { id: 174, code: '401', name: 'ASO Savings and & Loans' },
 { id: 175, code: '030', name: 'Heritage' },
 { id: 176, code: '402', name: 'Jubilee Life Mortgage Bank' },
 { id: 177, code: '058', name: 'GTBank Plc' },
 { id: 178, code: '032', name: 'Union Bank' },
 { id: 179, code: '232', name: 'Sterling Bank' },
 { id: 180, code: '076', name: 'Skye Bank' },
 { id: 181, code: '082', name: 'Keystone Bank' },
 { id: 182, code: '327', name: 'Pagatech' },
 { id: 183, code: '559', name: 'Coronation Merchant Bank' },
 { id: 184, code: '601', name: 'FSDH' },
 { id: 185, code: '313', name: 'Mkudi' },
 { id: 186, code: '214', name: 'First City Monument Bank' },
 { id: 187, code: '314', name: 'FET' },
 { id: 188, code: '523', name: 'Trustbond' },
 { id: 189, code: '315', name: 'GTMobile' },
 { id: 190, code: '033', name: 'United Bank for Africa' },
 { id: 191, code: '044', name: 'Access Bank' },
  { id: 567, code: '90115', name: 'TCF MFB' }
]
export const PRODUCTION_FLAG = false

envConfig();
const WalletRouter: Router = Router();

const flw = new Flutterwave(PUBLIC_KEY, SECRET_KEY,PRODUCTION_FLAG);


WalletRouter.get("/", async (req: Request, res: Response) => {
  try {
    let cookies: { token: string } = req.cookies;
    if (!cookies) {
      res.status(410).json({ message: "error found", error: "invalid auth" });
      return;
    }
    let token: string = cookies?.token;
    if (!token || token === "") {
      res.status(410).json({ message: "error found", error: "empty token" });
      return;
    }
    let decoded: string | object | any = verify(token, process.env.SECRET);
    let found: Document = await users.findById(decoded.id);
    if (!found) {
      res.status(410).json({ message: "error found", error: "invalid user" });
      return;
    }
    await WalletModel.findOne({ userID: decoded.id })
      .then((result: walletType) => {
        res.json({
          message: "content found",
          wallet: {
            currentCoin: result.currentCoin,
            pendingCoin: result.pendingCoin,
          },
        });
      })
      .catch((error) => {
        res.status(500).json({ message: "error found", error });
      });
  } catch (error) {
    console.log(error);
    res.status(503).json({ message: "error found", error });
  }
});


WalletRouter.post("/withdraw", async (req, res) => {try {
  let auth: string = req.headers.authorization;
  if (!auth) {
    res.status(406).json({ message: "error found", error: "invalid auth" });
    return;
  }
  let token: string = auth.replace("Bearer ", "");
  if (!token || token === "") {
    res.status(406).json({ message: "error found", error: "empty token" });
    return;
  }
  let decoded = (verify(token, process.env.SECRET) as unknown) as {
    id: string;
  };
  let found = await users.findById(decoded.id);
  if (!found) {
    res.status(406).json({ message: "error found", error: "invalid user" });
    return;
  }
  const { amount }: {amount: number} = req.body
  let { currentCash } = await CashWalletModel.findOne({ userID: decoded.id })
  if (!amount) {
    res.status(406).json({message: "invalid input", error: "amount in required"})
    return
  }
  if (currentCash < amount) {
    res.status(401).json({message: "insufficient fund"})
    return;
  }
  await CashWalletModel.updateOne({ userID: decoded.id }, { currentCash: currentCash - amount }).then(() => {
    res.json({message:"succesfully"})
  }).catch(error => {
    res.status(500).json({ message: "error found", error });
  })
} catch (error) {
  res.status(500).json({ message: "error found", error });
  console.error(error);
}
})

WalletRouter.post("/admin", async ( req, res ) => {
  await new AdminCashModel({}).save();
  res.send("Hello")
})

export default WalletRouter;
