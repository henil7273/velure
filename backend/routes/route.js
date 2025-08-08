const express = require("express");
const verify = require("../middleware/verifytoken")
const Order = require("../models/orders")

const { handlegetallproducts,
        handlegetproductbyid,
        handleupdateproduct,
        handleaddproduct,
        handledeleteproduct,
        handlegetcategory,
        handlegetbrand,
        handlesearch,
        handlegetusercart,
        handleaddtocart,
        handleeditcart,
        handledeletecart,
        handleusersignup,
        handleUserLogin,
        handleUserLogout,
        handleUserfetch,
        handleuserupdate,
        handlepasswordchange,
        handleforgetpassword,
        handlecheckout,
        handleclearcart,
        handlefetchorders,
        handleorderdelete,
        handleotpsend,
        handleincreaseqty
} = require('../controllers/ecom');

const router = express.Router();

//user routes

//signup
router.post('/signup', handleusersignup);

//login 
router.post('/login', handleUserLogin);

//logout
router.post('/logout', handleUserLogout);


//dashboard routes

//orders
router.get('/orders/:userId', handlefetchorders);

//cancel order
router.delete('/orders/:id', handleorderdelete);



//change password
router.put('/profile/reset-password', handlepasswordchange);
//forget password
router.post('/profile/set-password', handleforgetpassword);
//otp verification
router.post('/profile/otpverification', handleotpsend);



//user details 
router.get('/profile/:id', handleUserfetch)

//update user
router.put('/profile/:id', handleuserupdate);




//search
router.get('/products/search', handlesearch )




//get all products
router.get('/products', handlegetallproducts);

//get product by id
router.get('/products/:id', handlegetproductbyid);

//update product
router.put('/products/:id', handleupdateproduct);

//add product
router.post('/products', handleaddproduct);

//delete product
router.delete('/products/delete/:id', handledeleteproduct);

//get category
router.get('/products/categories/:category', handlegetcategory);

//fetch brand wise product
router.get('/products/brands/:brand', handlegetbrand);


//cart routes

//get user cart
router.get('/cart/', handlegetusercart);

//post product
router.post('/cart/add', handleaddtocart);

//increase quantity
router.put('/cart/:userId/product/:productId', handleincreaseqty);

//edit cart
router.patch('/cart/checkout/:userId/product/:productId/:quantity', handleeditcart);

//delete product
router.delete('/cart/:userId/product/:productId', handledeletecart);

//clear cart of user after complete order
router.delete('/cart/clear', handleclearcart );

//orders sending to db
router.post('/orders', handlecheckout );

module.exports = router;