import jwt from "jsonwebtoken";
import userSchemaModel from '../model/user.schema.js';  


const createTokens = (user) => {
  const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user._id },   process.env.REFRESH_SECRET, { expiresIn: '5d' });
  //console.log({ accessToken, refreshToken });
  
  return { accessToken, refreshToken }
}


export const register = async (req, res) => {
  try {
    const users = await userSchemaModel.find();
    const len = users.length;
    const _id = len === 0 ? 1 : users[len - 1]._id + 1;

    const {
      designation,
      name,
      surname,
      email,
      phone,
      birthday,
      nationality,
      password,
      confirmPassword,
      role,
      branch
    } = req.body;

  
    if (
      ![
        "super_admin",
        "branch_manager",
        "staff",
        "delivery_boy",
        "supermarket_customer",
        "online_customer"
      ].includes(role)
    ) {
      return res.status(400).json({
        status: false,
        message: "Invalid role selected.",
        code: 400,
      });
    }

    if (role === "online_customer" && !email) {
      return res.status(400).json({
        status: false,
        message: "Email is required for online customers.",
        code: 400,
      });
    }

    if (role === "online_customer") {
      if (!password || !confirmPassword) {
        return res.status(400).json({
          status: false,
          message: "Password and confirmPassword are required for online customers.",
          code: 400,
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({
          status: false,
          message: "Passwords do not match.",
          code: 400,
        });
      }
    }

    if (email) {
      const existingUser = await userSchemaModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          status: false,
          message: "Email already exists.",
          code: 400,
        });
      }
    }

    const userDetails = {
      _id,
      designation,
      name,
      surname,
      email: email || null,
      phone,
      birthday,
      password:password || null,
      nationality,
      role,
      branch,
      registeredDate: new Date(),
    };

    if (role === "online_customer") {
      userDetails.password = password;
    }

    const newUser = await userSchemaModel.create(userDetails);

    res.status(201).json({
      status: true,
      message: "User registered successfully",
      code: 201,
      data: newUser,
    });

  } catch (error) {
    console.log("Error registering user:", error);
    res.status(500).json({
      status: false,
      message: "User registration failed",
      code: 500,
      data: error.message,
    });
  }
};




export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userSchemaModel.findOne({ email });

    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Invalid credentials: user not found",
        code: 401,
      });
    }

    
    if (user.role === "supermarket_customer") {
      return res.status(403).json({
        status: false,
        message: "Supermarket customers cannot login. Their data is updated only at billing.",
        code: 403,
      });
    }

    if (!password) {
      return res.status(400).json({
        status: false,
        message: "Password is required for this role",
        code: 400,
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        status: false,
        message: "Invalid password",
        code: 401,
      });
    }

    const { accessToken, refreshToken } = createTokens(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, 
      sameSite: "Strict",
      maxAge: 5 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      status: true,
      message: "Login successful",
      code: 200,
      data: {
        accessToken,
        user: { _id: user._id, email: user.email, role: user.role },
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Login failed: server error",
      code: 500,
      data: error.message,
    });
  }
};

 

export const refreshToken = (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ "status": false, "message": "no token provide", "code": 401 })
  };

  jwt.verify(token,process.env.REFRESH_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ "status": false, "message": "invalid token", "code": 403 ,err})
    };

    const accessToken = jwt.sign({ id: user.id }, process.env.ACCESS_SECRET, { expiresIn: '15m' });
    return res.status(200).json({
      "status": true, "message": "token generate successfully", "code": 200,
      "data": { accessToken }
    });
  });
};
