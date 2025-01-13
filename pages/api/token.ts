import { getVercelOidcToken } from '@vercel/functions/oidc';
 
export default async function(req,res){
  const result = await fetch('http://173.66.59.204:1000/', {
    method:'POST',
    headers: {
      Authorization: `Bearer ${await getVercelOidcToken()}`,
    },

  });
  const jsonResult=await result.json()
 
  res.json(jsonResult)
};