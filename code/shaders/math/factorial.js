

const factorial = `
// factorial
float fac(int n) {
    float res = 1.0;
    for (int i = n; i > 1; i--)
        res *= float(i);
    return res;
}

// double factorial
float dfac(int n) {
    float res = 1.0;
    for (int i = n; i > 1; i-=2)
        res *= float(i);
    return res;
}

// fac(l-m)/fac(l+m) but more stable
float fac2(int l, int m) {
    int am = abs(m);
    if (am > l)
        return 0.0;
    float res = 1.0;
    for (int i = max(l-am+1,2); i <= l+am; i++)
        res *= float(i);
    if (m < 0)
        return res;
    return 1.0 / res;
}`;

export default factorial;