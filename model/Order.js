const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema({
  items: { type: [Schema.Types.Mixed], required: true },
  totalAmount: { type: Number },
  totalItems: { type: Number },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  //TODO : we can add enum types
  paymentMethod: { type: String },
  paymentStatus: { type: String, default: "pending" },
  status: { type: String, default: "pending" },
  selectedAddress: { type: Schema.Types.Mixed, required: true },
});

const virtual = orderSchema.virtual("id");
//virtual help in making a virtual datafield, here we making id datafiled cuz in database _id is present but frontend is using id not _id
//when response is sent, this virtual id is added to the response automatically.
//will stays as _id in database
virtual.get(function () {
  return this._id;
});
orderSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

exports.Order = mongoose.model("Order", orderSchema);
