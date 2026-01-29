import User from "../models/User.js";
import jwt from "jsonwebtoken";
const authController = {};

// Login
authController.login_get = function (req, res) {
  res.render("login", { loginError: req.flash("loginError") });
};
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: "", password: "" };

  // incorrect email
  if (err.message === "Incorrect email") {
    errors.email = "That email is not registered";
  }

  // incorrect password
  if (err.message === "Incorrect password") {
    errors.password = "That password is incorrect";
  }

  // duplicate error code
  if (err.code === 11000) {
    errors.email = "That email is already registered";
    return errors;
  }

  // validation errors
  if (err.message.includes("user validation failed")) {
    console.log(Object.values(err.errors));

    Object.values(err.errors).forEach(({ properties }) => {
      console.log(properties);
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

const maxAge = 3 * 24 * 60 * 60; // 3 days in seconds
const createToken = (id) => {
  return jwt.sign({ id }, "buM@xfiySoz", {
    expiresIn: maxAge,
  });
};

authController.login_post = async function (req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 }); // maxAge is in ms in browsers
    res.status(200).redirect("/");
  } catch (err) {
    const errors = handleErrors(err);
    req.flash("loginError", errors.email + errors.password);
    res.redirect("/login");
    // res.status(400).json({ errors });
  }
};

// Sign up
authController.register_get = function (req, res) {
  // Only redirect if a valid user is present (set by checkUser middleware)
  if (res.locals && res.locals.user) {
    res.redirect("/");
    return;
  }
  res.render("register", { registerError: req.flash("registerError") });
};
authController.register_post = async function (req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.create({ email, password });
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 }); // maxAge is in ms in browsers
    res.status(201).redirect("/");
  } catch (err) {
    const errors = handleErrors(err);
    req.flash("registerError", errors.email + errors.password);
    res.redirect("/register");
    // res.status(400).json({ errors });
  }
};

// Logout
authController.logout_get = async function (req, res) {
  res.clearCookie("jwt");
  res.redirect("/");
};

export default authController;
