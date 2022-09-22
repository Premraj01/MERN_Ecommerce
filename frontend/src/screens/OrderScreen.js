/** @format */

import React, { useState, useEffect, Fragment } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Button, Row, Col, ListGroup, Image, Card } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { PayPalButton } from "react-paypal-button-v2";
import Message from "../components/Message";
import Loader from "../components/Loader";
import { getOrder, payOrder, deliverOrder } from "../actions/orderActions";
import {
	ORDER_PAY_RESET,
	ORDER_DELIVER_RESET,
} from "../constants/orderConstants";
import ReactModal from "react-modal";
import { BallTriangle } from "react-loader-spinner";

const OrderScreen = ({ match, history }) => {
	const orderId = match.params.id;
	const customStyles = {
		content: {
			top: "50%",
			left: "50%",
			right: "auto",
			bottom: "auto",
			marginRight: "-50%",
			transform: "translate(-50%, -50%)",
		},
	};

	const [sdkReady, setSdkReady] = useState(false);
	const [isOpenModal, setIsOpenModal] = useState(false);
	const [url, setUrl] = useState("");
	const [loader, setLoader] = useState(false);

	const dispatch = useDispatch();

	const orderDetails = useSelector((state) => state.orderDetails);
	const { loading, error, order } = orderDetails;

	const orderPay = useSelector((state) => state.orderPay);
	const { loading: loadingPay, success: successPay } = orderPay;

	const userLogin = useSelector((state) => state.userLogin);
	const { userInfo } = userLogin;

	const orderDeliver = useSelector((state) => state.orderDeliver);
	const { loading: loadingDeliver, success: successDeliver } = orderDeliver;

	// if (!loading) {
	// 	// Calculate Prices
	// 	const addDecimals = (num) => {
	// 		return Math.round((num * 100) / 100).toFixed(2);
	// 	};

	// 	order.itemsPrice = addDecimals(
	// 		order.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0),
	// 	);
	// }

	window.addEventListener("message", function messageListener(event) {
		if (event.origin === "https://api.nexiopaysandbox.com") {
			const eventData = event.data?.data;
			const eventType = event.data?.event;
			setLoader(true);
			if (eventType === "loaded") {
				setLoader(false);
				console.log("form loaded");
			}

			if (eventType === "error") {
				console.log("error", eventData);
			}

			if (eventType === "processed") {
				setLoader(false);
				setIsOpenModal(false);
				console.log("changes", eventData);
				successPaymentHandler(eventData);
				console.log("transaction successfully..!");
			}
		}
	});

	useEffect(() => {
		if (!userInfo) {
			history.push("/login");
		}

		// const addPayPalScript = async () => {
		// 	const { data: clientId } = await axios.get("/api/config/paypal");
		// 	const script = document.createElement("script");
		// 	script.type = "text/javascript";
		// 	script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}`;

		// 	script.async = true;
		// 	script.onload = () => {
		// 		setSdkReady(true);
		// 	};
		// 	document.body.appendChild(script);
		// };

		const addNexioScript = async () => {
			// const { data: oneTimeToken } = await axios.get("/api/config/nexio");

			// console.log("clientID", oneTimeToken);
			// const { data: client } = await axios.get("/api/config/nexio");
			// console.log("clientID", client);

			const { data } = await axios.post("/api/config/nexio", order);

			if (data) {
				setSdkReady(true);
				var iframeBaseUrl = "https://api.nexiopaysandbox.com/pay/v3";
				var oneTimeUseToken = "?token=" + data.token;
				var returnHtml = "&shouldReturnHtml=false";
				setUrl(iframeBaseUrl + oneTimeUseToken + returnHtml);
			}

			// fetch("https://api.nexiopaysandbox.com/pay/v3/token", options)
			// 	.then((response) => response.json())
			// 	.then((response) => console.log(response))
			// 	.catch((err) => console.error(err));

			// const script = document.createElement("script");
			// script.type = "text/javascript";
			// const url = "https://api.nexiopaysandbox.com/pay/v3";
			// script.url = url.match(/^http(s?):\/\/.*?(?=\/)/)[0];
			// window.addEventListener("message", function messageListener(event) {
			// 	if (event.origin === iframeDomain) {
			// 		console.log("received message", event.data);
			// 		if (event.data.event === "loaded") {
			// 			window.document.getElementById("iframe1").style.display = "block";
			// 			window.document.getElementById("loader").style.display = "none";
			// 		}
			// 		if (event.data.event === "processed") {
			// 			console.log("processed", event.data.data);
			// 			var jsonStr = JSON.stringify(event.data.data, null, 1);
			// 			window.document.getElementById("forms-container").innerHTML =
			// 				"<p>Successfully Processed Credit Card Transaction.</p><code><br/><code>" +
			// 				jsonStr +
			// 				"</code>";
			// 		}
			// 	}
			// });
			// document.body.appendChild(script);
		};

		if (!order || successPay || successDeliver) {
			dispatch({ type: ORDER_PAY_RESET });
			dispatch({ type: ORDER_DELIVER_RESET });
			dispatch(getOrder(orderId));
		} else if (!order.isPaid) {
			// if (!window.paypal) {
			// addPayPalScript();
			addNexioScript();
			// } else {
			// 	setSdkReady(true);
			// }
		}
	}, [dispatch, orderId, order, successPay, successDeliver, history, userInfo]);

	const successPaymentHandler = (paymentResult) => {
		dispatch(payOrder(orderId, paymentResult));
	};

	const openModal = () => {
		setIsOpenModal(true);
	};

	const afterOpenModal = () => {};

	const closeModal = () => {
		setIsOpenModal(false);
	};

	const deliverHandler = () => {
		dispatch(deliverOrder(order));
	};

	return loading ? (
		<Loader />
	) : error ? (
		<Message variant='danger'>{error}</Message>
	) : (
		<>
			<h1>Order {order._id}</h1>
			<Row>
				<Col md={8}>
					<ListGroup variant='flush'>
						<ListGroup.Item>
							<h2>Shipping</h2>
							<p>
								<strong>Name:</strong> {order.user.fname} {order.user.lname}
							</p>
							<p>
								<strong>Email:</strong>
								<a href={`mailto:${order.user.email}`}>
									&nbsp;{order.user.email}
								</a>
							</p>
							<p>
								<strong>Address:</strong>
								{order.shippingAddress.address},{order.shippingAddress.city},
								{order.shippingAddress.postalCode},
								{order.shippingAddress.country}
							</p>
							{order.isDelivered ? (
								<Message variant='success'>
									Delivered on {order.deliveredAt}
								</Message>
							) : (
								<Message variant='danger'>Not delivered yet</Message>
							)}
						</ListGroup.Item>
						<ListGroup.Item>
							<h2>Payment Method</h2>
							<p>
								<strong>Method &nbsp;</strong>
								{order.paymentMethod}
							</p>
							{order.isPaid ? (
								<Message variant='success'>Paid on {order.paidAt}</Message>
							) : (
								<Message variant='danger'>Not Paid</Message>
							)}
						</ListGroup.Item>
						<ListGroup.Item>
							<h2>Order Items</h2>
							{order.orderItems.length === 0 ? (
								<Message>Order is empty</Message>
							) : (
								<ListGroup.Item variant='flush'>
									{order.orderItems.map((item, index) => (
										<ListGroup.Item key={index}>
											<Row>
												<Col md={1}>
													<Image
														src={item.image}
														alt={item.name}
														fluid
														rounded
													/>
												</Col>
												<Col>
													<Link to={`/product/${item.product}`}>
														{item.name}
													</Link>
												</Col>
												<Col md={4}>
													{item.qty} x ${item.price} =${item.qty * item.price}{" "}
												</Col>
											</Row>
										</ListGroup.Item>
									))}
								</ListGroup.Item>
							)}
						</ListGroup.Item>
					</ListGroup>
				</Col>
				<Col md={4}>
					<Card>
						<ListGroup variant='flush'>
							<ListGroup.Item>
								<h2>Order Summery</h2>
							</ListGroup.Item>
							<ListGroup.Item>
								<Row>
									<Col>Items</Col>
									<Col>${order.itemsPrice}</Col>
								</Row>
							</ListGroup.Item>
							<ListGroup.Item>
								<Row>
									<Col>Shipping</Col>
									<Col>${order.shippingPrice}</Col>
								</Row>
							</ListGroup.Item>
							<ListGroup.Item>
								<Row>
									<Col>Tax</Col>
									<Col>${order.taxPrice}</Col>
								</Row>
							</ListGroup.Item>
							<ListGroup.Item>
								<Row>
									<Col>
										<h5>
											<strong>Total</strong>
										</h5>
									</Col>
									<Col>
										<h5>
											<strong>${order.totalPrice}</strong>
										</h5>
									</Col>
								</Row>
							</ListGroup.Item>

							{!order.isPaid && (
								<ListGroup.Item>
									{loadingPay && <Loader />}
									{!sdkReady ? (
										<Loader />
									) : (
										// <PayPalButton
										// 	amount={order.totalPrice}
										// 	onSuccess={successPaymentHandler}
										// />
										<Fragment>
											<Button type='button' className='btn btn-block round'>
												Nexio
											</Button>
											<Button
												type='button'
												className='btn btn-block'
												onClick={openModal}>
												Debit and Credit Card
											</Button>
											<ReactModal
												isOpen={isOpenModal}
												onAfterOpen={afterOpenModal}
												onRequestClose={closeModal}
												style={customStyles}>
												<Row>
													<Col
														md={{
															span: 4,
															offset: 7,
														}}>
														<Button variant='secondary' onClick={closeModal}>
															close
														</Button>
													</Col>
												</Row>

												<iframe id='myIframe' src={url}></iframe>
											</ReactModal>
										</Fragment>
									)}
								</ListGroup.Item>
							)}
							{loadingDeliver && <Loader />}
							{userInfo && userInfo.isAdmin && !order.isDelivered && (
								<ListGroup.Item>
									<Button
										type='button'
										className='btn btn-block'
										onClick={deliverHandler}
										disabled={!order.isPaid}>
										Mark as Delivered
									</Button>
								</ListGroup.Item>
							)}
						</ListGroup>
					</Card>
				</Col>
			</Row>
		</>
	);
};

export default OrderScreen;
