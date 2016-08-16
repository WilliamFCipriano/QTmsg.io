function getDiffie(pubN,pubG,serverPubKey) {
    var client_key = bigInt.randBetween(99999999999999999999,9999999999999999999999999999999999999999);
    var public_key = bigInt(pubG).modPow(client_key, pubN).toString();
    var crypto_key = bigInt(serverPubKey).modPow(client_key, pubN).toString();
    return [public_key, crypto_key]
}