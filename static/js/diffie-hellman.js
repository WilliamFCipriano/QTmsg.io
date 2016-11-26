function getDiffie(pubN,pubG,serverPubKey) {
    try {
    var client_key = bigInt.randBetween(99999999999999999999,9999999999999999999999999999999999999999);
    var public_key = bigInt(pubG).modPow(client_key, pubN).toString();
    var crypto_key = bigInt(serverPubKey).modPow(client_key, pubN).toString(); }
    catch(err) {
        console.log(err);
        return false;

    }
   
    // if the diffie-hellman key is too small, we return false and begin again.
    if (crypto_key.length < 5) {
        return false;
    }

    return [public_key, crypto_key]
}
