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
      type: String,
      required: true,
      unique: true,
    },
    direccion: {
      type: String,
      required: true,
    },
    celular: {
      type: String,
      required: true,
    },
    correo: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    tipo: {
      type: String,
      enum: ["ADMIN_ROLE", "USER_ROLE"],
      default: "USER_ROLE",
    },
    trabajo: {
      type: String,
    },
    ingresos: {
      type: Number,
      required: true,
      min: 100,
    },

    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },

    favorites: [
      {
        account: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Account",
        },
        alias: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  });

UserSchema.methods.toJSON = function() {
    const {__v, password, ...user} = this.toObject();
    return user;
}

UserSchema.plugin(mongooseAutoPopulate);

export default model('User', UserSchema);