const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    unique: true,
  },

  type:{
    type:String,
    required:true,
    default:"fruits",
    enum: ["fruits", "personal"]
  },
 
  content: {
    title: {
      type:String,
      default:""
    },
    pText:{  //text in <p></p>
        type:String,
        default:""
    }

  },

  outgoingLinks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Page'
  }],

  incomingLinks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Page'
  }],

  pageRank:{
    type:Number
  }
});

const Page = mongoose.model('Page', pageSchema);
pageSchema.index({ 'content.pText': 'text' });

module.exports = Page;
