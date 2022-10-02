/** @format */

import React, { useState, useEffect, Fragment } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
	Button,
	Row,
	Col,
	ListGroup,
	Image,
	Card,
	Form,
	Stack,
	Container,
} from "react-bootstrap";
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
import { NEXIO_CONSTANTS } from "../constants/nexioConstants";
import {
	getUserDetails,
	update,
	updateUserAdmin,
} from "../actions/userActions";
import FormContainder from "../components/FormContainder";

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
	const [month, setMonth] = useState(3);
	const [card, setCard] = useState({});
	const [action, setAction] = useState("");
	const [isOpenModal, setIsOpenModal] = useState(false);
	const [url, setUrl] = useState("");
	const [loader, setLoader] = useState(false);
	const [token, setToken] = useState("");

	const dispatch = useDispatch();

	const userDetails = useSelector((state) => state.userDetails);
	const { user } = userDetails;

	const orderDetails = useSelector((state) => state.orderDetails);
	const { loading, error, order } = orderDetails;

	const orderPay = useSelector((state) => state.orderPay);
	const { loading: loadingPay, success: successPay } = orderPay;

	const userLogin = useSelector((state) => state.userLogin);
	const { userInfo } = userLogin;

	const orderDeliver = useSelector((state) => state.orderDeliver);
	const { loading: loadingDeliver, success: successDeliver } = orderDeliver;

	window.addEventListener("message", function messageListener(event) {
		if (event.origin === NEXIO_CONSTANTS.URL) {
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

			if (eventType === "eCheckProcessed") {
				setLoader(false);
				setIsOpenModal(false);
				console.log("changes", eventData);
				successPaymentHandler({
					...eventData,
					kountResponse: {
						status: "success",
					},
				});
				console.log("transaction successfully..!");
			}

			if (eventType === "cardSaved") {
				setLoader(false);
				setIsOpenModal(false);
				if (eventData.token.token.length > 0) {
					dispatch(
						update({
							...userInfo,
							savedCardToken: eventData.token.token,
						}),
					);
				}
			}

			if (eventType === "eCheckSaved") {
				setLoader(false);
				setIsOpenModal(false);
				if (eventData.token.token.length > 0) {
					dispatch(
						update({
							...userInfo,
							savedEcheckToken: eventData.token.token,
						}),
					);
				}
			}
		}
	});

	useEffect(() => {
		dispatch(getUserDetails("profile"));
		if (!userInfo) {
			history.push("/login");
		}

		if (!order || successPay || successDeliver) {
			dispatch({ type: ORDER_PAY_RESET });
			dispatch({ type: ORDER_DELIVER_RESET });
			dispatch(getOrder(orderId));
		} else if (!order.isPaid) {
			// if (action === NEXIO_CONSTANTS.PAYMENT) {
			// 	getIframeForPayment();
			// } else if (action === NEXIO_CONSTANTS.SAVE_CARD) {
			// 	getIframeForSaveCard();
			// }
		}
	}, [dispatch, orderId, order, successPay, successDeliver, history, userInfo]);

	const startRecurringPayment = async () => {
		// const paymentBody =  {
		// 	data: {
		// 	  amount: 19.99,
		// 	  "currency": "USD",
		// 	  "customer": {
		// 		"customerRef": "RP006"
		// 	  }
		// 	},
		// 	"tokenex": {
		// 	  "token": "6ee140a0-05d1-4958-8325-b38a690dbb9d"
		// 	}
		//   },
		//   "schedule": {
		// 	"interval": "week",
		// 	"intervalCount": 2
		//   }
		// }'
		console.log(user);
		const config = {
			headers: {
				"Content-Type": "application/json",
			},
		};
		const { data } = await axios.post(
			"/api/config/nexio/recurring/pay",
			{
				token: user.savedCardToken,
				id: user._id,
				totalPrice: order.totalPrice,
				month: month,
			},
			config,
		);
		if (data) {
			console.log("data", data);
			setIsOpenModal(false);
			// successPaymentHandler(data);
		}
	};
	const getRecurringPaymentForm = () => {
		savedCardsModal();
		setAction(NEXIO_CONSTANTS.RECURRING_PAYMENT);
		setIsOpenModal(true);
	};

	const getIframeForPayment = async () => {
		const config = {
			headers: {
				"Content-Type": "application/json",
			},
		};

		const { data } = await axios.post(
			"/api/config/nexio/card-iframe",
			order,
			config,
		);

		if (data) {
			setSdkReady(true);
			setUrl(data);
			setAction(NEXIO_CONSTANTS.PAYMENT);
			openModal();
		}
	};

	const getIframeForSaveCard = async () => {
		const { data } = await axios.get("/api/config/nexio/save-card-iframe");

		if (data) {
			console.log(data);
			setSdkReady(true);
			setUrl(data);

			setAction(NEXIO_CONSTANTS.SAVE_CARD);
			openModal();
		}
	};

	const savedCardsModal = async () => {
		const config = {
			headers: {
				"Content-Type": "application/json",
			},
		};

		setAction(NEXIO_CONSTANTS.PAY_WITH_SAVE_CARD);

		const { data } = await axios.post(
			"/api/config/nexio/saved-card/view",
			{ token: user.savedCardToken },
			config,
		);
		if (data) {
			console.log(data);
			setCard({ ...data });
			openModal();
		}
		console.log("data", data);
	};

	const savedEchecksPayment = async () => {
		const config = {
			headers: {
				"Content-Type": "application/json",
			},
		};

		setAction(NEXIO_CONSTANTS.PAY_WITH_SAVE_ECHECK);

		console.log("ress");
		const { data } = await axios.post(
			"/api/config/nexio/save-echeck/pay",
			{ token: user.savedEcheckToken },
			config,
		);
		if (data) {
			setLoader(false);
			setIsOpenModal(false);
			successPaymentHandler({
				...data,
				kountResponse: {
					status: "success",
				},
			});
		}
		console.log("data", data);
	};

	const payWithSavedCard = async () => {
		const config = {
			headers: {
				"Content-Type": "application/json",
			},
		};
		const { data } = await axios.post(
			"/api/config/nexio/save-card/pay",
			{ token: user.savedCardToken },
			config,
		);
		if (data) {
			console.log(data);
			setIsOpenModal(false);
			successPaymentHandler(data);
		}
	};

	const getIframeForECheck = async () => {
		const config = {
			headers: {
				"Content-Type": "application/json",
			},
		};

		const { data } = await axios.post(
			"/api/config/nexio/e-check",
			order,
			config,
		);

		if (data) {
			setSdkReady(true);
			setUrl(data);
			setAction(NEXIO_CONSTANTS.ECHECK);
			openModal();
		}
	};

	const getIframeForSaveEcheck = async () => {
		const { data } = await axios.get("/api/config/nexio/save-echeck");
		if (data) {
			console.log(data);
			setSdkReady(true);
			setUrl(data);

			setAction(NEXIO_CONSTANTS.SAVE_ECHECK);
			openModal();
		}
	};

	const successPaymentHandler = (paymentResult) => {
		dispatch(payOrder(orderId, paymentResult));
	};

	const openModal = async () => {
		console.log(token);
		if (action === NEXIO_CONSTANTS.PAYMENT) {
		} else {
		}
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
									{/* {loadingPay && <Loader />} */}
									{
										// <PayPalButton
										// 	amount={order.totalPrice}
										// 	onSuccess={successPaymentHandler}
										// />
										<Fragment>
											<Button
												type='button'
												className='btn btn-block'
												onClick={getRecurringPaymentForm}>
												Recurring Payment
											</Button>
											<hr />
											<Container>
												<Row className='justify-content-md-center'>
													<Col cs={12} md={6}>
														<h4>Cards</h4>
													</Col>
												</Row>
											</Container>
											<Button
												type='button'
												className='btn btn-block'
												onClick={getIframeForPayment}>
												Debit or Credit Card
											</Button>
											<Button
												type='button'
												className='btn btn-block'
												onClick={getIframeForSaveCard}>
												Save Debit or Credit Card
											</Button>
											<Button
												type='button'
												className='btn btn-block'
												onClick={savedCardsModal}>
												Pay with saved card
											</Button>
											<hr />
											<Container>
												<Row className='justify-content-md-center'>
													<Col cs={12} md={6}>
														<h4>E-Check</h4>
													</Col>
												</Row>
											</Container>
											<Button
												type='button'
												className='btn btn-block'
												variant='outline-dark'
												onClick={getIframeForECheck}>
												Pay with E-check
											</Button>
											<Button
												type='button'
												className='btn btn-block'
												variant='outline-dark'
												onClick={getIframeForSaveEcheck}>
												Save the E-check
											</Button>
											<Button
												type='button'
												className='btn btn-block'
												variant='outline-dark'
												onClick={savedEchecksPayment}>
												Pay with Saved the E-check
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

												<hr />

												{action === NEXIO_CONSTANTS.PAY_WITH_SAVE_CARD ? (
													<Fragment>
														<Form>
															{/* <Form.Group controlId='card'>
																<Form.Label>Card</Form.Label>
																<Text
																	type='card'
																	placeholder='Enter the Email'
																	value={email}
																	onChange={(e) =>
																		setEmail(e.target.value)
																	}></Text>
															</Form.Group> */}
															<hr />
															<h5>Card</h5>
															<h6>**** {card?.tokenex?.lastFour}</h6>

															<Form.Group controlId='CVV'>
																<Form.Label>CVV</Form.Label>
																<Form.Control
																	type='CVV'
																	placeholder='Enter the CVV'></Form.Control>
															</Form.Group>
														</Form>
														<Button
															type='submit'
															variant='primary'
															onClick={payWithSavedCard}>
															Pay
														</Button>
													</Fragment>
												) : action === NEXIO_CONSTANTS.PAY_WITH_SAVE_ECHECK ? (
													<Fragment>
														<Form>
															{/* <Form.Group controlId='card'>
																<Form.Label>Card</Form.Label>
																<Text
																	type='card'
																	placeholder='Enter the Email'
																	value={email}
																	onChange={(e) =>
																		setEmail(e.target.value)
																	}></Text>
															</Form.Group> */}
															<hr />
															<h5>Card</h5>
															<h6>**** {card?.tokenex?.lastFour}</h6>
															<hr />
															<Form.Group controlId='CVV'>
																<Form.Label>CVV</Form.Label>
																<Form.Control
																	type='CVV'
																	placeholder='Enter the CVV'></Form.Control>
															</Form.Group>
														</Form>
														<Button
															type='submit'
															variant='primary'
															onClick={payWithSavedCard}>
															Login
														</Button>
													</Fragment>
												) : action === NEXIO_CONSTANTS.RECURRING_PAYMENT ? (
													<Fragment>
														<Form>
															<h5>Start a Recurring Payment</h5>
															<hr />
															<Form.Group controlId='CVV'>
																<Form.Label>
																	**** {card?.tokenex?.lastFour}
																</Form.Label>
																<Form.Control
																	type='CVV'
																	placeholder='Enter the CVV'></Form.Control>
															</Form.Group>
															<hr />
															<Form.Group controlId='recurring'>
																<Form.Label>
																	Choose Interval(in months)
																</Form.Label>
																<div>
																	<Form.Control
																		as='select'
																		value={month}
																		onChange={(e) => setMonth(e.target.value)}>
																		<option key={3} value={3}>
																			3
																		</option>
																		<option key={6} value={6}>
																			6
																		</option>
																		<option key={9} value={9}>
																			9
																		</option>
																		<option key={12} value={12}>
																			12
																		</option>
																	</Form.Control>
																</div>
															</Form.Group>
														</Form>
														<Button
															type='submit'
															variant='primary'
															onClick={startRecurringPayment}>
															Start Recurring payment
														</Button>
													</Fragment>
												) : (
													<iframe id='myIframe' src={url}></iframe>
												)}
											</ReactModal>
										</Fragment>
									}
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
