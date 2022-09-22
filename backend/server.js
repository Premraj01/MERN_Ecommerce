/** @format */
import path from "path";
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// import sdk from `api`
import fetch from "node-fetch";

// const sdk = require('api')('@nexio/v99#4buzkq3vl89chihh');

dotenv.config();
connectDB();
const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/api/config/paypal", (req, res) => {
  console.log("URL WHERE");
  res.send(process.env.PAYPAL_CLIENT_ID);
});

app.get("/api/nexio/token", (req, res) => {
  let data = process.env.MERCHANT_USERNAME_PASSWORD;
  let buff = new Buffer.from(data);
  let base64data = buff.toString("base64");

  console.log('"' + data + '" converted to Base64 is "' + base64data + '"');

  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: "Basic " + base64data,
      // authorization:
      //   "Basic cmFraGkuYXdhcmlAaW5ub3ZlY3QuY29tOjk4NjA4NTYzMjlAU2FuZGJveA==",
    },
    body: JSON.stringify({
      isAuthOnly: true,
      data: {
        currency: "USD",
        paymentMethod: "googlePayCyberSource",
        amount: 32,
        customer: {
          firstName: "John",
          lastName: "Doe",
          email: "jdoe@example.com",
          orderNumber: "Skds86sd65ds7",
          billToAddressOne: "2147 West Silverlake Drive",
          billToCity: "Scranton",
          billToState: "PA",
          billToPostal: "18503",
          billToCountry: "US",
        },
      },
      processingOptions: {
        checkFraud: true,
        verboseResponse: false,
        verifyAvs: 0,
        verifyCvc: false,
        merchantId: "301310",
      },
      shouldUpdateCard: true,
      uiOptions: {
        displaySubmitButton: false,
        hideBilling: {
          hideAddressOne: false,
          hideAddressTwo: false,
          hideCity: false,
          hideCountry: false,
          hidePostal: false,
          hidePhone: true,
          hideState: false,
        },
        hideCvc: false,
        requireCvc: true,
        forceExpirationSelection: true,
      },
    }),
  };
  console.log(options);
  fetch(process.env.ONE_TIME_TOKEN, options)
    .then((response) => response.json())
    .then((response) => {
      console.log(response);
      res.send(response);
    })
    .catch((err) => console.error("err", err));
});

const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/build")));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is Running...");
  });
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`
  )
);

("Missing required values. [data.customer.billToAddressOne, data.customer.billToCity, data.customer.billToState, data.customer.billToPostal, data.customer.billToCountry]");
