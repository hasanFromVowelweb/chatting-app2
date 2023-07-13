import mongoose from "mongoose";
import { stringify } from "querystring";

const messageSchema = mongoose.Schema({
    message: String,
    name: String,
    timestamp: String,
    recieved: Boolean
})

export default mongoose.model('Messagecontent', messageSchema)