import React, { Fragment, useEffect, useState } from "react";
import axios from "axios";

import ReactModal from "react-modal";
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
	Tabs,
	Tab,
} from "react-bootstrap";
import { GrFormClose } from "react-icons/gr";
import { useDispatch, useSelector } from "react-redux";
import { NEXIO_CONSTANTS } from "../../constants/paymentConstants";
import { update } from "../../actions/userActions";

const Nexio = ({ order, user, orderId, userInfo, orderPaidSuccess }) => {
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
	const dispatch = useDispatch();

	const [amount, setAmount] = useState(299);
	const [sdkReady, setSdkReady] = useState(false);
	const [paymentResult, setPaymentResult] = useState({});
	const [month, setMonth] = useState(1);
	const [card, setCard] = useState({});
	const [action, setAction] = useState("");
	const [isOpenModal, setIsOpenModal] = useState(false);
	const [url, setUrl] = useState("");
	const [loader, setLoader] = useState(false);
	const [token, setToken] = useState("");
	const [variant, setVariant] = useState("");
	const [message, setMessage] = useState("");
	const [intervalAmount, setIntervalAmount] = useState(0);

	// useEffect(() => {
	// 	console.log("successPay");
	// 	if (successPay) {

	// 	}
	// }, [successPay]);

	const openModal = async () => {
		console.log(token);
		if (action === NEXIO_CONSTANTS.PAYMENT) {
		} else {
		}
		setIsOpenModal(true);
	};

	const startRecurringPayment = async (type) => {
		const config = {
			headers: {
				"Content-Type": "application/json",
			},
		};

		let payload = {
			token: user.savedCardToken,
			id: user._id,
			totalPrice:
				type === NEXIO_CONSTANTS.RECURRING_PAYMENT_PAYPLAN
					? order.totalPrice
					: -1,
			intervalAmount:
				type === NEXIO_CONSTANTS.RECURRING_PAYMENT_PAYPLAN
					? intervalAmount
					: amount,
			month: month,
		};

		const { data } = await axios.post(
			"/api/config/nexio/recurring/pay",
			{
				...payload,
			},
			config,
		);

		if (!isError(data)) {
			console.log(data);
			if (type === NEXIO_CONSTANTS.RECURRING_PAYMENT_SUBSCRIPTION) {
				dispatch(
					update({
						...userInfo,
						savedTokenSubscription: data.id,
					}),
				);
			} else {
				dispatch(
					update({
						...userInfo,
						savedTokenPayplan: data.id,
					}),
				);
			}
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

	const payWithSavedEcheck = async () => {
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

		isError(data);
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
		isError(data);
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
		let paymentResultObj = {
			orderId: orderId,
			paymentResult: paymentResult,
			variant: variant,
			message: message,
		};
		// setPaymentResult({ ...paymentResultObj });
		orderPaidSuccess(paymentResultObj);
	};

	const closeModal = () => {
		setIsOpenModal(false);
	};

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
				setIsOpenModal(false);
				setVariant("danger");
				setMessage(`${eventData.error}:${eventData.message}`);
				console.log("error", eventData);
			}

			if (eventType === "processed") {
				setLoader(false);
				setIsOpenModal(false);

				setVariant("success");
				setMessage(`Payment successful..!!`);
				successPaymentHandler(eventData);
			}

			if (eventType === "eCheckProcessed") {
				setLoader(false);
				setIsOpenModal(false);
				console.log("changes", eventData);
				setVariant("success");
				setMessage(`Payment successful..!!`);
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
					setVariant("success");
					setMessage(`Your Card is saved for future use..!!`);
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
					setVariant("success");
					setMessage(`Your eCheck is saved for future use..!!`);
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

	const isError = (data) => {
		if (JSON.stringify(data).includes("error")) {
			setVariant("danger");
			setMessage(`${data.message}`);
			setIsOpenModal(false);
			console.log(data);
			return true;
		} else {
			setIsOpenModal(false);
			setVariant("success");
			setMessage(`Payment Successful..!`);
			successPaymentHandler({
				...data,
				kountResponse: {
					status: "success",
				},
			});
			return false;
		}
	};

	return (
		<ListGroup.Item>
			{/* {loadingPay && <Loader />} */}
			{
				// <PayPalButton
				// 	amount={order.totalPrice}
				// 	onSuccess={successPaymentHandler}
				// />
				<Fragment>
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
						onClick={payWithSavedEcheck}>
						Pay with Saved the E-check
					</Button>
					<hr />
					<Container>
						<Row className='justify-content-md-center'>
							<Col cs={12} md={6}>
								<h5>Recurring</h5>
							</Col>
						</Row>
					</Container>
					<Button
						type='button'
						className='btn btn-block'
						onClick={getRecurringPaymentForm}>
						Recurring Payment
					</Button>

					<ReactModal
						isOpen={isOpenModal}
						onRequestClose={closeModal}
						style={customStyles}>
						<Row>
							<Col md={9}></Col>
							<Col md={3}>
								<Button variant='secondary' onClick={closeModal}>
									<GrFormClose size={30} />
								</Button>
							</Col>
						</Row>

						{action === NEXIO_CONSTANTS.PAY_WITH_SAVE_CARD ? (
							<Fragment>
								<Form>
									<Form.Label>Saved Card</Form.Label>
									<br />
									<Form.Label className='m-3'>
										**** {card?.tokenex?.lastFour}
									</Form.Label>

									<Form.Group controlId='CVV'>
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
									<Form.Label>Saved Card</Form.Label>
									<br />
									<Form.Label className='m-3'>
										**** {card?.tokenex?.lastFour}
									</Form.Label>
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
									onClick={payWithSavedEcheck}>
									Pay
								</Button>
							</Fragment>
						) : action === NEXIO_CONSTANTS.RECURRING_PAYMENT ? (
							<Fragment>
								<Tabs
									defaultActiveKey='subscription'
									id='uncontrolled-tab-example'
									fill>
									<Tab eventKey='subscription' title='Subscription'>
										<Form>
											<Form.Group controlId='CVV'>
												<Form.Label className='m-3 mt-5'>
													**** {card?.tokenex?.lastFour}
												</Form.Label>
												<Form.Control
													type='CVV'
													placeholder='Enter the CVV'></Form.Control>
											</Form.Group>

											<Form.Group controlId='CVV'>
												<Form.Label>
													Amount of{" "}
													<span className='bold-italic'>{amount}</span> will be
													debited for every{" "}
													<span className='bold-italic'>{month}</span> month.
												</Form.Label>
											</Form.Group>
										</Form>
										<Button
											type='submit'
											variant='primary'
											onClick={() => {
												startRecurringPayment(
													NEXIO_CONSTANTS.RECURRING_PAYMENT_SUBSCRIPTION,
												);
											}}>
											Start Subscription
										</Button>
									</Tab>
									<Tab eventKey='pay-plan' title='Pay Plan'>
										<Form className='mt-5'>
											<Form.Group controlId='CVV'>
												<Form.Label>**** {card?.tokenex?.lastFour}</Form.Label>
												<Form.Control
													type='CVV'
													placeholder='Enter the CVV'></Form.Control>
											</Form.Group>
											<hr />
											<Form.Group controlId='CVV'>
												<Form.Label>Amount</Form.Label>
												<Form.Control
													type='number'
													value={intervalAmount}
													onChange={(e) => {
														setIntervalAmount(e.target.value);
													}}
													placeholder='Choose amount'></Form.Control>
											</Form.Group>

											<Form.Group controlId='recurring'>
												<Form.Label>Choose Interval(in days)</Form.Label>
												<div>
													<Form.Control
														as='select'
														value={month}
														onChange={(e) => setMonth(e.target.value)}>
														<option key={1} value={1}>
															1
														</option>
														<option key={2} value={2}>
															2
														</option>
														<option key={3} value={3}>
															3
														</option>
														<option key={15} value={15}>
															15
														</option>
													</Form.Control>
												</div>
											</Form.Group>
										</Form>
										<Button
											type='submit'
											variant='primary'
											onClick={() => {
												startRecurringPayment(
													NEXIO_CONSTANTS.RECURRING_PAYMENT_PAYPLAN,
												);
											}}>
											Start Pay Plan
										</Button>
									</Tab>
								</Tabs>
							</Fragment>
						) : (
							<iframe id='myIframe' src={url}></iframe>
						)}
					</ReactModal>
				</Fragment>
			}
		</ListGroup.Item>
	);
};

export default Nexio;
