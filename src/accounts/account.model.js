import { Schema, model } from "mongoose";
import mongooseAutoPopulate from "mongoose-autopopulate";

const AccountSchema = new Schema(
  {
    accountNo: {
      type: Number,
      required: true, 
      unique: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    balance: {
      type: Number,
      required: true, 
      default: 0.00
    },
    verify: {
      type: Boolean,
      default: false,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true } 
);

AccountSchema.plugin(mongooseAutoPopulate);

const Account = model('Account', AccountSchema);

export default Account;
