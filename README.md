# Idempotency-Key-API
This project demonstrates a robust implementation of an Idempotency Key mechanism in an Express.js application, focusing on critical operations like payment processing and updates.

The core goal is to ensure that repeated identical requests, identified by a unique Idempotency-Key header, are processed only once, preventing duplicate state changes (e.g., charging a customer twice).

# Technical Stack
  1.NodeJs
  2.Express Framework
  3.Postman

# Setup & Installation

  * Prerequisites
    1.Node.js (V18 or higher)
    2.npm
    3.Postman (for API testing)

 * Steps
  1. Clone the repository with ssh:
      git clone git@github.com:nhsbsa-sabha/Idempotency-Key-API.git  

  2. Install Dependencies:
     npm install

  3. Start the Application:
     npm start

* Running test
    The project includes unit tests for the controller logic using Mocha, Chai, and Sinon.
     npm run test

# API Endpoint
  1.POST: /api/payment -
          Enabled by Idempotency-Key and custom validator ensures amount is required and positive. 

  2.PATCH: /api/payment -
           Enabled by Idempotency-Key and custom validator ensures paymentId is required and valid fields are provided.

  3.POST: api/payment/short-ttl -
           Enabled by Idempotency-Key and custom validator ensures after TTL if request comes it should be consider as new request.

  4.POST: api/payment/idempotency-disabled -
          Disabled by idempotency-key and custom validator ensures amount is required and positive.

  5.PATCH: api/payment/idempotency-disabled -
           Disabled by idempotency-key and custom validator ensures paymentId is required and valid fields are provided.

# Postman Testing: 
   please set header like as follows 
    1. POST: /api/paymet :
    key: Idempotency-Key value: create-payement-idempotency
    
    2. PATCH: /api/payment :
    key: Idempotency-Key value: update-payement-idempotency
   
    3. api/payment/short-ttl :
    key: Idempotency-Key value: idempotency-ssl
   
    4.POST: api/payment/idempotency-disabled :
    key: Idempotency-Key value: create-payment-no-idempotency

    5.PATCH: api/payment/idempotency-disabled :
    key: Idempotency-Key value: update-payment-no-idempotency
