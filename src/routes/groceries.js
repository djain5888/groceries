const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const Grocery = require('../models/grocery');

// Get all groceries for a user
router.get('/', authenticate, async (req, res) => {
  try {
    const groceries = await Grocery.find();
    // { userId: req.user.id }
    res.json(groceries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/userspecificgrocery', authenticate, async (req, res) => {
  try {
    // Filter groceries by user ID
    const groceries = await Grocery.find({ userId: req.user.id });
    res.json(groceries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// router.get('/', async (req, res) => {
//   try {
//     const groceries = await Grocery.find();
//     res.json(groceries);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });
// Add a new grocery
// router.post('/', authenticate, async (req, res) => {
//   const grocery = new Grocery({
//     sellerContact: req.user.id,
//     itemName: req.body.itemName,
//     quantity: req.body.quantity,
//     expirationDate: req.body.expirationDate,
//     location: req.body.location,
//     minPrice: req.body.minPrice,
//     status: 'available'
//   });

//   try {
//     const newGrocery = await grocery.save();
//     res.status(201).json(newGrocery);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    
    // Find user by verification token
    const user = await User.findOne({ verificationToken: token });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }
    
    // Mark user as verified
    user.isVerified = true;
    user.verificationToken = null;
    await user.save();
    
    res.status(200).json({ message: 'Email verified successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/UserBids', authenticate,async (req, res) => {
  // const userId = parseInt(req.params.userId);
  // const userBids = bids.filter(bid => bid.groceryId === userId);
  // res.json(userBids);
  userid=req.user.id
  try {
    const userId = req.user.id; // Assuming you have access to the authenticated user's ID

    // Find all groceries
    const allGroceries = await Grocery.find({}).lean();

    // Initialize an empty array to store matching bids
    let matchedBids = [];

    // Loop through each grocery
    allGroceries.forEach(grocery => {
      // Check if grocery.bids exists and is an array
      if (grocery.bids && Array.isArray(grocery.bids)) {
        // Loop through each bid in the grocery
        grocery.bids.forEach(bid => {
          console.log("buyerid",String(bid.buyerId))
          // Check if the buyerId of the bid matches the userId
          if (String(bid.buyerId) === userId) {
            console.log("inside matchingg bods")
            matchedBids.push(bid);
          }
        });
      }
    });

    if (matchedBids.length === 0) {
      return res.status(404).json({ message: 'No matching bids found for the user' });
    }

    // Now matchedBids contains only the bids matching the authenticated user's ID
    res.status(200).json({ matchedBids });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  const {
    itemName,
    quantity,
    expirationDate,
    location,
  
    minPrice,
    sellerContact, // Assuming this is provided in the request body
    bids // Assuming bids are provided in the request body as an array
  } = req.body;

  try {
    let grocery;

    // Check if the request contains a groceryId to determine if it's an update or create operation
    if (req.body.groceryId) {
      // Update existing grocery
      grocery = await Grocery.findById(req.body.groceryId);

      if (!grocery) {
        return res.status(404).json({ message: 'Grocery not found' });
      }
      console.log(req.user.id)
      // Update fields with new values
      grocery.itemName = itemName;
      grocery.userId=req.user.id
      grocery.quantity = quantity;
      grocery.expirationDate = expirationDate;
      grocery.location = location;
      grocery.minPrice = minPrice;
      grocery.sellerContact = sellerContact;
      grocery.bids = bids; // Update bids with new values
    } else {
      // Create new grocery
      console.log(req.user.id)
      grocery = new Grocery({
        

        itemName,
        quantity,
        expirationDate,
        location,
        userId: req.user.id,
        minPrice,
        sellerContact,
        status: 'available', // Assuming this is the default status for new groceries
        bids // Include bids in the new grocery
      });
    }

    // Save the updated or new grocery
    await grocery.save();

    // Respond with success message
    res.status(200).json({ message: 'Grocery saved successfully', grocery });
  } catch (err) {
    // Handle errors
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

//Place a bid on a grocery listing
// Place a bid on a grocery listing
router.post('/:id/bids', authenticate, async (req, res) => {
  const { amount ,quantity} = req.body; // Changed from price to amount
  const groceryId = req.params.id;
  const buyerId = req.user.id;
  console.log('buyer iddd', buyerId)
  
  try {
    const grocery = await Grocery.findById(groceryId);
    if (!grocery) {
      return res.status(404).json({ message: 'Grocery not found' });
    }

    // Check if grocery.seller exists before calling the equals method
    if (grocery.sellerContact && grocery.userId==(buyerId)) {
      return res.status(400).json({ message: 'You cannot bid on your own grocery listing' });
    }
    console.log(quantity)
    if (amount < grocery.minPrice) {
      return res.status(400).json({ message: 'Bid price cannot be lower than minimum price' });
    }
    if (quantity > grocery.quantity) {
      return res.status(400).json({ message: 'Bid quantity exceeds available quantity' });
    }
    grocery.bids.push({ buyerId, amount,quantity }); // Changed from price to amount
    await grocery.save();
    res.status(201).json({ message: 'Bid placed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Accept a bid on a grocery listing
router.post('/:id/accept-bid', authenticate, async (req, res) => {
  const groceryId = req.params.id;
  const bidId = req.body.bidId;
  const sellerId = req.user.id;

  try {
    const grocery = await Grocery.findById(groceryId);
    if (!grocery) {
      return res.status(404).json({ message: 'Grocery not found' });
    }
    console.log(grocery)
    console.log(sellerId)
    if (!grocery.sellerContact==(sellerId)) {
      return res.status(403).json({ message: 'You are not authorized to accept bids on this grocery listing' });
    }
    

    const bid = grocery.bids.find(b => b._id.equals(bidId));
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }
    if(bid.status == 'accepted')
    {
      return res.status(404).json({message:'Bid already accepted '})
    }
    if(bid.quantity>grocery.quantity)
    {
      return res.status(404).json({ message: 'Bids Quantity exceeds the available Quantity' });

    }
    grocery.quantity-=bid.quantity
    grocery.acceptedBid = bidId;
    bid.status = 'accepted';
    await grocery.save();
    res.json({ message: 'Bid accepted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id/bids',authenticate ,async (req, res) => {
  const groceryId = req.params.id;
  console.log('grocery id',groceryId)

  try {
    // Find grocery by ID and include only the bids field
    const grocery = await Grocery.findById(groceryId, 'bids');

    // If no grocery found, return 404 Not Found
    if (!grocery) {
      return res.status(404).json({ message: 'Grocery not found' });
    }

    // Otherwise, return the grocery with bids
    res.json(grocery);
  } catch (error) {
    console.error('Error fetching grocery:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Other routes for updating and deleting groceries can be added similarly

module.exports = router;
