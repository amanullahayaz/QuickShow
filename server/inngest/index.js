import { Inngest } from "inngest";
import mongoose from "mongoose";

// Force register all models
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import Movie from "../models/Movie.js";
import sendEmail from "../configs/nodemailer.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

//Inngest fn to save user data to a database
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data
    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: first_name + ' ' + last_name,
      image: image_url
    }
    await User.create(userData)
  },
);
//Inngest fn to delete user from database
const syncUserDeletion = inngest.createFunction(
  { id: 'delete-user-wih-clerk' },
  { event: 'clerk/user.deleted' },
  async ({ event }) => {
    const { id } = event.data
    await User.findByIdAndDelete(id);
  }
);

//Inngest fn to update user data in database
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data
    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: first_name + ' ' + last_name,
      image: image_url
    }
    await User.findByIdAndUpdate(id, userData);
  },
);


// Inngest function to cancel booing and 
// release seats of show after 10 minutes 
// of booking created if payment is not made

const releaseSeatsAndDeleteBooking = inngest.createFunction(
  { id: 'release-seats-delete-booking' },
  { event: 'app/checkpayment' },
  async ({ event, step }) => {
    const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
    await step.sleepUntil('wait-for-10-minutes', tenMinutesLater)
    await step.run('check-payment-status', async () => {
      const bookingId = event.data.bookingId;
      const bookingData = await Booking.findById(bookingId);

      // if payment is not made, release seats and delete booking
      if (bookingData && !bookingData.isPaid) {
        const showData = await Show.findById(bookingData.show);
        if (showData) {
          bookingData.bookedSeats.forEach((seat) => {
            delete showData.occupiedSeats[seat];
          });

          showData.markModified('occupiedSeats');
          await showData.save();
        }

        await Booking.findByIdAndDelete(bookingData._id);
      }
    })
  }
)


// Inngest function to send emails when user books a show 


const sendBookingConfirmationEmail = inngest.createFunction(
  { id: 'send-booking-consfirmation-email' },
  { event: "app/show.booked" },

  async ({ event, step }) => {


    const { bookingId } = event.data;

    const bookingData = await Booking.findById(bookingId)
      .populate({
        path: 'show',
        populate: { path: 'movie', model: 'movie' }
      })
      .populate('user');

    if (!bookingData) return;

    await sendEmail({
      to: bookingData.user.email,
      subject: `Payment Confirmation: "${bookingData.show.movie.title}" booked!`,
      body: `<div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Hi ${bookingData.user.name},</h2>
        <p>Your booking for <strong style="color: #F84565;">
          ${bookingData.show.movie.title}
        </strong> is confirmed.</p>

        <p>
          <strong>Date:</strong> ${new Date(bookingData.show.showDateTime).toLocaleDateString('en-US', {
        timeZone: 'Asia/Kolkata'
      })}<br/>

          <strong>Time:</strong> ${new Date(bookingData.show.showDateTime).toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata'
      })}
        </p>

        <p>Enjoy the show! 🍿</p>
        <p>Thanks for booking with us!<br/>— QuickShow Team</p>
      </div>`
    });
  }
);


// Create an empty array where we'll export future Inngest functions
export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation, releaseSeatsAndDeleteBooking, sendBookingConfirmationEmail];







