const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    unique: true,
  },
 
  content: {
    title: String,
    pText:{  //text in <p></p>
        type:String,
        default:""
    }

  },

  outgoingLinks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Page', // Reference to the Page model
  }],

  incomingLinks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Page', // Reference to the Page model
  }],
});

const Page = mongoose.model('Page', pageSchema);

module.exports = Page;
