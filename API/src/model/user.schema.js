import mongoose from "mongoose";
import crypto from "crypto";
import { parsePhoneNumberFromString } from "libphonenumber-js";

const userSchema = new mongoose.Schema(
  {
    _id: Number,
    designation: { type: String, trim: true ,required:[true,"designation is required"]},
    name: { type: String, required: [true, "Name is required"], trim: true },
    surname: { type: String, trim: true ,required:true},
    email: {
      type: String,
      unique: true,
      sparse: true, // allow empty for supermarket customers
      lowercase: true,
      trim: true,
       validate: {
        validator: function (v) {
          if (this.role === "online_customer") {
            return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
          }
          return true;
        },
        message: "Please provide a valid email for online customers",
      },
    },

 phone: {
  type: String,
  required: [true, "Phone number is required"],
  trim: true,
  unique: true,
  validate: {
    validator: function (v) {
      const phoneNumber = parsePhoneNumberFromString(v);
      return phoneNumber ? phoneNumber.isValid() : false;
    },
    message: "Please provide a valid phone number with country code",
  },
},


    
    password: {
      type: String,
      required: function () {
        return this.role === "online_customer"; 
      },
        minlength: [6, "Password must be at least 6 characters long"],
    },


    role: {
      type: String,
      enum: [
        "super_admin",
        "branch_manager",
        "staff",
        "delivery_boy",
        "supermarket_customer",
        "online_customer",
      ],
      default: "supermarket_customer",
    },

    branch: {
      type: String,
      ref: "Branch",
    },


    birthday: { type: Date },
    registeredDate: { type: Date, default: Date.now },
    lastOrderDate: { type: Date },

   
    points: { type: Number, default: 0 },
    orderCount: { type: Number, default: 0 },
    totalOrderAmount: { type: Number, default: 0 },

    nationality: { type: String, trim: true,required:true },

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

userSchema.methods.getResetPasswordToken = function () {
  if (this.role !== "online_customer") return null;

  const resetToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

export default mongoose.model("Users", userSchema);
