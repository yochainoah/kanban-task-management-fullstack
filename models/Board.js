import { model, Schema } from "mongoose";

const columnSchema = new Schema({
  name: {
    type: String,
    // enum: ["Todo", "Doing", "Done"],
  },
  tasks: [
    {
      type: Schema.Types.ObjectId,
      ref: "task",
    },
  ],
});

const boardSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  columns: [columnSchema],
});

// https://mongoosejs.com/docs/tutorials/virtuals.html
boardSchema.virtual('statuses').get(function() {
  return this.columns.map(c => c.name)
})

const Board = model("board", boardSchema, "boards");

export default Board;
