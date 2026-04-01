const Joi= require("joi");
module.exports.videoSchema= Joi.object({

    title: Joi.string().required(),
    description: Joi.string().required(),
    thumbnail: Joi.string().required(),
    url: Joi.string().required()
});

module.exports.commentSchema= Joi.object({
    comment:Joi.string().required()
});