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
import fetch from "node-fetch";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const stripe = require("stripe")(
	"sk_test_51LsKaqITPQLRyiLUjA1cYugZXBh63MAg4LNaUlgIAsYqp1Nu0vkmcOzhNS0NiktzGNoaK2WMdZ6uTjhKMRSQxU5k00r34lKGDP",
);
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

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

app.post("/api/config/nexio/card-iframe", (req, res) => {
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
			data: {
				currency: "USD",
				amount: req.body.totalPrice,
				// paymentMethod: "creditCard",
				// allowedCardTypes: ["visa", "mastercard", "jcb", "discover", "amex"],
			},
			processingOptions: {
				checkFraud: true,
				verboseResponse: false,
				verifyAvs: 0,
				verifyCvc: false,
			},
			shouldUpdateCard: true,
			uiOptions: {
				displaySubmitButton: true,
				hideBilling: true,
				hideCvc: false,
				requireCvc: true,
				forceExpirationSelection: true,
			},
		}),
	};

	console.log("object");

	fetch(process.env.BASE_IFRAME_URL + "token", options)
		.then((response) => response.json())
		.then((response) => {
			let oneTimeUseToken = "?token=" + response.token;
			let returnHtml = "&shouldReturnHtml=true";
			let iframeUrl =
				process.env.BASE_IFRAME_URL + oneTimeUseToken + returnHtml;

			res.send(iframeUrl);
		})
		.catch((err) => console.error(err));
});

app.post("/api/config/nexio/e-check", (req, res) => {
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
			data: {
				paymentMethod: "eCheck",
				amount: req.body.totalPrice,
				currency: "USD",
				secCode: null,
				description: "test purchase",
			},
			processingOptions: {
				checkFraud: true,
				verboseResponse: false,
				verifyAvs: 0,
				verifyCvc: false,
			},
			shouldUpdateCard: true,
			uiOptions: {
				displaySubmitButton: true,
				// hideBilling: {
				// 	hideAddressOne: false,
				// 	hideAddressTwo: false,
				// 	hideCity: false,
				// 	hideCountry: false,
				// 	hidePostal: false,
				// 	hidePhone: true,
				// 	hideState: false,
				// },
				hideBilling: true,
				hideCvc: false,
				requireCvc: true,
				forceExpirationSelection: true,
			},
		}),
	};

	fetch(process.env.BASE_IFRAME_URL + "token", options)
		.then((response) => response.json())
		.then((response) => {
			let oneTimeUseToken = "?token=" + response.token;
			let returnHtml = "&shouldReturnHtml=true";
			let iframeUrl =
				process.env.BASE_IFRAME_URL +
				"processECheck" +
				oneTimeUseToken +
				returnHtml;

			res.send(iframeUrl);
		})
		.catch((err) => console.error(err));
});

app.post("/api/config/nexio/save-card/pay", async (req, res) => {
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
			data: { currency: "USD", amount: 125 },
			tokenex: {
				token: req.body.token,
			},
			processingOptions: {
				checkFraud: true,
				verboseResponse: false,
				verifyAvs: 0,
				verifyCvc: false,
			},
			shouldUpdateCard: true,
			uiOptions: {
				displaySubmitButton: true,
				hideBilling: true,
				hideCvc: false,
				requireCvc: true,
				forceExpirationSelection: true,
			},
		}),
	};

	const webhookOptions = {
		method: "POST",
		headers: {
			accept: "application/json",
			"content-type": "application/json",
			authorization:
				"Basic cHJlbXJhanRyaXB1dGUxMkBnbWFpbC5jb206UHJlbXJhal9UcmlwdXRlQDEy",
		},
		body: JSON.stringify({
			webhooks: {
				CARD_SAVED: {
					url: "https://192.168.1.5:5000/notification",
				},
			},
			merchantId: "301308",
		}),
	};

	fetch("https://api.nexiopaysandbox.com/webhook/v3/config", webhookOptions)
		.then((response) => response.json())
		.then((response) => console.log(response))
		.catch((err) => console.error(err));

	fetch(process.env.BASE_IFRAME_URL + "process", options)
		.then((response) => response.json())
		.then((response) => res.send(response))
		.catch((err) => console.error(err));
});

app.get("/api/config/nexio/save-card-iframe", async (req, res) => {
	const option = { method: "GET", headers: { accept: "application/json" } };
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
			data: {
				currency: "USD",
				// paymentMethod: "creditCard",
				// allowedCardTypes: ["visa", "mastercard", "jcb", "discover", "amex"],
			},
			processingOptions: {
				checkFraud: true,
				verboseResponse: false,
				verifyAvs: 0,
				verifyCvc: false,
			},
			shouldUpdateCard: true,
			uiOptions: {
				displaySubmitButton: true,
				hideBilling: true,
				hideCvc: false,
				requireCvc: true,
				forceExpirationSelection: true,
			},
		}),
	};

	fetch(process.env.BASE_IFRAME_URL + "token", options)
		.then((response) => response.json())
		.then((response) => {
			if (response.token.length > 0) {
				let oneTimeUseToken = "&token=" + response.token;
				let returnHtml = "?shouldReturnHtml=true";
				let iframeUrl =
					process.env.BASE_IFRAME_URL +
					"saveCard" +
					returnHtml +
					oneTimeUseToken;
				res.send(iframeUrl);
			}
		})
		.catch((err) => console.error(err));
});

app.post("/api/config/nexio/saved-card/view", async (req, res) => {
	const options = {
		method: "GET",
		headers: {
			accept: "application/json",
			authorization:
				"Basic" +
				" " +
				Buffer.from(process.env.USER + ":" + process.env.PASSWORD).toString(
					"base64",
				),
		},
	};

	fetch(
		process.env.BASE_IFRAME_URL + "vault/card/" + `${req.body.token}`,
		options,
	)
		.then((response) => response.json())
		.then((response) => res.send(response))
		.catch((err) => console.error(err));
});

app.get("/api/config/nexio/save-echeck", async (res, req) => {
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
			data: {
				paymentMethod: "eCheck",
				amount: req.body.totalPrice,
				currency: "USD",
				secCode: null,
				description: "test purchase",
			},
			processingOptions: {
				checkFraud: true,
				verboseResponse: false,
				verifyAvs: 0,
				verifyCvc: false,
			},
			shouldUpdateCard: true,
			uiOptions: {
				displaySubmitButton: true,
				hideBilling: true,
				hideCvc: false,
				requireCvc: true,
				forceExpirationSelection: true,
			},
		}),
	};

	fetch(process.env.BASE_IFRAME_URL + "token", options)
		.then((response) => response.json())
		.then((response) => {
			let oneTimeUseToken = "?token=" + response.token;
			let returnHtml = "&shouldReturnHtml=true";
			let iframeUrl =
				process.env.BASE_IFRAME_URL +
				"saveECheck" +
				oneTimeUseToken +
				returnHtml;

			res.send(iframeUrl);
		})
		.catch((err) => console.error(err));
});

app.post("/api/config/nexio/save-echeck/pay", async (req, res) => {
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
			data: { currency: "USD", amount: 125 },
			tokenex: {
				token: req.body.token,
			},
			processingOptions: {
				checkFraud: true,
				verboseResponse: false,
				verifyAvs: 0,
				verifyCvc: false,
			},
			shouldUpdateCard: true,
			uiOptions: {
				displaySubmitButton: true,
				hideBilling: true,
				hideCvc: false,
				requireCvc: true,
				forceExpirationSelection: true,
			},
		}),
	};

	fetch(process.env.BASE_IFRAME_URL + "processECheck", options)
		.then((response) => response.json())
		.then((response) => res.send(response))
		.catch((err) => console.error(err));
});

app.post("/api/config/nexio/recurring/pay", async (req, res) => {
	console.log(typeof req.body.intervalAmount);

	let schedule, recurringType;

	if (req.body.totalPrice === -1) {
		recurringType = "subscription";
		schedule = {
			interval: "day",
			intervalCount: req.body.month,
		};
	} else {
		recurringType = "payplan";
		schedule = {
			interval: "day",
			intervalCount: req.body.month,
			balance: req.body.totalPrice,
		};
	}

	const options = {
		method: "POST",
		headers: {
			accept: "application/json",
			"content-type": "application/json",
			authorization:
				"Basic cHJlbXJhanRyaXB1dGUxMkBnbWFpbC5jb206UHJlbXJhal9UcmlwdXRlQDEy",
		},
		body: JSON.stringify({
			payment: {
				data: {
					currency: "USD",
					customer: { customerRef: req.body.id },
					paymentMethod: "card",
					amount: Number(req.body.intervalAmount),
				},
				tokenex: { token: req.body.token },
				isAuthOnly: false,
				processingOptions: {
					checkFraud: true,
					shouldUseFingerprint: true,
					retryOnSoftDecline: false,
					verboseResponse: false,
				},
			},
			schedule: {
				...schedule,
			},
		}),
	};

	fetch(process.env.BASE_SUBSCRIPTION_URL, options)
		.then((response) => response.json())
		.then((response) => {
			res.send(response);
		})
		.catch((err) => console.error(err));
});

app.post("/notification", async (req, res) => {
	console.log(res);
});

//<-------------------------------STRIPE------------------------>

app.post("/api/config/stripe/create-payment-intent", async (req, res) => {
	console.log(req.body.order.totalPrice);

	const paymentIntent = await stripe.paymentIntents.create({
		amount: req.body.order.totalPrice,
		// customer: req.body.stripeCustomer.id,
		currency: "usd",
		automatic_payment_methods: {
			enabled: true,
		},
		description: "Software development services",
		setup_future_usage: "off_session",
	});

	res.json({ client_secret: paymentIntent.client_secret });
});

// cus_MdbhKYLB9MHyjc

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
