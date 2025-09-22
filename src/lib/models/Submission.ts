import mongoose from 'mongoose'

const SubmissionSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form' },
  response: Object, // The filled (submitted) data JSON
  createdAt: { type: Date, default: Date.now },
})
export default mongoose.models.Submission ||
  mongoose.model('Submission', SubmissionSchema)
