const update_search = require('./search');

test('number of search results', () => {
    expect(update_search("get").length).toBeGreaterThanOrEqual(5);
    expect(update_search("ASAN").length).toBeGreaterThanOrEqual(1);
});
