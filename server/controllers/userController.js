import Booking from "../models/Booking.js";
import { clerkClient } from '@clerk/express';
import Movie from "../models/Movie.js";



// API controller function to get user bookings

export const getUserBookings= async (req,res)=>{
        try{
            const user= req.auth().userId;
            const bookings= await Booking.find({user}).populate({
                path : "show",
                populate:{path : "movie"}
            }).sort({createdAt : -1});
            res.json({success : true , bookings});
        }catch(error){
            console.log(error.message);
            res.json({success  : false , message : error.message});
        }
}



//API controller function to update favorite movie in clerk user metadata

export const updateFavorite = async (req, res) => {
  try {
    const { movieId } = req.body;
    const userId = req.auth().userId;

    const user = await clerkClient.users.getUser(userId);

    // Always start with clean array
    let favorites = user.privateMetadata?.favorites || [];

    // Remove any null values first (important)
    favorites = favorites.filter(Boolean);

    const exists = favorites.includes(movieId);

    if (exists) {
      // Remove completely
      favorites = favorites.filter(id => id !== movieId);
    } else {
      favorites.push(movieId);
    }

    // Update ONLY favorites field properly
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        ...user.privateMetadata,
        favorites
      }
    });

    res.json({
      success: true,
      message: exists
        ? "Removed from favorites"
        : "Added to favorites"
    });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};


    // Api controller to get favorite movies 

    export const getFavorites= async (req,res)=>{
        try{
            const user = await clerkClient.users.getUser(req.auth().userId);
            const favorites = user.privateMetadata.favorites;

            // get movie from db 
            const movies = await Movie.find({_id : {$in : favorites}});

            res.json({success: true , movies});

        }catch(error){
            console.log(error.message);
            res.json({success : true, message : error.message});
        }
    }