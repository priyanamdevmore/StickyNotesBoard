const mongoose = require("mongoose");

main().then(() => {
  console.log("Connection successful!")
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/Board');
}

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        default: "New Note"
    },
    content: {
        type: String,
        required: true
    },
    color: {
        type: String,
        default: "#f5f7fa"
    },
    position: {
        x: {
            type: Number,
            default: 100
        },
        y: {
            type: Number,
            default: 100
        }
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const note = mongoose.model("Note", noteSchema);