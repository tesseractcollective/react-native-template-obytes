import jose from "node-jose";

export async function createJwks() {
  const keystore = jose.JWK.createKeyStore();
  await keystore.generate("RSA", 2048, {
    alg: "RS256",
    use: "sig",
  });
  // true includes public and private key parts
  return keystore.toJSON(true);
}
