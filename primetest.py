# from http://ideone.com/Qf9ZNG

from random import randint
from fractions import gcd

def isqrt(n):
    x = n
    while 1:
        y = (n//x + x) // 2
        if x <= y: return x
        x = y

def primes(n):
    ps, sieve = [], [True] * (n+1)
    for p in range(2, n):
        if sieve[p]:
            ps.append(p)
            for i in range(p*p, n, p):
                sieve[i] = False
    return ps

def jacobi(a, p):
    a, t = a%p, 1
    while a != 0:
        while a%2 == 0:
            a = a/2
            if p%8 in (3, 5):
                t = -t
        a, p = p, a
        if a%4 == 3 and p%4 == 3:
            t = -t
        a = a%p
    if p == 1: return t
    else: return 0

def isStrongPseudoprime(n, a):
    d, s = n-1, 0
    while d%2 == 0:
        d, s = d/2, s+1
    t = pow(a, d, n)
    if t == 1:
        return True
    while s > 0:
        if t == n-1:
            return True
        t, s = (t*t) % n, s-1
    return False

def isMillerRabinPrime(n, limit=10):
    for i in range(limit):
        a = randint(2, n-1)
        if not isStrongPseudoprime(n, a):
            return False
    return True

def chain(n, u, v, u2, v2, d, q, m):
    k = q
    while m > 0:
        u2 = (u2*v2) % n
        v2 = (v2*v2 - 2*q) % n
        q = (q*q) % n
        if m%2 == 1:
            t1, t2 = u2*v, u*v2
            t3,t4 = v2*v, u2*u*d
            u, v = t1+t2, t3+t4
            if u%2 == 1: u = u+n
            if v%2 == 1: v = v+n
            u, v = (u/2)%n, (v/2)%n
            k = (q*k) % n
        m = m // 2
    return u, v, k

def selfridge(n):
    d, s = 5, 1; ds = d * s
    while 1:
        if gcd(ds, n) > 1: return ds, 0, 0
        if jacobi(ds, n) == -1: return ds, 1, (1-ds) / 4
        d, s = d+2, s*-1; ds = d * s

def isStandardLucasPseudoprime(n):
    d, p, q = selfridge(n)
    if p == 0: return n == d
    u, v, k = chain(n, 0, 2, 1, p, d, q, (n+1)/2)
    return u == 0

def isStrongLucasPseudoprime(n):
    d, p, q = selfridge(n)
    if p == 0: return n == d
    s, t = 0, n+1
    while t%2 == 0:
        s, t = s+1, t/2
    u, v, k = chain(n, 1, p, 1, p, d, q, t//2)
    if u == 0 or v == 0: return True
    r = 1
    while r < s:
        v = (v*v - 2*k) % n
        k = (k*k) % n
        if v == 0: return True
    return False

def isBaillieWagstaffPrime(n, limit = 100):
    def isSquare(n):
        s = isqrt(n)
        return s*s == n
    if n<2 or isSquare(n): return False
    for p in primes(limit):
        if n % p == 0:
            return n == p
    return isStrongPseudoprime(n, 2) \
       and isStrongPseudoprime(n, 3) \
       and isStrongLucasPseudoprime(n) # or standard

def nextPrime(n):
    if n < 2: return 2
    if n < 5: return [3,5,5][n-2]
    gap = [1,6,5,4,3,2,1,4,3,2,1,2,1,4,3,
           2,1,2,1,4,3,2,1,6,5,4,3,2,1,2]
    n = n+1 if n%2 == 0 else n+2
    while not isBaillieWagstaffPrime(n): # or MillerRabin
        n += gap[n%30]
    return n

def prevPrime(n):
    if n < 3: return 0 # or otherwise signal error
    if n < 8: return [2,3,3,5,5][n-3]
    gap = [1,2,1,2,3,4,5,6,1,2,3,4,1,2,1,
           2,3,4,1,2,1,2,3,4,1,2,3,4,5,6]
    n = n-1 if n%2 == 0 else n-2
    while not isBaillieWagstaffPrime(n): # or MillerRabin
        n -= gap[n%30]
    return n