// server/controllers/orderController.js

const Order = require('../models/Order');

// @desc    Get all orders for the logged-in bidder (My Winnings)
// @route   GET /api/orders/my-winnings
// @access  Private/Bidder
const getMyWinnings = async (req, res) => {
  try {
    const orders = await Order.find({ winner: req.user._id })
      .populate({
        path: 'auctionItem',
        select: 'title imageUrl artistName creator',
        populate: { path: 'creator', select: 'name' }
      })
      .sort({ createdAt: -1 });
      
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching "My Winnings":', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Submit shipping details for a won auction
// @route   PUT /api/orders/:id/submit-details
// @access  Private/Bidder
const submitShippingDetails = async (req, res) => {
  try {
    const { shippingDetails, printDimensions } = req.body;
    
    const order = await Order.findById(req.params.id);

    // Security check: Is this user the winner of this order?
    if (!order || order.winner.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Order not found or you are not the winner' });
    }

    // Update the order
    order.shippingDetails = shippingDetails;
    order.printDimensions = printDimensions;
    order.orderStatus = 'Pending Shipment'; // Update status
    
    const updatedOrder = await order.save();
    
    res.status(200).json(updatedOrder);

  } catch (error) {
    console.error('Error submitting shipping details:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all orders that need to be shipped
// @route   GET /api/orders/shipping-queue
// @access  Private/Admin or Private/Creator
const getShippingQueue = async (req, res) => {
  try {
    // Admins see all. Creators only see their own.
    const query = {
      orderStatus: 'Pending Shipment'
    };
    
    if (req.user.role === 'creator') {
      query.creator = req.user._id;
    } else if (req.user.role !== 'admin') {
      // Bidders shouldn't be here
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const orders = await Order.find(query)
      .populate('winner', 'name email')
      .populate('auctionItem', 'title imageUrl')
      .sort({ createdAt: 1 }); // Show oldest first
      
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching shipping queue:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


module.exports = {
  getMyWinnings,
  submitShippingDetails,
  getShippingQueue
};