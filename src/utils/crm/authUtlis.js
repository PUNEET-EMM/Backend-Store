import jwt from "jsonwebtoken";

// Generate token for internal CRM user
export const generateInternalToken = (user) => {
  const { _id, email, role } = user;
  return jwt.sign(
    { userId: _id, email, role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Verify internal CRM token
export const verifyInternalToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null; 
  }
};
