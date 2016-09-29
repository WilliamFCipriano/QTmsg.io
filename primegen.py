import random
import time
import config
import primetest
from os import urandom
from threading import Thread

primes = list()

config = config.configurationData('prime')

def fermat(n):
    if n == 2:
        return True
    if not n & 1:
        return False
    return pow(2, n-1, n) == 1


def is_prime(a):
    return primetest.isBaillieWagstaffPrime(a)


def get_rand_prime():
    timestamp = int(time.time())
    found = False
    if config.lookup('randomness_source') == 'urandom':
        random_data = urandom(config.lookup('prime_bits'))
        x = int(random_data.encode('hex'), 16)
        config.debug('Starting prime search at ' + str(x),l=5)
    else:
        x = random.getrandbits(config.lookup('prime_bits'))
        x = int(x.encode('hex'), 16)
        config.debug('Starting prime search at ' + str(x),l=5)
    while not found:
        if int(time.time()) - timestamp > config.lookup('abort_search_seconds'):
            config.debug('Prime search timed out.',l=4)
            return False
        elif x == 2:
            return 2
        elif x % 2 == 0:
            x = x + 1
            pass
        elif fermat(x):
            if config.lookup('only_use_fermat'):
                config.debug('Fermat prime found, skipping full verification with "prime": ' + str(x),l=5)
                found = True
                primes.append(x)
            elif is_prime(x):
                config.debug('Prime found in ' + str(int(time.time()) - timestamp)  + ' second(s): ' + str(x),l=5)
                found = True
                primes.append(x)
        else:
            x = x + 1
    return x


def get_primes(prime_count,max_threads):
    config.debug('Start prime generation for DH',l=5)
    while len(primes) < prime_count:
        threads = [None] * max_threads
        config.debug('Creating ' + str(max_threads) + ' threads for prime generation.',l=5)
        for i in range(len(threads)):
            threads[i] = Thread(target=get_rand_prime)
            threads[i].start()
        for thread in threads:
            thread.join()
    config.debug(str(len(primes)) + ' primes found.')
    return primes

primes = get_primes(config.lookup('total_primes'),config.lookup('search_threads'))