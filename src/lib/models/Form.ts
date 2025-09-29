import mongoose from 'mongoose'

const FormSchema = new mongoose.Schema({
  title: String,
  description: String,
  schema: Object, // Thesys UI spec JSON
  createdAt: { type: Date, default: Date.now },
})
export default mongoose.models.Form || mongoose.model('Form', FormSchema)
