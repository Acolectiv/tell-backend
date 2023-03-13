function elementExists(arr: Array<any>, id: string) {
    for(let i = 0; i < arr.length; i++) {
        if (arr[i]._id === id) {
            return true;
        }
    }
    return false;
}

export default elementExists;