const ticketModel = require('../models/ticket.model');

class TicketDao {
    async save(ticketData) {
        return await ticketModel.create(ticketData);
    }
}

module.exports = new TicketDao();