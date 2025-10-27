import { body } from "express-validator";

export const registerUserValidation = [
  body("name", "Name is required and must be atleast 3 characters long.").isLength({min: 3}).notEmpty(),
  body("email", "Please include a valid email").trim().isEmail().normalizeEmail(),
  body("password", "Password must be at least 6 characters").isLength({ min: 6 }),
];
