/** @format */

import React, { useState, useEffect } from "react";
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
import ToastContainer from "react-bootstrap/ToastContainer";
import Toast from "react-bootstrap/Toast";

const OrderScreen = ({ match, history }) => {
  const orderId = match.params.id;

  const [sdkReady, setSdkReady] = useState(false);

  const [iframeUrl, setIFrameUrl] = useState("");
  const [expressIframeUrl, setExpressIFrameUrl] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [errorMessage, setErorMessage] = useState("");

  const dispatch = useDispatch();

  const orderDetails = useSelector((state) => state.orderDetails);
  const { loading, error, order } = orderDetails;

  const orderPay = useSelector((state) => state.orderPay);
  const { loading: loadingPay, success: successPay } = orderPay;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const orderDeliver = useSelector((state) => state.orderDeliver);
  const { loading: loadingDeliver, success: successDeliver } = orderDeliver;

  const toggleShowModal = () => setShowModal(!showModal);

  if (!loading) {
    // Calculate Prices
    const addDecimals = (num) => {
      return Math.round((num * 100) / 100).toFixed(2);
    };

    order.itemsPrice = addDecimals(
      order.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0)
    );
  }

  useEffect(() => {
    console.log("Login check");
    if (!userInfo) {
      history.push("/login");
    }

    const addPayPalScript = async () => {
      const { data: clientId } = await axios.get("/api/config/paypal");
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}`;

      script.async = true;
      script.onload = () => {
        setSdkReady(true);
      };
      document.body.appendChild(script);
    };

    if (!order || successPay || successDeliver) {
      dispatch({ type: ORDER_PAY_RESET });
      dispatch({ type: ORDER_DELIVER_RESET });
      dispatch(getOrder(orderId));
    } else if (!order.isPaid) {
      // if (!window.paypal) {
      //   addPayPalScript();
      // } else {
      //   setSdkReady(true);
      // }
      getIframes();
    }
  }, [dispatch, orderId, order, successPay, successDeliver, history, userInfo]);

  const successPaymentHandler = (paymentResult) => {
    dispatch(payOrder(orderId, paymentResult));
  };

  const deliverHandler = () => {
    dispatch(deliverOrder(order));
  };

  const hasError = (error) => {
    console.log(error);
    if (JSON.stringify(error).includes("error")) {
      setShowModal(true);
      setErorMessage(error.message);
      console.log(error.message);
    }
  };

  const getIframes = async () => {
    const { data: iframeToken } = await axios.get("/api/nexio/apm_token");
    const { data: expressIframeToken } = await axios.get(
      "/api/nexio/express_apm_token"
    );

    // const { data: token } = await axios.get("/api/nexio/recurring");
    console.log(iframeToken, expressIframeToken);
    hasError(iframeToken);
    hasError(expressIframeToken);

    setSdkReady(true);
    setIFrameUrl(iframeToken.expressIFrameUrl);
    setExpressIFrameUrl(expressIframeToken.expressIFrameUrl);
  };

  return loading ? (
    <Loader />
  ) : error ? (
    <Message variant="danger">{error}</Message>
  ) : (
    <>
      <h1>Order {order._id}</h1>

      {!showModal ? null : (
        <div
          aria-live="polite"
          aria-atomic="true"
          className="bg-dark position-relative"
          style={{ minHeight: "130px", maxWidth: "260px" }}
        >
          <ToastContainer position="middle-center" className="p-3">
            <Toast
              className="d-inline-block m-1"
              show={showModal}
              onClose={toggleShowModal}
            >
              <Toast.Header>
                <strong className="me-auto">Error </strong>
              </Toast.Header>
              <Toast.Body>{errorMessage}</Toast.Body>
            </Toast>
          </ToastContainer>
        </div>
      )}

      <Row>
        <Col md={8}>
          <ListGroup variant="flush">
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
                <Message variant="success">
                  Delivered on {order.deliveredAt}
                </Message>
              ) : (
                <Message variant="danger">Not delivered yet</Message>
              )}
            </ListGroup.Item>
            <ListGroup.Item>
              <h2>Payment Method</h2>
              <p>
                <strong>Method &nbsp;</strong>
                {order.paymentMethod}
              </p>
              {order.isPaid ? (
                <Message variant="success">Paid on {order.paidAt}</Message>
              ) : (
                <Message variant="danger">Not Paid</Message>
              )}
            </ListGroup.Item>
            <ListGroup.Item>
              <h2>Order Items</h2>
              {order.orderItems.length === 0 ? (
                <Message>Order is empty</Message>
              ) : (
                <ListGroup.Item variant="flush">
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
            <ListGroup variant="flush">
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
              <label>{iframeUrl}</label>
              {!order.isPaid && (
                <ListGroup.Item>
                  {loadingPay && <Loader />}
                  {!sdkReady ? (
                    <Loader />
                  ) : (
                    <div>
                      <iframe id="myIframe" src={iframeUrl}></iframe>
                      <iframe
                        id="myExpressIframe"
                        src={expressIframeUrl}
                      ></iframe>
                    </div>
                  )}
                </ListGroup.Item>
              )}
              {loadingDeliver && <Loader />}
              {userInfo && userInfo.isAdmin && !order.isDelivered && (
                <ListGroup.Item>
                  <Button
                    type="button"
                    className="btn btn-block"
                    onClick={deliverHandler}
                    disabled={!order.isPaid}
                  >
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
