import {model, Schema} from 'mongoose';
import bcrypt from "bcrypt";

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "user name is required!"]
  },
  password: {
    type: String,
    required: [true, "password is required!"]
  },
  email: {
    type: String,
    required: [true, " email is requirded for signup!"]
  },
  boards: [{
    type: Schema.Types.ObjectId,
    ref: 'board'
  }]
})
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
const User = model('user',userSchema);
export default User;