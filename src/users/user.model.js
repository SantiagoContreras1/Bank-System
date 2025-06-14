import {Schema, model} from 'mongoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';

export const UserSchema = Schema({
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    dpi: {
      type: Number,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
      minlength: [8, 'El numero de celular tiene que tener 8 digitos']
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
    },
    role: {
      type: String,
      enum: ["ADMIN_ROLE", "USER_ROLE"],
      default: "USER_ROLE",
    },
    work: {
      type: String,
    },
    monthlyIncome: {
      type: Number,
      required: true,
      min: 100,
    },
    favorites: [
      {
        account: {
          type: Schema.Types.ObjectId,
          ref: "Account",
          autopopulate: {
            select: 'accountNo balance accountType',
            options: { lean: true }
          }
        },
        alias: {
          type: String,
          required: true,
        },
      },
    ],
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
    },
    creatAt:{
      type: Date,
      default: Date.now
    },
    status:{
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { 
      virtuals: false,
      transform: function(doc, ret) {
        delete ret.__v;
        delete ret.password;
        return ret;
      }
    },
    toObject: { 
      virtuals: false,
      transform: function(doc, ret) {
        delete ret.__v;
        delete ret.password;
        return ret;
      }
    }
  });

UserSchema.plugin(mongooseAutoPopulate);

export default model('User', UserSchema);
