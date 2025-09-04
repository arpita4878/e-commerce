import crypto from "crypto";
import User from "../model/user.schema.js";

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get("host")}/users/reset/${resetToken}`;

  
  console.log("Reset URL:", resetUrl);

  res.json({ message: "Password reset link sent", resetUrl });
};


export const resetPassword = async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ message: "Invalid or expired token" });

  user.password = req.body.password; 
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ message: "Password reset successful" });
};


export const changePassword = async (req, res) => {
//   const userId = req.user.id; 
  try {
    const { userId, oldPassword, newPassword } = req.body;

    const user = await User.findOne({ email: userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.password !== oldPassword) {
      return res.status(400).json({ message: "Old password incorrect" });
    }

    
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



export const fetch = async (req, res) => {
  try {
    const users = await User.find(req.query);
    if (users.length === 0) {
      return res.status(404).json({ status: false, message: "No users found", code: 404 });
    }
    res.status(200).json({ status: true, message: "Users fetched successfully", code: 200, data: users });
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ status: false, message: "Internal server error", code: 500 });
  }
};



export const deleteUser = async (req, res) => {
  const query = req.body;

  if (!query ) {
    return res.status(400).json({ status: false, message: "Enter valid delete condition", code: 400 });
  }

  try {
    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found", code: 404 });
    }

    await User.deleteOne(query);
    res.status(200).json({ status: true, message: "User deleted", code: 200 });

  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ status: false, message: "Server error", code: 500 });
  }
};



export const update = async (req, res) => {
  const { condition_obj, content_obj } = req.body;

  if (!condition_obj || !content_obj ) {
    return res.status(400).json({ status: false, message: "Invalid update request", code: 400 });
  }

  try {
    const user = await User.findOne(condition_obj);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found", code: 404 });
    }

    await User.updateOne(condition_obj, { $set: content_obj });
    res.status(200).json({ status: true, message: "User updated", code: 200 ,data:user});

  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ status: false, message: "Server error", code: 500 });
  }
};




// GET CUSTOMER DETAILS BY PHONE (used by staff at billing)
export const getCustomerByPhone = async (req, res) => {
  try {
    const { phone } = req.params;

    if (!phone) {
      return res.status(400).json({
        status: false,
        message: "Customer phone number is required",
        code: 400,
      });
    }

    const customer = await User.findOne({ phone, role: "supermarket_customer" ||"online_customer" });

    if (!customer) {
      return res.status(404).json({
        status: false,
        message: "Customer not found",
        code: 404,
      });
    }

    return res.status(200).json({
      status: true,
      message: "Customer details fetched successfully",
      code: 200,
      data: customer,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error",
      code: 500,
      data: error.message,
    });
  }
};
