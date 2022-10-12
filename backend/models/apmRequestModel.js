/** @format */

import mongoose from "mongoose";

const customerSchema = mongoose.Schema({
  orderNumber: { type: String, required: true },
  customerRef: { type: String },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  billToAddressOne: { type: String, required: true },
  billToAddressTwo: { type: String, required: true },
  billToCity: { type: String, required: true },
  billToState: { type: String, required: true },
  billToPostal: { type: String, required: true },
  billToCountry: { type: String, required: true },
  billToPhone: { type: String },
  shipToAddressOne: { type: String },
  shipToAddressTwo: { type: String },
  shipToCity: { type: String },
  shipToState: { type: String },
  shipToPostal: { type: String },
  shipToCountry: { type: String },
  shipToPhone: { type: String },
});

const Customer = mongoose.model("Customer", customerSchema);

const processingOptionsSchema = mongoose.Schema({
  merchantId: { type: String },
  paymentOptionTag: { type: String },
  saveRecurringToken: { type: Boolean },
});

const ProcessingOptions = mongoose.model(
  "ProcessingOptions",
  processingOptionsSchema
);

const apmRequestSchema = mongoose.Schema({
  isAuthOnly: { type: Boolean },
  data: {
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    dueDate: { type: String },
    paymentMethod: { type: String, required: true },
    description: { type: String },
    customer: { type: Customer },
  },
  processingOptions: { type: ProcessingOptions },
});

const ApmRequest = mongoose.model("ApmRequest", apmRequestSchema);

export default ApmRequest;
