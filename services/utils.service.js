class UtilsService {

    constructor() {}

    async paginate(model, pageSize, pageLimit, where = {}, order = [], attributes = {}, include = []) {
        let options = {}
        const limit = parseInt(pageLimit, 10) || 10;
        const page = parseInt(pageSize, 10) || 1;
        
        if (pageLimit) {
            options = {
                offset: this.getOffset(page, limit),
                limit: limit,
            };
        }

        if (order && order.length) options['order'] = order;
        if (Object.keys(include).length) options['include'] = include;
        if (Object.keys(attributes).length) options['attributes'] = attributes;
        options['where']  = where;

        // take in the model, take in the options
        let {count, rows} = await model.findAndCountAll(options);        

        return {
            previousPage: this.getPreviousPage(page),
            currentPage: page,
            nextPage: this.getNextPage(page, limit, count),
            total: count,
            limit: limit,
            data: rows
        }
    }

    getOffset(page, limit) {
        return (page * limit) - limit;
    }

    getNextPage(page, limit, total) {
        if ((total/limit) > page) return page + 1;
        return null
    }

    getPreviousPage(page) {
        if (page <= 1) return null
        return page - 1;
    }
}

module.exports = UtilsService;
