import cron from 'node-cron';
import { reminders, events } from '../data/store.js';

// function to check and process due reminders
const processReminders = async () => {
  try {
    const dueReminders = reminders.findUpcoming();

    // process each reminder
    for (const reminder of dueReminders) {
      const event = events.findById(reminder.eventId);
      if (event) {
        console.log(`Reminder for event: ${event.name}`);
      }
      
      reminders.markProcessed(reminder.id);
    }
  } catch (error) {
    console.error('Error processing reminders:', error);
  }
};

// start cron job to check reminders every minute
export const startReminderCron = () => {
  cron.schedule('* * * * *', processReminders);
};