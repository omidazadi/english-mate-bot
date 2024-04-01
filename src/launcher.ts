import dotenv from 'dotenv';
dotenv.config();
import { validateSync } from 'class-validator';
import { Bot } from './bot';
import { Config } from './configs/config';

async function bootstrap(): Promise<void> {
    const config = new Config();
    let validationError = validateSync(config);
    if (validationError.length > 0) {
        console.log(validationError[0].toString());
        return;
    }

    let bot = new Bot();
    await bot.configure(config);
    await bot.start();
}

bootstrap();

/*
import { FSRS, Card, Rating, State } from 'fsrs.js';

let fsrs = new FSRS();
let card = new Card();
let rating = Rating;
let state = State;

//Set algorithm parameters
// fsrs.p.request_retention=0.9
// fsrs.p.maximum_interval=36500
// fsrs.p.w=[0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61]

console.log(card);
*/
