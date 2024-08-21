import { model, Schema } from "mongoose";

const subTaskSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  isCompleted: {
    type: Boolean,
    // required: true,
    default: false,
  },
});
export const taskSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    required: true,
    // enum: ["Todo", "Doing", "Done"],
    default: "Todo",
  },
  subtasks: {
    type: [subTaskSchema],
    required: false,
  },
});

const Task = model("task", taskSchema, "tasks");

export default Task;

/*
    create a user schema & model
    create routes for sign up / log in

        youll need to...

            frontend

            fetch('...', {
                method: 'POST',
                body: JSON.stringify({
                    username: 'doug',
                    password: '12345
                })
            })

            backend

            app.post('...', () => {})
*/
