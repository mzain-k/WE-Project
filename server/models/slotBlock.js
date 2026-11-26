import mongoose, { Mongoose } from "mongoose"

const slotBlockSchema = new mongoose.Schema(
    {
        date: {
            type: String,
            required: true,
        },
        slotStart: {
            type: Number,
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",  
        },
        reason: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    },
);

slotBlockSchema.index(
    {
        date: 1,
        slotStart: 1,
    },
    {
        unique: 1,
    },
);

const SlotBlock = mongoose.model("SlotBlock", slotBlockSchema);

export default SlotBlock;