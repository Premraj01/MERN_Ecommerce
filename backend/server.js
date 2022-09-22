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
// const sdk = require("api")("@nexio/v99#la7fncsl74uhkh4");
import sdk from "api";

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

app.get("/api/config/paypal", (req, res) =>
	res.send(process.env.PAYPAL_CLIENT_ID),
);

app.post("/api/config/nexio", (req, res) => {
	console.log(req.body);
	const options = {
		method: "POST",
		headers: {
			accept: "application/json",
			"content-type": "application/json",
			authorization:
				"Basic" +
				" " +
				Buffer.from(process.env.USER + ":" + process.env.PASSWORD).toString(
					"base64",
				),
		},
		body: JSON.stringify({
			data: { currency: "USD", amount: req.body.totalPrice },
			processingOptions: {
				checkFraud: true,
				verboseResponse: false,
				verifyAvs: 0,
				verifyCvc: false,
			},
			shouldUpdateCard: true,
			uiOptions: {
				displaySubmitButton: true,
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

	fetch("https://api.nexiopaysandbox.com/pay/v3/token", options)
		.then((response) => response.json())
		.then((response) => res.send(response))
		.catch((err) => console.error(err));
});

const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/build")));
	app.get("*", (req, res) =>
		res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html")),
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
		`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`,
	),
);
