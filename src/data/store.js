import { v4 as uuidv4 } from 'uuid';

// in-memory storage
const store = {
  users: new Map(),
  categories: new Map(),
  events: new Map(),
  reminders: new Map()
};

// Clear methods for testing
const clearMethods = {
  clear: () => {
    store.users.clear();
    store.categories.clear();
    store.events.clear();
    store.reminders.clear();
  }
};

// user methods
export const users = {
  ...clearMethods,
  create: (email, hashedPassword) => {
    const id = uuidv4();
    const user = { id, email, hashedPassword };
    store.users.set(id, user);
    return user;
  },
  findByEmail: (email) => {
    return Array.from(store.users.values()).find(user => user.email === email);
  },
  findById: (id) => {
    return store.users.get(id);
  }
};

// category methods
export const categories = {
  ...clearMethods,
  create: (data) => {
    const id = uuidv4();
    const category = { id, ...data, createdAt: new Date() };
    store.categories.set(id, category);
    return category;
  },
  findByUserId: (userId) => {
    return Array.from(store.categories.values())
      .filter(category => category.userId === userId);
  },
  findById: (id) => {
    return store.categories.get(id);
  }
};

// event methods
export const events = {
  ...clearMethods,
  create: (data) => {
    const id = uuidv4();
    const event = { id, ...data, createdAt: new Date() };
    store.events.set(id, event);
    return event;
  },
  findByUserId: (userId) => {
    return Array.from(store.events.values())
      .filter(event => event.userId === userId)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  },
  findById: (id) => {
    return store.events.get(id);
  },
  update: (id, data) => {
    const event = store.events.get(id);
    if (!event) return null;
    const updated = { ...event, ...data };
    store.events.set(id, updated);
    return updated;
  },
  delete: (id) => {
    return store.events.delete(id);
  }
};

// reminder methods
export const reminders = {
  ...clearMethods,
  create: (data) => {
    const id = uuidv4();
    const reminder = { id, ...data, processed: false, createdAt: new Date() };
    store.reminders.set(id, reminder);
    return reminder;
  },
  findByUserId: (userId) => {
    return Array.from(store.reminders.values())
      .filter(reminder => reminder.userId === userId)
      .sort((a, b) => new Date(a.reminderTime) - new Date(b.reminderTime));
  },
  findUpcoming: () => {
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);
    
    return Array.from(store.reminders.values())
      .filter(reminder => {
        const reminderTime = new Date(reminder.reminderTime);
        return !reminder.processed &&
               reminderTime >= now &&
               reminderTime <= fiveMinutesFromNow;
      });
  },
  markProcessed: (id) => {
    const reminder = store.reminders.get(id);
    if (reminder) {
      reminder.processed = true;
      store.reminders.set(id, reminder);
    }
  }
};