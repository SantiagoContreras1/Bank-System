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
  enterprise: {
    type: String,
    required: true,
  },
  profitPrice: {
    type: Number,
    required: true,
  },
  img: { type: String },
  status: {
    type: Boolean,
    default: true,
  },
});

ProductSchema.methods.toJSON = function () {
    const { __v, ...product } = this.toObject();
    return product;
};

export default model("Product", ProductSchema);
