function removeArrayElementById(arr: Array<any>, id: String) {
    return arr.slice().filter(obj => obj._id !== id);
};

export default removeArrayElementById;