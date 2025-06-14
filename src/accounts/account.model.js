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
      autopopulate: {
        select: 'name email username role',
        options: { lean: true }
      }
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
      autopopulate: {
        select: 'type amount description createdAt fromAccount toAccount toAccountModel',
        options: { lean: true }
      }
    }],
    accountType: {
      type: String,
      enum: ['SAVINGS', 'CHECKING'],
      //required: true,
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
  { 
    timestamps: true,
    toJSON: { 
      virtuals: false,
      transform: function(doc, ret) {
        delete ret.__v;
        return ret;
      }
    },
    toObject: { 
      virtuals: false,
      transform: function(doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  } 
);

AccountSchema.plugin(mongooseAutoPopulate);

const Account = model('Account', AccountSchema);

export default Account;
