import express from 'express';
import { getNowPlayingMovies } from '../controllers/showController.js  ';
import { addShow } from '../controllers/showController.js';

const showRouter=express.Router();

showRouter.get('/now-playing',getNowPlayingMovies);
showRouter.post('/add',addShow);
export default showRouter;

