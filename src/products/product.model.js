import { Schema, model } from "mongoose";
import mongooseAutoPopulate from "mongoose-autopopulate";

export const ProductSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["Product", "Service"],
    required: true,
  },
  enterprise: {
    type: String,
    required: true,
  },
  disscountPorcent: {
    type: Number,
    default: 0
  },
  originalPrice: {
    type: Number,
    required: true,
  },
  profitPrice: {
    type: Number
  },
  img: { type: String },
  status: {
    type: Boolean,
    default: true,
  },
}, {
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
});

ProductSchema.plugin(mongooseAutoPopulate);

export default model("Product", ProductSchema);
