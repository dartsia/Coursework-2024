const conn = require('../models/Schedule')
const soldiers = require('../models/Soldiers')

module.exports.scheduleTable = function(req, res) {
    const sql = "SELECT * FROM schedule";
    conn.query(sql, function(err, data) {
        if (err) {
            console.error('Error fetching schedule:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.json(data); // Відправка даних у вигляді JSON
    });
};



module.exports.generateSchedule = async function (req, res) {
    try {
        const currentDate = new Date();
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();

        const weekendDays = getWeekendDays(year, month);
        const daysInMonth = getDaysInMonth(year, month);
        const duties = [];

        // Очищення попередніх даних з таблиці schedule
        await conn.query("DELETE FROM schedule");

        // Скидаємо дані по обов'язках
        soldiers.forEach((soldier) => {
            soldier.unitDuties = 0;
            soldier.outsideDuties = 0;
            soldier.lastDuty = null; // Останнє чергування
            soldier.weekendWeeks = []; // Тижні чергувань у вихідні
        });

        for (let i = 1; i <= daysInMonth; i++) {
            const date = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
            const isWeekend = weekendDays.includes(date);

            soldiers.forEach((soldier) => {
                if (
                    soldier.gender === 'female' || // Не включати жінок
                    soldier.holidays.includes(date) || 
                    soldier.sickLeaves.includes(date) ||
                    (soldier.lastDuty && soldier.lastDuty.date === date - 1) || // Два дні поспіль
                    (soldier.lastDuty && soldier.lastDuty.type === 'outside' && soldier.lastDuty.date === date - 1) // Після чергування за межами
                ) {
                    return;
                }

                if (isWeekend) {
                    const week = Math.ceil(i / 7);
                    if (soldier.weekendWeeks.includes(week)) {
                        return; // Не можна два тижні поспіль у вихідні
                    }
                }

                // Призначаємо чергування
                if (!isWeekend && soldier.unitDuties < 5) {
                    duties.push({ date, soldier: soldier.name, type: 'unit' });
                    soldier.unitDuties++;
                    soldier.lastDuty = { date: i, type: 'unit' };
                } else if (isWeekend && soldier.outsideDuties < 5) {
                    duties.push({ date, soldier: soldier.name, type: 'outside' });
                    soldier.outsideDuties++;
                    soldier.lastDuty = { date: i, type: 'outside' };
                    soldier.weekendWeeks.push(Math.ceil(i / 7));
                }
            });
        }

        console.log("Generated duties:", duties);

        // Записуємо в базу
        const sql = "INSERT INTO schedule (date, soldier_name, type) VALUES ($1, $2, $3)";
        for (const duty of duties) {
            await conn.query(sql, [duty.date, duty.soldier, duty.type]);
        }

        res.status(201).send('Duty schedule generated and saved to database.');
    } catch (err) {
        console.error("Error generating schedule:", err);
        res.status(500).send('Internal Server Error');
    }
};



// Допоміжні функції
function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function getWeekendDays(year, month) {
    const weekendDays = [];
    for (let i = 1; i <= getDaysInMonth(year, month); i++) {
        const date = new Date(year, month, i);
        if (date.getDay() === 0 || date.getDay() === 6) {
            weekendDays.push(`${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`);
        }
    }
    return weekendDays;
}

