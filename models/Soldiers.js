const pool = require('../models/Schedule');

async function fetchSoldiers() {
    console.log('Connected to the database');
    try {
        const result = await pool.query('SELECT * FROM soldiers');
        return result.rows.map(soldier => ({
            ...soldier,
            holidays: soldier.holidays || [], // Ініціалізація
            sickLeaves: soldier.sick_leaves || [],
            unitDuties: 0,
            outsideDuties: 0,
            lastDuty: null,
            weekendWeeks: []
        }));
    } catch (err) {
        console.error('Error fetching soldiers:', err);
        throw err;
    }
}

module.exports = {
    fetchSoldiers,
};
