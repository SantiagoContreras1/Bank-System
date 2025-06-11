import {Schema, model} from 'mongoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';

const TransactionSchema = new Schema({
    type: {
        type: String,
        enum: ['DEPOSIT', 'TRANSFER', 'PURCHASE'],
        required: true,
    },
    admin: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        autopopulate: true,
    },
    fromAcount: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        autopopulate: true,

    },
    toAccount: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        autopopulate: true,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 5,
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
}, {
    timestamps: true,

});

TransactionSchema.plugin(mongooseAutoPopulate);

TransactionSchema.methods.toJSON = function() {
    const {__v, ...transaction} = this.toObject();
    return transaction;
}

const Transaction = model('Transaction', TransactionSchema);

export default Transaction;
