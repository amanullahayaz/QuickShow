
import { Inngest } from "inngest";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js"
import stripe from 'stripe'
// function to check availability of the selected seats for the movie

const checkAvailability=async(showId,selectedSeats)=>{
    try{
      const showData=  await Show.findById(showId);
      if(!showData)return false;

      const occupiedSeats=showData.occupiedSeats;
    
      const isAnySeatTaken=selectedSeats.some(seat=>occupiedSeats[seat]);

      return !isAnySeatTaken;

    }catch(error){
        console.log(error.message);
        return false;
    }
}


export const createBooking = async (req, res) => {
  try {

    const auth = req.auth();
    const userId = auth?.userId;
    const {origin}=req.headers;

    if (!userId) {
      return res.json({
        success: false,
        message: "Unauthorized"
      });
    }

    const { showId, selectedSeats } = req.body;

    if (!showId || !selectedSeats?.length) {
      return res.json({
        success: false,
        message: "Invalid booking data"
      });
    }

    const isAvailable = await checkAvailability(showId, selectedSeats);

    if (!isAvailable) {
      return res.json({
        success: false,
        message: "Selected seats are not available"
      });
    }

    const showData = await Show.findById(showId).populate("movie");

    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount: showData.showPrice * selectedSeats.length,
      bookedSeats: selectedSeats,
    });

    selectedSeats.forEach((seat) => {
      showData.occupiedSeats[seat] = userId;
    });

    showData.markModified("occupiedSeats");
    await showData.save();

    //Stripe Gateway Initialize

    const stripeInstance=new stripe(process.env.STRIPE_SECRET_KEY)

    //Creating line items to for stripe 

    const line_items=[{
        price_data:{
           currency : 'usd',
           product_data : {
            name : showData.movie.title
           },
           unit_amount : Math.floor(booking.amount)*100 
        },
        quantity:1
    }]

    const session = await stripeInstance.checkout.sessions.create({
       success_url:`${origin}/loading/my-bookings`,
       cancel_url:`${origin}/my-bookings`,
       line_items:line_items,
       mode:'payment',
       metadata:{
        bookingId:booking._id.toString()
       },

       expires_at : Math.floor(Date.now()/1000) + 30*60, //Expires in 30 minutes
    })


    booking.paymentLink = session.url

    await booking.save()
 

    //Run inngest Schedular function to check payment status after 10 minutes

    await Inngest.send({
      name : 'app/checkpayment',
      data:{
        bookingId:booking._id.toString()
      }
    });

    res.json({
      success: true,
       url:session.url,
      });

  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};
   
  
// get occupied seats

export const getOccupiedSeats=async(req,res)=>{
    try{
            const {showId}=req.params;
            const showData=await Show.findById(showId);

            const occupiedSeats=Object.keys(showData.occupiedSeats);
            res.json({success : true, occupiedSeats});

    }catch(error){
        console.log(error.message);
        res.json({success : false, message : error.message});
    }
}


