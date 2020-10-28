import { 
    Router,
    Response,
    Request
} from "express";
import { verify } from "jsonwebtoken";
import users from "../model/users";
import { config as envConfig } from 'dotenv'
import CashWalletModel from "../model/cash_wallet";
import { compareSync } from "bcryptjs";
import Flutterwave from "flutterwave-node-v3"
import { PRODUCTION_FLAG, PUBLIC_KEY, SECRET_KEY } from "./wallet";
import PlayerModel from "../model/player";

envConfig()
export const payload: {
    country: string; 
    customer: string;
    amount: number;
    recurrence: string;
    type: string;
    reference: number;
}={
    country: "NG",
    customer: "",
    amount: 0,
    recurrence: "ONCE",
    type: "AIRTIME",
    reference: Math.ceil(Math.random() * 19920392039)
    }

const BillRouter = Router();
const flw = new Flutterwave(PUBLIC_KEY, SECRET_KEY, PRODUCTION_FLAG);

BillRouter.post("/airtime", async (req: Request, res: Response) => {
    try {
        let auth = req.headers.authorization;
        if (!auth) {
          res.status(406).json({ message: "error found", error: "invalid auth" });
          return;
        }
        let token: string = auth.replace("Bearer ","");
        if (!token || token === "") {
          res.status(406).json({ message: "error found", error: "empty token" });
          return;
        }
        let decoded = verify(token, process.env.SECRET) as unknown as {id: string};
        let found = await users.findById(decoded.id);
        if (!found) {
          res.status(406).json({ message: "error found", error: "invalid user" });
          return;
        }
        let { currentCash } = await CashWalletModel.findOne({ userID: decoded.id })
        let {phone_number, amount, key}: {phone_number: string, amount: number, key: string} = req.body
        if (currentCash < amount) {
            res.status(401).json({message: "insufficient fund"})
            return
        }

        let isUser = compareSync(key, found.key)

        if (!isUser) {
            res.status(400).json({error: "incorrect key", messagee: "error found", k: {phone_number: phone_number.includes("+") ? phone_number : `+${phone_number}`, amount, key, found}})
            return
        }
        const response = await flw.Bills.create_bill({
            ...payload,
            amount,
            customer: phone_number.includes("+") ? phone_number : `+${phone_number}`,
            reference: Math.ceil(Math.random() * 19920392039)
        })
        if (response.data) {
            await CashWalletModel.updateOne({ userID: decoded.id }, { currentCash: currentCash - amount }).then(() => {
            }).catch(() => {
            setTimeout(async() => {
                await CashWalletModel.updateOne({ userID: decoded.id }, { currentCash: currentCash - amount }).then(() => {
                    res.json({ response });
                })
            }, 3000);
            res.json({message: "awaiting"})
        })
        return
    }
    res.status(401).json({message: "flutter error", response })

    } catch (error) {
        res.status(500).json({ message: "error found", error });
    }
})


BillRouter.post("/data", async (req: Request, res: Response) => {
    try {
        let auth = req.headers.authorization;
        if (!auth) {
          res.status(406).json({ message: "error found", error: "invalid auth" });
          return;
        }
        let token: string = auth.replace("Bearer ","");
        if (!token || token === "") {
          res.status(406).json({ message: "error found", error: "empty token" });
          return;
        }
        let decoded = verify(token, process.env.SECRET) as unknown as {id: string};
        let found = await users.findById(decoded.id);
        if (!found) {
          res.status(406).json({ message: "error found", error: "invalid user" });
          return;
        }
        let { currentCash } = await CashWalletModel.findOne({ userID: decoded.id })
        let {phone_number, amount, key}: {phone_number: string, amount: number, key: string} = req.body
        if (currentCash < amount) {
            res.status(401).json({message: "insufficient fund"})
            return
        }

        let isUser = compareSync(key, found.key)

        if (!isUser) {
            res.status(400).json({error: "incorrect key", messagee: "error found", k: {phone_number: phone_number.includes("+") ? phone_number : `+${phone_number}`, amount, key, found}})
            return
        }
        const response = await flw.Bills.create_bill({
            ...payload,
            amount,
            customer: phone_number.includes("+") ? phone_number : `+${phone_number}`,
            reference: Math.ceil(Math.random() * 19920392039)
        })
        res.json({ response })
        if (response) {
            await CashWalletModel.updateOne({ userID: decoded.id }, { currentCash: currentCash - amount }).then(() => {
            }).catch(() => {
            setTimeout(async() => {
                await CashWalletModel.updateOne({ userID: decoded.id }, { currentCash: currentCash - amount }).then(() => {
                    res.json({ response });
                })
            }, 3000);
            res.json({message: "awaiting"})
        })
        return
       }
       res.status(401).json({message: "flutter error", response })
   
    } catch (error) {
        res.status(500).json({ message: "error found", error });
    }
})


BillRouter.post("/transfer", async (req: Request, res: Response) => {
    try {
        let auth = req.headers.authorization;
        if (!auth) {
          res.status(406).json({ message: "error found", error: "invalid auth" });
          return;
        }
        let token: string = auth.replace("Bearer ","");
        if (!token || token === "") {
          res.status(406).json({ message: "error found", error: "empty token" });
          return;
        }
        let decoded = verify(token, process.env.SECRET) as unknown as {id: string};
        let found = await users.findById(decoded.id);
        if (!found) {
          res.status(406).json({ message: "error found", error: "invalid user" });
          return;
        }
        let { currentCash } = await CashWalletModel.findOne({ userID: decoded.id })
        let { username, amount, key }: { username: string, amount: number, key: string; } = req.body;
        if (currentCash < amount) {
            res.status(401).json({message: "error found", error: "insuficient fund"})
            return
        }
        let playerDetails = await PlayerModel.findOne({ playername: username });
        if (!playerDetails) {
            res.status(404).json({message: "error found", error: "user not found"})
            return
        }
        let isUser = compareSync(key, found.key)
        if (!isUser) {
            res.status(403).json({message: "error found", error: "incorrect key"})
            return
        }
        let { currentCash: currentCashP2 } = await CashWalletModel.findOne({ userID: playerDetails.userID })
        await CashWalletModel.updateOne({userID: decoded.id}, {currentCash: currentCash - amount})
        await CashWalletModel.updateOne({ userID: playerDetails.userID }, { currentCash: currentCashP2 + amount })
        res.json({message: "succesful"})
    } catch (error) {
        res.status(500).json({ message: "error found", error });
    }
})



BillRouter.post("/transfer/direct", async (req: Request, res: Response) => {
    try {
        let auth = req.headers.authorization;
        if (!auth) {
          res.status(406).json({ message: "error found", error: "invalid auth" });
          return;
        }
        let token: string = auth.replace("Bearer ","");
        if (!token || token === "") {
          res.status(406).json({ message: "error found", error: "empty token" });
          return;
        }
        let decoded = verify(token, process.env.SECRET) as unknown as {id: string};
        let found = await users.findById(decoded.id);
        if (!found) {
          res.status(406).json({ message: "error found", error: "invalid user" });
          return;
        }
        let { currentCash } = await CashWalletModel.findOne({ userID: decoded.id })
        let { username, amount, key }: { username: string, amount: number, key: string; } = req.body;
        if (currentCash < amount) {
            res.status(401).json({message: "error found", error: "insuficient fund"})
            return
        }
        let playerDetails = await PlayerModel.findOne({ playername: username });
        if (!playerDetails) {
            res.status(404).json({message: "error found", error: "user not found"})
            return
        }
        let isUser = compareSync(key, found.key)
        if (!isUser) {
            res.status(403).json({message: "error found", error: "incorrect key"})
            return
        }
        let { currentCash: currentCashP2 } = await CashWalletModel.findOne({ userID: playerDetails.userID })
        
const flw = new Flutterwave(PUBLIC_KEY, SECRET_KEY  );
 
const {bank_name} = await PlayerModel.findOne({userID: decoded.id})
const initTrans = async () => {
 
    try {
        const payload:{
            account_bank: string, //This is the recipient bank code. Get list here :https://developer.flutterwave.com/v3.0/reference#get-all-banks
            account_number: string,
            amount: number,
            narration: string,
            currency: string,
            reference: string, //This is a merchant's unique reference for the transfer, it can be used to query for the status of the transfer
            callback_url: string,
            debit_currency: string
        } = {
            account_bank: "044", //This is the recipient bank code. Get list here :https://developer.flutterwave.com/v3.0/reference#get-all-banks
            account_number: "0690000040",
            amount: 200,
            narration: "ionnodo",
            currency: "NGN",
            reference: "transfer-"+Date.now(), //This is a merchant's unique reference for the transfer, it can be used to query for the status of the transfer
            callback_url: "https://webhook.site/b3e505b0-fe02-430e-a538-22bbbce8ce0d",
            debit_currency: "NGN"
        }
 
        const response = await flw.Transfer.initiate({
            ...payload, 
            amount: amount, 
            account_number: username, 
            account_bank: bank_name
         })
         res.json({message: "play"})
        console.log(response);
    } catch (error) {
        console.log(error)
    }
 
}
 
 
initTrans();
 return;
        await CashWalletModel.updateOne({userID: decoded.id}, {currentCash: currentCash - amount})
        
        res.json({message: "succesful"})
    } catch (error) {
        res.status(500).json({ message: "error found", error });
    }
})


export default BillRouter;