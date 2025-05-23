import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '..', 'data', 'timesheets.json');

class Timesheet {
  static async getAll() {
    try {
      const data = await fs.promises.readFile(dataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading timesheets:', error);
      return [];
    }
  }

  static async getById(id) {
    try {
      const timesheets = await this.getAll();
      return timesheets.find(timesheet => timesheet.id === id) || null;
    } catch (error) {
      console.error('Error getting timesheet by id:', error);
      return null;
    }
  }

  static async create(timesheetData) {
    try {
      const timesheets = await this.getAll();
      
      const newTimesheet = {
        id: uuidv4(),
        ...timesheetData,
        createdAt: new Date().toISOString(),
      };
      
      timesheets.push(newTimesheet);
      
      await fs.promises.writeFile(dataPath, JSON.stringify(timesheets, null, 2));
      return newTimesheet;
    } catch (error) {
      console.error('Error creating timesheet:', error);
      throw error;
    }
  }

  static async update(id, updateData) {
    try {
      const timesheets = await this.getAll();
      const index = timesheets.findIndex(timesheet => timesheet.id === id);
      
      if (index === -1) {
        throw new Error('Timesheet not found');
      }
      
      timesheets[index] = {
        ...timesheets[index],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
      
      await fs.promises.writeFile(dataPath, JSON.stringify(timesheets, null, 2));
      return timesheets[index];
    } catch (error) {
      console.error('Error updating timesheet:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const timesheets = await this.getAll();
      const filteredTimesheets = timesheets.filter(timesheet => timesheet.id !== id);
      
      if (filteredTimesheets.length === timesheets.length) {
        throw new Error('Timesheet not found');
      }
      
      await fs.promises.writeFile(dataPath, JSON.stringify(filteredTimesheets, null, 2));
      return true;
    } catch (error) {
      console.error('Error deleting timesheet:', error);
      throw error;
    }
  }
}

export default Timesheet;