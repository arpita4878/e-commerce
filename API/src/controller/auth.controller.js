import jwt from "jsonwebtoken";
import userSchemaModel from '../model/user.schema.js';  


const createTokens = (user) => {
  const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, { expiresIn: '5d' });
  console.log({ accessToken, refreshToken });
  
  return { accessToken, refreshToken }
}




export const register = async (req, res) => {

  const users = await userSchemaModel.find();
  const len = users.length;
  const _id = len == 0 ? 1 : users[len - 1]._id + 1;

  const { name, email, password, confirmPassword, role, branch } = req.body;
  console.log(req.body);
  

  if (!['super_admin', 'branch_admin', 'staff', 'delivery_boy'].includes(role)) {
    return res.status(400).json({
      status: false,
      message: "Invalid role selected.",
      code: 400,
    });
  }

  
  const existingUser = await userSchemaModel.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      status: false,
      message: "Email already exists.",
      code: 400,
    });
  }

  const userDetails = {
    _id:_id,
    name,
    email,
    password,
    role,
    branch,
    info: new Date(),
  };

  try {
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
 console.log("Raw body:", req.body);

  const { email, password } = req.body;
  console.log("Extracted email:", email);
  console.log("Extracted password:", password);

  

  try {
    const user = await userSchemaModel.findOne({ email});

    if (!user) {
      return res.status(401).json({ "status": false, message: 'Invalid credentials, check password or email', "code": 401 });
    }

    const { accessToken, refreshToken } = createTokens(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 5 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      "status": true, "message": "login successful", "code": 201, "data": {
        accessToken, user: { _id: user._id, email: user.email, role: user.role }
      }
    })

  }

  catch (error) {
    res.status(500).json({ "status": false, "message": "login failed server error", "code": 500, "data": error.message })
  }

};
 