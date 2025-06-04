import { Schema, model } from "mongoose"
import mongooseAutoPopulate from "mongoose-autopopulate"

export const UserSchema = Schema({
    name:{
        type: String
    },
    username:{
        type: String
    },
    dpi:{
        type: number
    },
    address:{
        type: String
    },
    phone:{
        type: number
    },
    email:{
        type: String,
        required: [true, 'El email es obligatorio'],
        unique: true,
    },
    password:{
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
    },
    ingresosmensuales:{
        type: number
    },
    role:{
        type: String,
        enum: ['USER_ROLE', 'ADMIN_ROLE'],
        default: 'USER_ROLE'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    status: {
        type: Boolean,
        default: true,
    }
    
})

UserSchema.methods.toJSON = function() {
    const {__v, password, ...user} = this.toObject();
    return user;
}

UserSchema.plugin(mongooseAutoPopulate);

export default model('User', UserSchema);
