/** @format */

import React, { useState, useEffect, Fragment } from "react";

import { Button, Row, Col, ListGroup, Card } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Message from "../components/Message";
import Loader from "../components/Loader";
import { getOrder, payOrder, deliverOrder } from "../actions/orderActions";
import {
	ORDER_PAY_RESET,
	ORDER_DELIVER_RESET,
} from "../constants/orderConstants";
import { NEXIO_CONSTANTS } from "../constants/paymentConstants";
import { getUserDetails } from "../actions/userActions";
import Nexio from "../components/paymentMethods/Nexio";
import Stripe from "../components/paymentMethods/Stripe";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const OrderScreen = ({ match, history }) => {
	const stripePromise = loadStripe(NEXIO_CONSTANTS.STRIPE_CLIENT_SECRET);

	const orderId = match.params.id;
	const dispatch = useDispatch();

	const [variant, setVariant] = useState("");
	const [message, setMessage] = useState("");
	const [clientSecret, setClientSecret] = useState("");

	const userDetails = useSelector((state) => state.userDetails);
	const { user } = userDetails;

	const orderDetails = useSelector((state) => state.orderDetails);
	const { loading, error, order } = orderDetails;

	const userLogin = useSelector((state) => state.userLogin);
	const { userInfo } = userLogin;

	const orderDeliver = useSelector((state) => state.orderDeliver);
	const { loading: loadingDeliver, success: successDeliver } = orderDeliver;

	const orderPay = useSelector((state) => state.orderPay);
	const { loading: loadingPay, success: successPay } = orderPay;

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
			// Create PaymentIntent as soon as the page loads
			fetch("/api/config/stripe/create-payment-intent", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					order: order,
					stripeCustomer: user.stripeCustomer,
				}),
			})
				.then((res) => res.json())
				.then((data) => setClientSecret(data.clientSecret));
		}
	}, [dispatch, orderId, order, successPay, successDeliver, history, userInfo]);

	const appearance = {
		theme: "night",
	};
	const options = {
		clientSecret,
		appearance,
	};

	const orderSuccessHandler = (paymentObject) => {
		setVariant(paymentObject.variant);
		setMessage(paymentObject.message);
		dispatch(payOrder(paymentObject.orderId, paymentObject.paymentResult));
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
			<Message variant={variant}>{message}</Message>
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

							{!order.isPaid &&
								(order.paymentMethod === NEXIO_CONSTANTS.NEXIO ? (
									<Nexio
										order={order}
										orderId={orderId}
										user={user}
										userInfo={userInfo}
										orderPaidSuccess={orderSuccessHandler}
									/>
								) : (
									clientSecret && (
										<Elements options={options} stripe={stripePromise}>
											<Stripe order={order} />
										</Elements>
									)
								))}
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
