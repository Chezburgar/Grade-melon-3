import { getVercelOidcToken } from '@vercel/functions/oidc';
 
export const GET = async () => {
  const result = await fetch('http://173.66.59.204:1000/', {
    method:'POST',
    headers: {
      Authorization: `Bearer ${await getVercelOidcToken()}`,
    },

  });
  const jsonResult=await result.json()
 
  return jsonResult
};