const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const Product = require("../models/product")
const Cart = require("../models/cart")
const User = require("../models/user")
const Orders = require("../models/orders")
const Otpverify = require("../models/otpverify")

//auth
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');

const app = express();

app.use(express.json())
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
//require



// user signup
async function handleusersignup(req, res) {
    try {
        const { firstName, lastName, email, password } = req.body;
        console.log(req.body);
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

        const newUser = await User.create({
            name: `${firstName} ${lastName}`,
            email,
            password: hashedPassword,
        });

        res.status(201).json({ message: 'User created', user: newUser });

    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
}

//login
async function handleUserLogin(req, res) {
    try {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({ message: 'User does not exist' });
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = jwt.sign(
            { userId: existingUser._id, email: existingUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );



        res.json({
            message: 'Login successful',
            token,
            user: {
                id: existingUser._id,
                email: existingUser.email,
                name: existingUser.name
            }

        });


    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
}

//logout
async function handleUserLogout(req, res) {
    // For header-based token, just inform the client
    return res.json({ message: 'Logout successful. Please remove token from client side.' });
}

//fetch user orders 
async function handlefetchorders(req, res) {
    const userId = req.params.userId;

    try {
        const orders = await Orders.find({ userId }).populate('items.productId');

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No orders found' });
        }

        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

//delete order
async function handleorderdelete(req, res) {
    try {
        console.log('Deleting Order ID:', req.params.id);  // 👈 Log incoming ID

        const deletedOrder = await Orders.findByIdAndDelete(req.params.id);

        if (!deletedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({ message: 'Order deleted successfully', deletedOrder });
    } catch (error) {
        console.error('Error deleting order:', error);  // 👈 Show real error
        res.status(500).json({ message: 'Error deleting order', error: error.message });
    }
}

//fetch user details 

async function handleUserfetch(req, res) {
    try {
        const userId = req.params.id; // ✅ Get ID from URL
        const updateuser = await User.findById(userId);

        if (!updateuser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(updateuser);
    } catch (err) {
        console.error('Fetch error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

//update user
async function handleuserupdate(req, res) {
    try {
        const userId = req.params.id;
        const { email, name } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { email, name },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(updatedUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

async function handlepasswordchange(req, res) {
    try {
        const { userId, oldPassword, newPassword } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Old password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

async function handleforgetpassword(req, res) {
    try {
        const { userId, newPassword } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Password set successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

const transporter = nodemailer.createTransport({
    service: 'gmail', // or use SMTP from a provider
    auth: {
        user: 'henilvirani7273@gmail.com',        // replace with your Gmail
        pass: 'vodt rwfv ojsy pqnk',           // ⚠️ use an App Password, not your real password
    },
});

async function handleotpsend(req, res) {
    try {
        const { userId, otp } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const user = await User.findById(userId);
        if (!user || !user.email) {
            return res.status(404).json({ message: 'User or email not found' });
        }

        // Delete any previous OTPs
        await Otpverify.deleteMany({ userId });

        // Save new OTP to DB
        await Otpverify.create({
            userId,
            otp
        });

        // Send email
        const mailOptions = {
            from: 'henilvirani2024@gmail.com',
            to: user.email,
            subject: 'Your OTP Code',
            text: `Hello ${user.name},\n\nYour OTP code is: ${otp}\n\nIt is valid for 5 minutes.\n\nThanks.`,
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: 'OTP created and sent to email' });

    } catch (err) {
        console.error('OTP Email error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}



//handle search
async function handlesearch(req, res) {
    const { search } = req.query;

    if (!search || typeof search !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid search term' });
    }

    const keywords = search.trim().split(/\s+/); // split by any space
    const fieldsToSearch = ['name', 'description', 'category', 'brand'];

    // Only match those fields explicitly
    const searchQuery = {
        $or: keywords.flatMap(word =>
            fieldsToSearch.map(field => ({
                [field]: { $regex: word, $options: 'i' }  // case-insensitive partial match
            }))
        )
    };

    try {
        const results = await Product.find(searchQuery).exec(); // ✅ No _id matching
        res.json({ product: results });
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}







//get all products
async function handlegetallproducts(req, res) {
    try {
        const product = await Product.find({});
        res.json({ message: 'all products', product })
    } catch (error) {
        res.send(error);
    }
}

//get product by id
async function handlegetproductbyid(req, res) {
    try {
        const productsbyid = await Product.findById(req.params.id);
        res.json(`access details of id : ${req.params.id}`, productsbyid);
    } catch (error) {
        res.send(error);
    }
}

//access by id and update
async function handleupdateproduct(req, res) {
    try {
        const productbyid = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json('updated :', productbyid);
    } catch (error) {
        res.send(error);
    }
}

//add new product
async function handleaddproduct(req, res) {
    try {
        const { name, brand, category } = req.body;

        // Check if a product already exists with same name, brand, and category
        const existingProduct = await Product.findOne({ name, brand, category });

        if (existingProduct) {
            return res.status(409).json({ message: 'Product already exists' });
        }

        const product = await Product.create(req.body);
        res.status(201).json({ message: 'Product created', product });

    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
}

//delete product
async function handledeleteproduct(req, res) {
    try {
        const categories = await Product.distinct('category');
        res.json(categories);
    } catch (error) {
        res.status(400).send("Categories not found");
    }
}

//get category vise product
async function handlegetcategory(req, res) {
    try {
        const productsInCategory = await Product.find({ category: req.params.category });
        res.json({ message: `category : ${req.params.category}`, productsInCategory });
    } catch (error) {
        res.send(error);
    }
}

//handle get brand vise
async function handlegetbrand(req, res) {
    try {
        const productsofbrand = await Product.find({ brand: req.params.brand });
        res.json({ message: `brand : ${req.params.brand}`, productsofbrand });
    } catch (error) {
        res.send(error);
    }
}


//handle search
async function handlesearch(req, res) {
    const { search } = req.query;

    if (!search || typeof search !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid search term' });
    }

    const keywords = search.trim().split(/\s+/); // split by any space
    const fieldsToSearch = ['name', 'description', 'category', 'brand'];

    // Only match those fields explicitly
    const searchQuery = {
        $or: keywords.flatMap(word =>
            fieldsToSearch.map(field => ({
                [field]: { $regex: word, $options: 'i' }  // case-insensitive partial match
            }))
        )
    };

    try {
        const results = await Product.find(searchQuery).exec(); // ✅ No _id matching
        res.json({ product: results });
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}









//handle get user's cart
async function handlegetusercart(req, res) {
    const userId = req.query.userId;

    try {
        const cart = await Cart.findOne({ userId }).populate('items.productId');

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        res.status(200).json(cart);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

//handle add to cart
async function handleaddtocart(req, res) {

    const { userId, productId, quantity, size, color, price } = req.body;

    try {
        let cart = await Cart.findOne({ userId });
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const qty = parseInt(quantity);

        if (!cart) {
            // Create new cart
            cart = new Cart({
                userId,
                items: [{ productId, quantity: qty, size, color, price }],
                bill: product.price * qty,
                updatedAt: Date.now()
            });
        } else {
            // Cart exists
            const existingItem = cart.items.find(
                item =>
                    item.productId.toString() === productId &&
                    item.size === size &&
                    item.color === color
            );
            if (existingItem) {
                // for prevent user use alert from react
                existingItem.quantity += qty;
            } else {
                cart.items.push({ productId, quantity: qty, size, color, price });
            }

            // ✅ Recalculate bill for all items
            let total = 0;
            for (const item of cart.items) {
                const prod = await Product.findById(item.productId);
                if (prod) {
                    total += prod.price * item.quantity;
                }
            }
            cart.bill = total;
            cart.updatedAt = Date.now();
        }

        await cart.save();
        console.log(cart);
        res.status(200).json(cart);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" });
    }
}

//handle edit cart(quantity)
async function handleeditcart(req, res) {
    try {
        const { userId, productId, quantity } = req.params;

        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const item = cart.items.find(item => item.productId.toString() === productId);

        if (!item) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        // ✅ Update quantity
        item.quantity = parseInt(quantity);



        // ✅ Recalculate bill
        let total = 0;
        for (const item of cart.items) {
            const prod = await Product.findById(item.productId);
            console.log(prod);
            if (prod) {
                total += prod.price * item.quantity;
            }
        }

        cart.bill = total;
        cart.updatedAt = Date.now();

        // ✅ Save once after all changes
        await cart.save();

        res.status(200).json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
}

async function handleincreaseqty(req, res) {
    const { userId, productId } = req.params;
    const { quantity } = req.body;

    try {
        // Get the user's cart
        const cart = await Cart.findOne({ userId });

        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        // Find the item in cart
        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        if (itemIndex === -1) return res.status(404).json({ message: 'Product not found in cart' });

        // Update the quantity
        cart.items[itemIndex].quantity = quantity;

        cart.bill = cart.items
            .map(item => item.price * item.quantity)
            .reduce((acc, val) => acc + val, 0);

        // Save updated cart
        await cart.save();

        res.json(cart);
    } catch (error) {
        console.error('Error updating quantity:', error);
        res.status(500).json({ message: 'Server error' });
    }
}


//handle delete from cart
async function handledeletecart(req, res) {
    try {
        const { userId, productId } = req.params;

        // Find user's cart
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Find the index of the product in the cart
        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        // Remove the item from the cart
        cart.items.splice(itemIndex, 1);

        // ✅ Recalculate bill
        cart.bill = cart.items.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0
        );

        cart.updatedAt = Date.now();


        await cart.save();

        // ✅ Return updated cart with bill
        res.status(200).json(cart);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
}


//handleclearcart 
async function handleclearcart(req, res) {
    const { userId } = req.query;
    try {
        await Cart.findOneAndDelete({ userId });
        res.status(200).json({ message: 'Cart cleared successfully' });
    } catch (err) {
        console.error('Error clearing cart:', err);
        res.status(500).json({ error: 'Failed to clear cart' });
    }
}


// Checkout
async function handlecheckout(req, res) {

    const { userId, items, bill, address } = req.body;

    // Optional: check if an identical order exists in last X minutes
    const existingOrder = await Orders.findOne({
        userId,
        'address.fullAddress': address.fullAddress,
        bill,
        createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // last 5 mins
    });

    if (existingOrder) {
        return res.status(409).json({ message: 'Duplicate order detected', order: existingOrder });
    }

    const newOrder = new Orders({
        userId,
        items,
        bill,
        address,
        updatedAt: Date.now()
    });

    await newOrder.save();

    res.json(Orders);
    res.status(201).json({ message: 'Order created', order: newOrder });
}

module.exports = {
    handleusersignup,
    handleUserLogin,
    handleUserLogout,
    handleUserfetch,
    handleuserupdate,
    handlepasswordchange,
    handleforgetpassword,
    handlegetallproducts,
    handlegetproductbyid,
    handleupdateproduct,
    handleaddproduct,
    handledeleteproduct,
    handlesearch,
    handlegetcategory,
    handlegetbrand,
    handlegetusercart,
    handleaddtocart,
    handleeditcart,
    handledeletecart,
    handleclearcart,
    handlecheckout,
    handlefetchorders,
    handleorderdelete,
    handleotpsend,
    handleincreaseqty
}