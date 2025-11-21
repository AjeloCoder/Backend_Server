class TicketRepository {
    constructor(dao) {
        this.dao = dao;
    }

    async createTicket(ticketData) {
        return await this.dao.save(ticketData);
    }
}

module.exports = TicketRepository;