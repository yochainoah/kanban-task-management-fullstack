import Board from "../models/Board.js";
import Task from "../models/Task.js";
import { Router } from "express";

const boardRouter = Router();

//Route for creating a Board
boardRouter.post("/addBoard", async (req, res) => {
  try {
    const { name, columns } = req.body;
    const newBoard = await Board.create({ name, columns });
    // https://mongoosejs.com/docs/models.html
    // https://mongoosejs.com/docs/api/model.html
    res.json(newBoard);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Error");
  }
});

boardRouter.post("/addManyBoards", async (req, res) => {
  try {
    const boards = [];
    for (let boardIndex = 0; boardIndex < req.body.length; boardIndex++) {
      const board = req.body[boardIndex];
      for (
        let columnIndex = 0;
        columnIndex < board.columns.length;
        columnIndex++
      ) {
        const column = board.columns[columnIndex];
        for (let taskIndex = 0; taskIndex < column.tasks.length; taskIndex++) {
          try {
            const task = column.tasks[taskIndex];
            if (!task.status) task.status = "Todo";
            const newTask = await Task.create(task);
            column.tasks[taskIndex] = newTask._id;
          } catch (err) {
            console.log("ERROR WHEN ADDING TASK");
            return res.status(400).json(err);
          }
        }
      }
      boards.push(board);
    }
    await Board.insertMany(boards);
    res.send("Success");
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ message: err.message });
  }
});

// get all boards from db
boardRouter.get("/boards", async (req, res) => {
  try {
    const boards = await Board.find({}).populate({
      path: "columns",
      populate: {
        path: "tasks",
        model: "task",
      },
    });

    return res
      .status(200)
      .json(boards.map((b) => b.toObject({ virtuals: true })));
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ message: err.message });
  }
});

// get a board from db
boardRouter.get("/boards/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const board = await Board.findById(id).populate({
      path: "columns",
      populate: {
        path: "tasks",
        model: "task",
      },
    });

    return res.status(200).json(board.toObject({ virtuals: true }));
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ message: err.message });
  }
});

// Route for Update a board
boardRouter.put("/boards/:boardId", async (req, res) => {
  try {
    const { boardId } = req.params;
    const { name, columns } = req.body;
    if (!boardId) {
      return res.status(400).send("Missing boardId");
    }

    // find the board
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).send("Board not found");
    }
    board.name = name;
    board.columns = columns;

    // Save the updated board
    await board.save();
    // Populate the columns and return the updated board
    const populatedBoard = await Board.findById(boardId).populate({
      path: "columns.tasks",
      model: "task", // Ensure 'task' is the correct model name
    });

    return res.status(200).send(populatedBoard);
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ message: err.message });
  }
});
//Route for delete board
boardRouter.delete("/boards/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Board.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: "board not found" });
    }

    return res.status(200).send({ message: "Board deleted successfully" });
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ message: err.message });
  }
});

export default boardRouter;
