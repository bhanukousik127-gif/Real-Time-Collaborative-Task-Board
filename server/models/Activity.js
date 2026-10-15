import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true, // e.g. "created card", "moved card", "updated list", "added comment"
    },
    details: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const ActivityModel = mongoose.models.Activity || mongoose.model('Activity', activitySchema);
export default ActivityModel;
