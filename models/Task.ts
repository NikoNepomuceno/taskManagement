import mongoose, { Document, Schema } from 'mongoose'

export interface IFileAttachment {
  name: string
  url: string
  size: number
  type: string
}

export interface ITask extends Document {
  title: string
  description?: string
  completed: boolean
  dueDate?: Date
  startDate?: Date
  endDate?: Date
  priority: 'low' | 'medium' | 'high'
  color?: string
  attachments: IFileAttachment[]
  userId: mongoose.Types.ObjectId
  isDeleted: boolean
  deletedAt?: Date
  order: number
  createdAt: Date
  updatedAt: Date
}

const FileAttachmentSchema = new Schema<IFileAttachment>({
  name: { type: String, required: true },
  url: { type: String, required: true },
  size: { type: Number, required: true },
  type: { type: String, required: true },
})

const TaskSchema = new Schema<ITask>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  dueDate: {
    type: Date,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  color: {
    type: String,
    default: '#3b82f6',
  },
  attachments: [FileAttachmentSchema],
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
  },
  order: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
})

// Index for efficient queries
TaskSchema.index({ userId: 1, completed: 1 })
TaskSchema.index({ userId: 1, dueDate: 1 })
TaskSchema.index({ userId: 1, isDeleted: 1 })
TaskSchema.index({ deletedAt: 1 })
TaskSchema.index({ userId: 1, order: 1 })

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema)
