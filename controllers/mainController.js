const conn = require('../models/Schedule')
const {soldiers} = require('../models/Soldiers')

module.exports.scheduleTable = function (req, res) { 
    const sql = "SELECT * FROM schedule";
    conn.query(sql, function (err, data) {
        if (err) {
            console.error('Error fetching schedule:', err);
            return res.status(500).send('Internal Server Error');
        }

        const formattedRows = data.rows.map(row => ({ 
            ...row,
            date: row.date.toISOString().split('T')[0] // Форматування дати
        }));
        
        res.render('schedule', { title: 'Duty Schedule', soldiers: formattedRows });
        // res.json(formattedRows);
    });
};


module.exports.scheduleOne = function (req, res) {
    let name = req.params.id;
    const sql = "SELECT * FROM schedule WHERE soldier_name = $1";
    conn.query(sql, [name], function (err, data) {
        if (err) {
            console.error('Error fetching schedule:', err);
            return res.status(500).send('Internal Server Error');
        }
        if (data.length == 0) {
            res.status(404).send('Військового з таким іменем не знайдено');
        } else {
            const formattedRows = data.rows.map(row => ({ 
                ...row,
                date: row.date.toISOString().split('T')[0] // Форматування дати
            }));
            
            res.render('schedule', { title: 'Duty Schedule', soldiers: formattedRows });
            //res.json(formattedRows);
        }
    });
}



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
        soldiers.soldiers.forEach((soldier) => {
            soldier.unitDuties = 0;
            soldier.outsideDuties = 0;
            soldier.lastDuty = null; // Останнє чергування
            soldier.weekendWeeks = []; // Тижні чергувань у вихідні
        });

        for (let i = 1; i <= daysInMonth; i++) {
            const rawDate = new Date(year, month, i);
            //const date = rawDate.toISOString().split('T')[0];
            const date = `${rawDate.getFullYear()}-${(rawDate.getMonth() + 1)
                .toString()
                .padStart(2, '0')}-${rawDate.getDate().toString().padStart(2, '0')}`;

            const isWeekend = weekendDays.includes(date);

            // Список доступних солдатів для чергувань
            const availableSoldiers = soldiers.soldiers.filter((soldier) => {
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
            const unitDutySoldier = availableSoldiers.find((soldier) => soldier.unitDuties < 5);
            if (unitDutySoldier) {
                duties.push({ date, soldier: unitDutySoldier.name, type: 'У частині' });
                unitDutySoldier.unitDuties++;
                unitDutySoldier.lastDuty = { date, type: 'У частині' };
                availableSoldiers.splice(unitDutySoldier.name, 1);
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

        // Записуємо в базу
        const sql = "INSERT INTO schedule (date, soldier_name, type) VALUES ($1, $2, $3)";
        for (const duty of duties) {
            const dateOnly = duty.date.split('T')[0]; // Якщо `duty.date` має формат ISO, наприклад, `2024-11-17T00:00:00.000Z`
            //console.log(dateOnly);
            await conn.query(sql, [dateOnly, duty.soldier, duty.type]);
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

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

