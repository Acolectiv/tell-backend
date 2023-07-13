function removeElementById(arr: Array<string>, id: string) {
    return arr.slice().filter(obj => obj != id);
};

export default removeElementById;