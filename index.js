require("dotenv").config();
const express = require("express");
const server = express();
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport"); //passport creates a session on server and session is contained in req.user, session ends after server reload
const LocalStrategy = require("passport-local").Strategy;
const crypto = require("crypto"); //used to encrypt password
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
var jwt = require("jsonwebtoken"); //to create token
const cookieParser = require("cookie-parser");
const path = require("path");

const { createProduct } = require("./controller/Product");
const productsRouters = require("./routes/Products");
const categoriesRouters = require("./routes/Categories");
const brandsRouters = require("./routes/Brands");
const usersRouters = require("./routes/Users");
const authRouters = require("./routes/Auth");
const cartRouters = require("./routes/Cart");
const ordersRouters = require("./routes/Orders");
const { User } = require("./model/User");
const { isAuth, sanitizeUser, cookieExtractor } = require("./services/common");

//Webhook

//TODO : we will capture actual order after deploying our server live on public URL

// Replace this endpoint secret with your endpoint's unique secret
// If you are testing with the CLI, find the secret by running 'stripe listen'
// If you are using an endpoint defined with the API or dashboard, look in your webhook settings
// at https://dashboard.stripe.com/webhooks
const endpointSecret = process.env.ENDPOINT_SECRET;

server.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (request, response) => {
    let event = request.body;
    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse
    if (endpointSecret) {
      // Get the signature sent by Stripe
      const signature = request.headers["stripe-signature"];
      try {
        event = stripe.webhooks.constructEvent(
          request.body,
          signature,
          endpointSecret
        );
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return response.sendStatus(400);
      }
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log(
          `PaymentIntent for ${paymentIntent.amount} was successful!`
        );
        // Then define and call a method to handle the successful payment intent.
        // handlePaymentIntentSucceeded(paymentIntent);
        break;
      case "payment_method.attached":
        const paymentMethod = event.data.object;
        // Then define and call a method to handle the successful attachment of a PaymentMethod.
        // handlePaymentMethodAttached(paymentMethod);
        break;
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);

//JWT options

const opts = {};
opts.jwtFromRequest = cookieExtractor; //helps us to extract the cookie from the client requests
opts.secretOrKey = process.env.JWT_SECRET_KEY; //TODO : should now be in code

//middlewares
server.use(express.static(path.resolve(__dirname, "build")));
server.use(cookieParser()); //enable us to read the cookies coming in the requests from clients
server.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
  })
);
server.use(passport.authenticate("session"));

server.use(
  cors({
    exposedHeaders: ["X-Total-Count"],
  })
); //cuz we cant call one port from another, like 8080 from 3000

server.use(express.json()); //to parse req.body
server.use("/products", isAuth(), productsRouters.router); // we can also use JWT token for client-only auth
server.use("/brands", isAuth(), brandsRouters.router);
server.use("/categories", isAuth(), categoriesRouters.router);
server.use("/users", isAuth(), usersRouters.router);
server.use("/auth", authRouters.router);
server.use("/cart", isAuth(), cartRouters.router);
server.use("/orders", isAuth(), ordersRouters.router);

//this line we add to make react router work in case of other routes doesn't match
server.get("*", (req, res) =>
  res.sendFile(path.resolve("build", "index.html"))
);

//Passport Strategies
passport.use(
  "local",
  new LocalStrategy({ usernameField: "email" }, async function (
    email,
    password,
    done
  ) {
    //by default passport uses username
    //below part is kinnda same as login code in auth.js
    try {
      console.log("passportLocal");
      const user = await User.findOne({ email: email });
      if (!user) {
        return done(null, false, { message: "invalid credentials" }); //first argument is error
      }
      crypto.pbkdf2(
        password,
        user.salt,
        310000,
        32,
        "sha256",
        async function (err, hashedPassword) {
          //hashed passowrd will be new password but it can be verified with user.password
          if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
            return done(null, false, { message: "invalid credentials" });
          } else {
            const token = jwt.sign(
              sanitizeUser(user),
              process.env.JWT_SECRET_KEY
            ); //creating token, first argument is payload, second is secret key, //token will contain sanitised user info which but hidden, only server will be able to read it
            done(null, { id: user.id, role: user.role, token }); //this line sends to serializer
          }
        }
      );
    } catch (err) {
      done(err);
    }
  })
);

//jwt is generally used for api,it helps in having no dependency on server, if we have a token stored which we can send to server to check
passport.use(
  "jwt",
  new JwtStrategy(opts, async function (jwt_payload, done) {
    try {
      console.log("passportjwt");
      const user = await User.findById(jwt_payload.id);
      if (user) {
        console.log("mila user");
        return done(null, sanitizeUser(user)); //this calls serializer
      } else {
        console.log("nhi mila user");
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  })
);

//this creates session variable req.user on being called from callbacks
passport.serializeUser(function (user, cb) {
  //The serializeUser function is called when a user logs in, and it determines what user information should be stored in the session
  console.log("serialize", user);
  process.nextTick(function () {
    return cb(null, { id: user.id, role: user.role });
  });
});
//after getting serialised, every request after that will contain req.user, if we are authennticated, this is what passport do, it creates a session in the server, req.user contains the session (?)

//this changes session variable req.user when called from authorised request
passport.deserializeUser(function (user, cb) {
  // serializeUser is called on every subsequent request to deserialize the user information from the session and make it available in the req.user object.
  console.log("deserialize", user);
  process.nextTick(function () {
    return cb(null, user);
  });
});

//Payments

// This is your test secret API key.
const stripe = require("stripe")(process.env.STRIPE_SERVER_KEY);

server.post("/create-payment-intent", async (req, res) => {
  const { totalAmount, orderId } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount * 100, //for decimal compensation
    currency: "inr",
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      orderId,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

server.listen(4242, () => console.log("Running on port 4242"));

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("database connected");
}

server.listen(process.env.PORT, () => {
  console.log("server started");
});
