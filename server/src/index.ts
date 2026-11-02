import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { env } from './config/env';
import { api } from './routes/api';

async function main(){
 await mongoose.connect(env.MONGODB_URI);
 const app=express();app.use(helmet());app.use(cors({origin:env.CLIENT_ORIGIN,credentials:true}));app.use(express.json({limit:'32kb'}));app.use(cookieParser());
 app.get('/health',(_req,res)=>res.json({status:'ok'}));
 app.use('/api/v1/auth',rateLimit({windowMs:15*60*1000,limit:30,standardHeaders:true,legacyHeaders:false}));
 app.use('/api/v1/cases',rateLimit({windowMs:60*60*1000,limit:30,standardHeaders:true,legacyHeaders:false}));app.use('/api/v1',api);
 app.use((err:any,_req:express.Request,res:express.Response,_next:express.NextFunction)=>{if(err instanceof mongoose.Error.ValidationError){res.status(422).json({success:false,error:{code:'VALIDATION_ERROR',message:'The request could not be processed.'}});return;}const status=err?.name==='ZodError'?400:500;res.status(status).json({success:false,error:{code:status===400?'VALIDATION_ERROR':'INTERNAL_ERROR',message:status===400?'Please check your input.':'Something went wrong. Please try again.'}});});
 app.listen(env.PORT,()=>console.log(`CaseVerse API listening on ${env.PORT}`));
}
main().catch(err=>{console.error('Server startup failed. Check MongoDB configuration and connectivity.',err instanceof Error?err.message:'');process.exit(1);});
