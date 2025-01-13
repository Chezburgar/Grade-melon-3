import { getVercelOidcToken } from '@vercel/functions/oidc';
 
export const GET = async () => {
const token=await getVercelOidcToken()


  return Response.json({token:token});
};