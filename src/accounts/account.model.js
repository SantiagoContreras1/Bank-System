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
      autopopulate: true
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
    transactions: [{
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
      autopopulate: true
    }],
    accountType: {
      type: String,
      enum: ['SAVINGS', 'CHECKING'],
      default: 'SAVINGS',
    },
    creditLimit: {
      type: Number,
      default: 0.00,
    },
    availableCredit: {
      type: Number,
      default: 0.00,
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