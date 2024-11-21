const pool = require('../models/Schedule');
const { fetchSoldiers } = require('../models/Soldiers');

module.exports.scheduleTable = async function (req, res) { 
    const sql = "SELECT * FROM schedule";
    try {
        const data = await pool.query(sql); // Використання pool замість conn
        const formattedRows = data.rows.map(row => ({ 
            ...row,
            date: row.date.toISOString().split('T')[0] // Форматування дати
        }));

        res.render('schedule', { title: 'Duty Schedule', soldiers: formattedRows });
    } catch (err) {
        console.error('Error fetching schedule:', err);
        res.status(500).send('Internal Server Error');
    }
};

module.exports.scheduleOne = async function (req, res) {
    const name = req.query.name;
    const sql = "SELECT * FROM schedule WHERE soldier_name ILIKE $1";
    try {
        const data = await pool.query(sql, [`%${name}%`]); // Використання pool замість conn

        if (data.rows.length === 0) {
            return res.status(404).send('Військового з таким іменем не знайдено');
        }

        const formattedRows = data.rows.map(row => ({ 
            ...row,
            date: row.date.toISOString().split('T')[0] // Форматування дати
        }));

        res.render('scheduleForOne', { title: 'Duty Schedule', soldiers: formattedRows });
    } catch (err) {
        console.error('Error fetching schedule for one soldier:', err);
        res.status(500).send('Internal Server Error');
    }
};

module.exports.generateSchedule = async function (req, res) {
    const client = await pool.connect(); // Беремо клієнта з пулу
    try {
        const currentDate = new Date();
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();

        const weekendDays = getWeekendDays(year, month);
        const daysInMonth = getDaysInMonth(year, month);
        const duties = [];

        // Завантаження солдатів з бази
        const soldiers = await fetchSoldiers();

        // Починаємо транзакцію
        await client.query("BEGIN");

        // Очищення попередніх даних з таблиці schedule
        await client.query("DELETE FROM schedule");

        for (let i = 2; i <= daysInMonth + 1; i++) {
            const rawDate = new Date(year, month, i);
            const date = `${rawDate.getFullYear()}-${(rawDate.getMonth() + 1)
                .toString()
                .padStart(2, '0')}-${rawDate.getDate().toString().padStart(2, '0')}`;

            const isWeekend = weekendDays.includes(date);

            // Список доступних солдатів для чергувань
            const availableSoldiers = soldiers.filter((soldier) => {
                return (
                    soldier.gender !== 'female' && // Виключити жінок
                    !soldier.holidays.includes(date) &&
                    !soldier.sickLeaves.includes(date) &&
                    (!soldier.lastDuty || soldier.lastDuty.date !== date) && // Уникнути повторення в той самий день
                    (!soldier.lastDuty || soldier.lastDuty.date !== `${year}-${(month + 1).toString().padStart(2, '0')}-${(i - 1).toString().padStart(2, '0')}`) // Не чергувати два дні поспіль
                );
            });

            // Перемішуємо список доступних солдатів для рівномірного розподілу
            shuffleArray(availableSoldiers);

            // Призначаємо чергування у частині
            const unitDutySoldierIndex = availableSoldiers.findIndex((soldier) => soldier.unitDuties < 5);
            if (unitDutySoldierIndex !== -1) {
                const unitDutySoldier = availableSoldiers[unitDutySoldierIndex];
                duties.push({ date, soldier: unitDutySoldier.name, type: 'У частині' });
                unitDutySoldier.unitDuties++;
                unitDutySoldier.lastDuty = { date, type: 'У частині' };
                availableSoldiers.splice(unitDutySoldierIndex, 1); // Видаляємо солдата з доступних
            }

            // Призначаємо чергування поза частиною
            const outsideDutySoldier = availableSoldiers.find((soldier) => {
                const week = Math.ceil(i / 7);
                return soldier.outsideDuties < 5 && (!isWeekend || !soldier.weekendWeeks.includes(week));
            });

            if (outsideDutySoldier) {
                duties.push({ date, soldier: outsideDutySoldier.name, type: 'Поза частиною' });
                outsideDutySoldier.outsideDuties++;
                outsideDutySoldier.lastDuty = { date, type: 'Поза частиною' };
                if (isWeekend) {
                    outsideDutySoldier.weekendWeeks.push(Math.ceil(i / 7));
                }
            }
        }

        // Пакетне вставлення даних в таблицю
        const insertQuery = `
            INSERT INTO schedule (date, soldier_name, type) VALUES ($1, $2, $3)
        `;
        for (const duty of duties) {
            const dateOnly = duty.date.split('T')[0]; // Якщо `duty.date` має формат ISO
            await client.query(insertQuery, [dateOnly, duty.soldier, duty.type]);
        }

        // Коміт транзакції
        await client.query("COMMIT");

        res.status(201).send('Duty schedule generated and saved to database.');
    } catch (err) {
        await client.query("ROLLBACK"); // Відкат у разі помилки
        console.error("Error generating schedule:", err);
        res.status(500).send('Internal Server Error');
    } finally {
        client.release(); // Завжди звільняємо клієнта
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

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

