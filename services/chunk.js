module.exports = (data, chunkSize) => {
    if (!data || data.length === 0) return [];

    let dataChunks = [];
    chunkSize = chunkSize || 3;

    for (let i = 0; i < data.length; i += chunkSize) {
        dataChunks.push({
            id: dataChunks.length + 1,
            data: data.slice(i, i + chunkSize)
        });
    }
    return dataChunks;
}