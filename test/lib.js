const objectEqual = (a, b) => {
    if(a == b) return true;
    if(Array.isArray(a) && Array.isArray(b)) {
        return a.length == b.length && a.every((e, i) => objectEqual(e, b[i]));
    }
    if(a == null || b == null) return a == b;
    if(typeof a == "object" && typeof b == "object") {
        return Object.entries(a).every(([k, v]) => objectEqual(v, b[k])) && Object.keys(b).every(k => k in a);
    }
    return a == b;
};

module.exports.objectEqual = objectEqual;