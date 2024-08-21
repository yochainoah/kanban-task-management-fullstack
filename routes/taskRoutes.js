import Task from "../models/Task.js";
import Board from "../models/Board.js";
import { Router } from "express";

const taskRouter = Router();

/*
      4xx   ->  client errors
      5xx   ->  server errors
*/

//Route for creating a Task
taskRouter.post("/addTask", async (req, res) => {
  try {
    console.log("addTask body:", req.body);
    const { title, description, status, subtasks, boardId } = req.body;

    // boardId required so we can add the task to the board
    if (!boardId) {
      return res.status(400).send("Missing boardId");
    }

    // find the board
    const targetBoard = await Board.findById(boardId);
    if (!targetBoard) {
      return res.status(404).send("Board not found");
    }

    const newTask = await Task.create({ title, description, status, subtasks });

    // find the column and push the new taskId to it
    const columnIndex = targetBoard.columns.findIndex((c) => c.name === status);
    targetBoard.columns[columnIndex].tasks.push(newTask._id);
    await targetBoard.save();

    // https://mongoosejs.com/docs/models.html
    // https://mongoosejs.com/docs/api/model.html
    res.json(newTask);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Error");
  }
});

// get all tasks from db
taskRouter.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find({});

    return res.status(200).json(tasks);
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ message: err.message });
  }
});

// get a task from db
taskRouter.get("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    return res.status(200).json(task);
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ message: err.message });
  }
});

// Route for Update Task
taskRouter.put("/tasks/:id", async (req, res) => {
  try {
    if (!req.body.title || !req.body.status) {
      return res.status(400).send({
        message: "Send all required fields: title, status",
      });
    }
    const { title, status, subtasks, description, boardId } = req.body;
    const { id } = req.params;

    // boardId required so we can add the task to the board
    if (!boardId) {
      return res.status(400).send("Missing boardId");
    }

    // find the board
    const targetBoard = await Board.findById(boardId);
    if (!targetBoard) {
      return res.status(404).send("Board not found");
    }

    // find the task
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // If the status has changed, move the task to the new column
    if (task.status !== status) {
      // Remove the task from the old column
      const oldColumnIndex = targetBoard.columns.findIndex(
        (c) => c.name === task.status
      );
      if (oldColumnIndex > -1) {
        targetBoard.columns[oldColumnIndex].tasks = targetBoard.columns[
          oldColumnIndex
        ].tasks.filter((taskId) => taskId.toString() !== id);
      }

      // Add the task to the new column
      const newColumnIndex = targetBoard.columns.findIndex(
        (c) => c.name === status
      );
      if (newColumnIndex > -1) {
        targetBoard.columns[newColumnIndex].tasks.push(id);
      } else {
        return res.status(400).send({ message: "Invalid status" });
      }

      // Save the updated board
      await targetBoard.save();
    }

    // Update the task
    task.title = title;
    task.status = status;
    task.subtasks = subtasks;
    task.description = description;
    await task.save();

    return res.status(200).send(task);
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ message: err.message });
  }
});
//Route for delete task
taskRouter.delete("/tasks", async (req, res) => {
  try {
    const { task, boardId } = req.body;
    const result = await Task.findByIdAndDelete(task._id);

    if (!result) {
      return res.status(404).json({ message: "task not found" });
    }
    
    const board = await Board.findById(boardId);
    let column = board.columns.find(c => c.name === task.status);
    let taskIndex = column.tasks.findIndex(t => t === task._id)
    column.tasks.splice(taskIndex, 1)
    await board.save();

    return res.status(200).send({ message: "Task deleted successfully" });
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ message: err.message });
  }
});

export default taskRouter;
