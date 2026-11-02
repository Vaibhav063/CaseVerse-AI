import { Request,Response,NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
declare global { namespace Express { interface Request { userId?:string } } }
export function issueSession(res:Response,userId:string){ res.cookie('caseverse_session',jwt.sign({sub:userId},env.SESSION_SECRET,{expiresIn:'7d'}),{httpOnly:true,secure:env.NODE_ENV==='production',sameSite:'lax',maxAge:7*24*60*60*1000}); }
export function requireAuth(req:Request,res:Response,next:NextFunction){ const token=req.cookies?.caseverse_session; if(!token){res.status(401).json({success:false,error:{code:'UNAUTHORIZED',message:'Please sign in to continue.'}});return;} try{const decoded=jwt.verify(token,env.SESSION_SECRET) as jwt.JwtPayload;req.userId=String(decoded.sub);next();}catch{res.clearCookie('caseverse_session');res.status(401).json({success:false,error:{code:'UNAUTHORIZED',message:'Your session has expired.'}});} }
