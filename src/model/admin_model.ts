import { 
    Model, 
    model, 
    Document, 
    Schema
} from "mongoose";

export interface AdminCashHint {
    currentCash: number;
    lastpaid: Date;
}

const AdminCashShcema: Schema<AdminCashHint> = new Schema({
    currentCash: {
        type: Number,
        required: true,
        default: 0
    },
    lastpaid: {
        type: Date,
        required: true,
        default: 0
    }
});

const AdminCashModel: Model<AdminCashHint & Document,{}> = model("admin-cash", AdminCashShcema)
export default AdminCashModel;
