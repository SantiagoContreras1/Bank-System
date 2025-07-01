import {Schema, model} from 'mongoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';

const TransactionSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["DEPOSIT", "TRANSFER", "PURCHASE"],
      required: true,
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
      autopopulate: {
        select: 'name email',
        options: { lean: true }
      }
    },
    fromAccount: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      autopopulate: {
        select: 'accountNo balance accountType',
        options: { lean: true }
      }
    },
    toAccount: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "toAccountModel",
      autopopulate: {
        select: 'name type profitPrice accountNo balance accountType user',
        options: { lean: true }
      }
    },
    toAccountModel: {
      type: String,
      required: true,
      enum: ["Account", "Product"],
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
      max: 2000,
    },
    description: {
      type: String,
      required: true,
      maxlength: 200,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

TransactionSchema.plugin(mongooseAutoPopulate);

const Transaction = model('Transaction', TransactionSchema);

export default Transaction;
