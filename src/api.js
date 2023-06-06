const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://namit:namitjain@cluster0.6dfy7y6.mongodb.net/ecommerce?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

// User schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});
const User = mongoose.model('User', userSchema);

// Order schema
const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  order: {
    type: String,
    required: true,
  },
});
const Order = mongoose.model('Order', orderSchema);

// Generate JWT token for a user
const generateToken = (user) => {
  const payload = { id: user._id, name: user.name };
  const secretKey = 'namit-jain'; 
  const options = { expiresIn: '1h' }; 
  return jwt.sign(payload, secretKey, options);
};

// Register a new user
app.post('/add-user', (req, res) => {
  const { name, phoneNumber, password } = req.body;
  const newUser = new User({ name, phoneNumber, password });
  newUser.save()
    .then((user) => {
      res.json(user);
    })
    .catch((error) => {
      res.status(500).json({ error: 'Failed to add user' });
    });
});

// Authenticate and generate JWT token for a user
app.post('/login', (req, res) => {
  const { phoneNumber, password } = req.body;
  User.findOne({ phoneNumber, password })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const token = generateToken(user);
      res.json({ token });
    })
    .catch((error) => {
      res.status(500).json({ error: 'Failed to login' });
    });
});

// Add a new order for a user
app.post('/add-order', authenticateUser, (req, res) => {
  const { user } = req;
  const { order } = req.body;
  const newOrder = new Order({ userId: user._id, order });
  newOrder.save()
    .then((order) => {
      res.json(order);
    })
    .catch((error) => {
      res.status(500).json({ error: 'Failed to add order' });
    });
});

// Get order details for a user
app.get('/users/:userId/orders', authenticateUser, (req, res) => {
  const { userId } = req.params;
  Order.find({ userId })
    .then((orders) => {
      res.json(orders);
    })
    .catch((error) => {
      res.status(500).json({ error: 'Failed to retrieve order details' });
    });
});

// Middleware for user authentication
function authenticateUser(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  jwt.verify(token, 'your-secret-key', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    User.findById(decoded.id)
      .then((user) => {
        if (!user) {
          return res.status(401).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
      })
      .catch((error) => {
        res.status(500).json({ error: 'Failed to authenticate user' });
      });
  });
}

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
