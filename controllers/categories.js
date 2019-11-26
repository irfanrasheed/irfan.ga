// Categories controllers




//Dependencies
const Category = require("../models/Category");



//constainer of the module
const lib ={};


lib.getAll = (req,res) => {
    Category.find({}).then( categories => {
        res.status(200).send(categories)
    }).catch( ex => {
        console.log(ex);
        return res.sendStatus(404);
    })
}

lib.create = async (req,res) => {
    let { id , description, name } = req.body;
    let { thumbnail , gallery } = req.files;
    thumbnail = thumbnail instanceof Array && thumbnail.length >0 ? thumbnail : false;
    gallery = gallery instanceof Array && gallery.length >0 ? gallery : false;
    id = typeof id == 'string' && id.length > 0 ? id : false;
    name = typeof name == 'string' && name.length > 0 ? name : false;
    description = typeof description == 'string' && description.length > 0 ? description : false;
    console.log(!(thumbnail && id && gallery && description && name))
    if(!(thumbnail && id && gallery && description && name)) return  res.status(400).send({error : "Missing required fields"});
    const thumbnailPath ='/uploads/' + thumbnail[0].filename;
    try {
        const cate = await Category.findOne({id})
       if(cate) return res.status(400).send({error: "A category with that id already exist"})

    }
    catch(ex){
        console.log("Creating a new category...")
    }
    

    const galleryPaths = [];
    for ( var i = 0; i < gallery.length; i++){
        galleryPaths.push( '/uploads/' +gallery[i].filename)
    }
    description = description.split(",");
    name = name.split(",");
    var category = { id,description,name,thumbnail : thumbnailPath, gallery : galleryPaths }
    Category.create(category).then(category => {
        return res.sendStatus(200)
    }).catch ( ex => {
        console.log(ex)
        return res.sendStatus(500)
    })
}

lib.update = (req,res) => {
    let { id , description } = req.body;
    let { thumbnail , gallery } = req.files;
    if( id.length ) return res.status(400).send({error : "Missing required fields"});
    if( !(thumbnail.length > 0 || gallery.length > 0 || description.length > 0) ) return  res.status(400).send({error : "Missing fields to update"});
    var category = {}
    if(thumbnail.length > 0 ) {
        const thumbnailPath = thumbnail[0].path;
        category.thumbnail = thumbnailPath;
    }

    if( gallery.length > 0){
        const galleryPaths = [];
        for ( var i = 0; i < gallery.length; i++){
            galleryPaths.push(gallery[i].path)
        }
        category.gallery = galleryPaths;
    }
    if( description.length > 0 ){
        category.description  = description;
    }

    Category.findOneAndUpdate({id:id},category).then( () => {
        return res.sendStatus(200)
    }).catch( ex => {
        console.log(ex);
        return res.sendStatus(500)
    })
}

lib.get = (req,res) => {
  let { id }  = req.params;
  if( id.length <=0 )  return res.status(400).send({error : "Missing required fields"});
  Category.findOne({id : id }).then( category => {
    if(!category) return res.sendStatus(404);
    return res.status(200).send(category);
  }).catch( ex => {
    console.log(ex);
    return res.sendStatus(404)
})
}

lib.delete = (req,res) => {
    let { id }  = req.params;
    if( id.length <=0 )  return res.status(400).send({error : "Missing required fields"});
    Category.findOneAndDelete({id : id }).then( category => {
      res.status(200).send(category.toObject());
    }).catch( ex => {
      console.log(ex);
      return res.sendStatus(404)
  })
}



module.exports = lib