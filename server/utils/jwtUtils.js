import jwt from 'jsonwebtoken';

export const generateToken = (userData) => {
  if (!userData || typeof userData !== 'object') {
    throw new Error('Invalid user data for token generation');
  }

  const payload = {
    id: userData.id || userData._id,
    orgId: userData.orgId
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

export const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.verify(token, process.env.JWT_SECRET);
}; 