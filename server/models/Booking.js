import mongoose from "mongoose";
import { timeStamp } from "node:console";

const bookingSchema=mongoose.Schema({
    user : {type : String, required : true, ref:'User'},
    show : {type : String, required : true, ref:'Show'},
    amount : {type : Number, required : true},
    bookedSeats : {type : Array, required : true},
    isPaid : {type : Boolean, default : false},
    paymentLink : {type : String},
},{timeStamp:true});

const Booking = mongoose.model("Booking",bookingSchema);

export default Booking;